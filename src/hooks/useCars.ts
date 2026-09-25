import { useState, useMemo, useCallback, useEffect } from 'react';
import { carsData } from '../data/brands';
import { Car, Filters, User } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const currentYear = new Date().getFullYear();
export const defaultYearRange: [number, number] = [currentYear - 6, currentYear];

const defaultFilters: Filters = {
  brand: [],
  type: [],
  fuel: [],
  seats: [],
  priceRange: [0, 500000000],
  transmission: [],
  traction: [],
  minAirbags: 0,
  origin_country: [],
  model: [],
  yearRange: defaultYearRange,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

async function loadFavoritesFromCloud(userId: string): Promise<number[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_preferences')
    .select('favorite_car_ids')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return (data.favorite_car_ids ?? []) as number[];
}

async function saveFavoritesToCloud(userId: string, carIds: number[]): Promise<void> {
  if (!supabase) return;
  await supabase.from('user_preferences').upsert({ user_id: userId, favorite_car_ids: carIds });
}

function favoritesKey(uid?: string): string {
  return uid ? `autolupa_favorites_${uid}` : 'autolupa_favorites';
}

export function useCars(user?: User | null) {
  const uid = user?.uid;
  const isConfiguredUser = !!uid && isSupabaseConfigured;
  const [filters, setFilters] = useState<Filters>(() => loadFromStorage('autolupa_filters', defaultFilters));
  const [compareList, setCompareList] = useState<Car[]>(() => loadFromStorage('autolupa_compare', []));
  const [favorites, setFavorites] = useState<number[]>(() => {
    const local = loadFromStorage<number[]>('autolupa_favorites', []);
    return local;
  });
  const [recentIds, setRecentIds] = useState<number[]>(() => loadFromStorage<number[]>('autolupa_recent', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isConfiguredUser || !uid) {
      setFavorites(loadFromStorage<number[]>(favoritesKey(), []));
      return;
    }

    let cancelled = false;
    const local = loadFromStorage<number[]>(favoritesKey(uid), []);
    setFavorites(local);

    loadFavoritesFromCloud(uid)
      .then((cloudIds) => {
        if (cancelled) return;
        if (cloudIds) {
          setFavorites(cloudIds);
          localStorage.setItem(favoritesKey(uid), JSON.stringify(cloudIds));
          return;
        }
        if (local.length > 0) {
          saveFavoritesToCloud(uid, local).catch(() => undefined);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [uid, isConfiguredUser]);

  const filteredCars = useMemo(() => {
    const result = carsData.filter((car) => {
      if (filters.brand.length > 0 && !filters.brand.includes(car.brand)) return false;
      if (filters.model.length > 0 && !filters.model.includes(car.model)) return false;
      if (filters.type.length > 0 && !filters.type.includes(car.type)) return false;
      if (filters.fuel.length > 0 && !filters.fuel.includes(car.fuel)) return false;
      if (filters.seats.length > 0 && !filters.seats.includes(car.seats)) return false;
      if (car.price < filters.priceRange[0] || car.price > filters.priceRange[1]) return false;
      if (filters.transmission.length > 0 && !filters.transmission.includes(car.transmission)) return false;
      if (filters.traction.length > 0 && !filters.traction.includes(car.traction)) return false;
      if (filters.minAirbags > 0 && (car.airbags ?? 0) < filters.minAirbags) return false;
      if (filters.origin_country.length > 0 && !filters.origin_country.includes(car.origin_country || '')) return false;

      if (debouncedSearchQuery) {
        const q = debouncedSearchQuery.toLowerCase();
        const match = car.brand.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (filters.yearRange[0] > defaultYearRange[0] || filters.yearRange[1] < defaultYearRange[1]) {
        if (car.year < filters.yearRange[0] || car.year > filters.yearRange[1]) return false;
      }

      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'brand':
        result.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
        break;
    }

    return result;
  }, [filters, debouncedSearchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCars = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filteredCars.slice(start, start + perPage);
  }, [filteredCars, safePage, perPage]);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('autolupa_filters', JSON.stringify(next));
      return next;
    });
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setCurrentPage(1);
    localStorage.removeItem('autolupa_filters');
  }, []);

  const addToCompare = useCallback((car: Car) => {
    setCompareList((prev) => {
      if (prev.length >= 3) return prev;
      if (prev.find((c) => c.id === car.id)) return prev;
      const next = [...prev, car];
      localStorage.setItem('autolupa_compare', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((carId: number) => {
    setCompareList((prev) => {
      const next = prev.filter((c) => c.id !== carId);
      localStorage.setItem('autolupa_compare', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    localStorage.removeItem('autolupa_compare');
  }, []);

  const toggleFavorite = useCallback((carId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId];
      const key = favoritesKey(isConfiguredUser ? uid : undefined);
      localStorage.setItem(key, JSON.stringify(next));
      if (isConfiguredUser && uid) {
        saveFavoritesToCloud(uid, next).catch(() => undefined);
      }
      return next;
    });
  }, [uid, isConfiguredUser]);

  const isFavorite = useCallback((carId: number) => favorites.includes(carId), [favorites]);

  const addRecent = useCallback((carId: number) => {
    setRecentIds((prev) => {
      const next = prev.filter((id) => id !== carId);
      next.unshift(carId);
      const trimmed = next.slice(0, 12);
      localStorage.setItem('autolupa_recent', JSON.stringify(trimmed));
      return trimmed;
    });
  }, []);

  const recentCars = useMemo(() => {
    const map = new Map(carsData.map((c) => [c.id, c]));
    return recentIds.map((id) => map.get(id)).filter((c): c is Car => !!c);
  }, [recentIds]);

  return {
    cars: paginatedCars,
    allCarsCount: filteredCars.length,
    totalPages,
    currentPage: safePage,
    setCurrentPage,
    allCars: carsData,
    filters,
    updateFilter,
    resetFilters,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    favorites,
    toggleFavorite,
    isFavorite,
    recentCars,
    addRecent,
  };
}