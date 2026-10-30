import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { carsData } from '../data/brands';
import { Car, Filters, User } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { track } from '../lib/analytics';

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

function parseFilters(params: URLSearchParams): Filters {
  const list = (key: string) => (params.get(key) ?? '').split(',').map(value => value.trim()).filter(Boolean);
  const numbers = (key: string) => list(key).map(Number).filter(Number.isFinite);
  const pair = (key: string): [number, number] | null => {
    const [min, max] = (params.get(key) ?? '').split('-').map(Number);
    return Number.isFinite(min) && Number.isFinite(max) ? [min, max] : null;
  };
  const priceRange = pair('precio');
  const yearRange = pair('anio');

  return {
    ...defaultFilters,
    brand: list('marca'),
    model: list('modelo'),
    type: list('tipo'),
    fuel: list('combustible'),
    seats: numbers('asientos'),
    transmission: list('transmision'),
    traction: list('traccion'),
    origin_country: list('origen'),
    minAirbags: Number(params.get('airbags')) || 0,
    priceRange: priceRange ?? defaultFilters.priceRange,
    yearRange: yearRange ?? defaultFilters.yearRange,
  };
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const hasUrlFilters = searchParams.toString().length > 0;
  const [filters, setFilters] = useState<Filters>(() =>
    hasUrlFilters ? parseFilters(searchParams) : loadFromStorage('autolupa_filters', defaultFilters),
  );
  const [compareList, setCompareList] = useState<Car[]>(() => loadFromStorage('autolupa_compare', []));
  const [favorites, setFavorites] = useState<number[]>(() => {
    const local = loadFromStorage<number[]>('autolupa_favorites', []);
    return local;
  });
  const [recentIds, setRecentIds] = useState<number[]>(() => loadFromStorage<number[]>('autolupa_recent', []));
  const [searchQuery, setSearchQueryState] = useState(() => searchParams.get('q') ?? '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortByState] = useState(() => searchParams.get('orden') ?? 'price-asc');
  const [currentPage, setCurrentPageState] = useState(() => {
    const page = Number(searchParams.get('pagina'));
    return Number.isInteger(page) && page > 0 ? page : 1;
  });
  const perPage = 15;
  const skipUrlSync = useRef(true);
  const lastParams = useRef(searchParams.toString());

  const writeParams = useCallback((nextFilters: Filters, nextSearch: string, nextSort: string, nextPage: number) => {
    const params = new URLSearchParams();
    const setList = (key: string, values: string[]) => {
      if (values.length > 0) params.set(key, values.join(','));
    };
    setList('marca', nextFilters.brand);
    setList('modelo', nextFilters.model);
    setList('tipo', nextFilters.type);
    setList('combustible', nextFilters.fuel);
    setList('asientos', nextFilters.seats.map(String));
    setList('transmision', nextFilters.transmission);
    setList('traccion', nextFilters.traction);
    setList('origen', nextFilters.origin_country);
    if (nextFilters.minAirbags > 0) params.set('airbags', String(nextFilters.minAirbags));
    if (nextFilters.priceRange[0] !== defaultFilters.priceRange[0] || nextFilters.priceRange[1] !== defaultFilters.priceRange[1]) {
      params.set('precio', `${nextFilters.priceRange[0]}-${nextFilters.priceRange[1]}`);
    }
    if (nextFilters.yearRange[0] !== defaultYearRange[0] || nextFilters.yearRange[1] !== defaultYearRange[1]) {
      params.set('anio', `${nextFilters.yearRange[0]}-${nextFilters.yearRange[1]}`);
    }
    if (nextSearch.trim()) params.set('q', nextSearch.trim());
    if (nextSort !== 'price-asc') params.set('orden', nextSort);
    if (nextPage > 1) params.set('pagina', String(nextPage));
    const next = params.toString();
    if (next === lastParams.current) return;
    lastParams.current = next;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
    setCurrentPageState(1);
  }, []);

  const setSortBy = useCallback((value: string) => {
    setSortByState(value);
    setCurrentPageState(1);
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    writeParams(filters, searchQuery, sortBy, currentPage);
  }, [filters, searchQuery, sortBy, currentPage, writeParams]);

  useEffect(() => {
    const next = searchParams.toString();
    if (next === lastParams.current) return;
    lastParams.current = next;
    setFilters(next ? parseFilters(searchParams) : defaultFilters);
    setSearchQueryState(searchParams.get('q') ?? '');
    setSortByState(searchParams.get('orden') ?? 'price-asc');
    setCurrentPageState(Number(searchParams.get('pagina')) || 1);
  }, [searchParams]);

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
  }, [setCurrentPage]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setCurrentPage(1);
    localStorage.removeItem('autolupa_filters');
  }, [setCurrentPage, setSearchQuery]);

  const addToCompare = useCallback((car: Car) => {
    if (compareList.length < 3 && !compareList.some((c) => c.id === car.id)) {
      track('Compare', { model: `${car.brand} ${car.model}` });
    }
    setCompareList((prev) => {
      if (prev.length >= 3) return prev;
      if (prev.find((c) => c.id === car.id)) return prev;
      const next = [...prev, car];
      localStorage.setItem('autolupa_compare', JSON.stringify(next));
      return next;
    });
  }, [compareList]);

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
    track('Favorite', { accion: favorites.includes(carId) ? 'quitar' : 'guardar' });
    setFavorites((prev) => {
      const next = prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId];
      const key = favoritesKey(isConfiguredUser ? uid : undefined);
      localStorage.setItem(key, JSON.stringify(next));
      if (isConfiguredUser && uid) {
        saveFavoritesToCloud(uid, next).catch(() => undefined);
      }
      return next;
    });
  }, [uid, isConfiguredUser, favorites]);

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