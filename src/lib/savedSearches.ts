import { formatPrice } from '../data/brands';
import {
  USED_FUEL_OPTIONS,
  USED_TRANSMISSION_OPTIONS,
  UsedListingFilters,
} from '../data/usedListings';

export interface SavedSearch {
  id: string;
  name: string;
  filters: UsedListingFilters;
  createdAt: string;
  lastCount: number;
}

const STORAGE_KEY = 'autolupa_saved_searches';
const ALERTS_KEY = 'autolupa_search_alerts';

export const MAX_SAVED_SEARCHES = 8;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed === null || parsed === undefined ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function loadSavedSearches(): SavedSearch[] {
  const stored = read<SavedSearch[]>(STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.filter(
    (search) =>
      search &&
      typeof search.id === 'string' &&
      typeof search.name === 'string' &&
      search.filters &&
      typeof search.filters === 'object',
  );
}

export function persistSavedSearches(searches: SavedSearch[]): void {
  write(STORAGE_KEY, searches);
}

const SEARCH_FIELDS = [
  'search',
  'brand',
  'region',
  'fuel',
  'transmission',
  'minYear',
  'maxYear',
  'minPrice',
  'maxPrice',
  'maxMileage',
] as const;

export function hasActiveFilters(filters: UsedListingFilters): boolean {
  return SEARCH_FIELDS.some((field) => String(filters[field] ?? '').trim() !== '');
}

function filterLabel(value: string, options: ReadonlyArray<{ value: string; label: string }>): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function buildSearchName(filters: UsedListingFilters): string {
  const parts: string[] = [];
  if (filters.brand) parts.push(filters.brand);
  if (filters.search.trim()) parts.push(`«${filters.search.trim()}»`);
  if (filters.region) parts.push(filters.region);
  if (filters.fuel) parts.push(filterLabel(filters.fuel, USED_FUEL_OPTIONS));
  if (filters.transmission) parts.push(filterLabel(filters.transmission, USED_TRANSMISSION_OPTIONS));

  const minPrice = Number(filters.minPrice);
  const maxPrice = Number(filters.maxPrice);
  if (minPrice && maxPrice) parts.push(`${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`);
  else if (maxPrice) parts.push(`hasta ${formatPrice(maxPrice)}`);
  else if (minPrice) parts.push(`desde ${formatPrice(minPrice)}`);

  if (filters.minYear || filters.maxYear) {
    parts.push(`${filters.minYear || '…'} – ${filters.maxYear || 'actual'}`);
  }
  if (filters.maxMileage) parts.push(`hasta ${Number(filters.maxMileage).toLocaleString('es-CL')} km`);

  return parts.join(' · ') || 'Todos los avisos';
}

export function getSearchId(filters: UsedListingFilters): string {
  const payload = SEARCH_FIELDS.map((field) => `${field}:${String(filters[field] ?? '')}`).join('|');
  let hash = 0;
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash * 31 + payload.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export type AddSearchResult = 'added' | 'duplicate' | 'limit' | 'empty';

export function addSearch(filters: UsedListingFilters, currentTotal: number): AddSearchResult {
  if (!hasActiveFilters(filters)) return 'empty';
  const searches = loadSavedSearches();
  const id = getSearchId(filters);
  if (searches.some((search) => search.id === id)) return 'duplicate';
  if (searches.length >= MAX_SAVED_SEARCHES) return 'limit';

  persistSavedSearches([
    {
      id,
      name: buildSearchName(filters),
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      lastCount: Math.max(0, currentTotal),
    },
    ...searches,
  ]);
  return 'added';
}

export function removeSearch(id: string): SavedSearch[] {
  const next = loadSavedSearches().filter((search) => search.id !== id);
  persistSavedSearches(next);
  return next;
}

export function markSearchSeen(id: string, count: number): SavedSearch[] {
  const next = loadSavedSearches().map((search) =>
    search.id === id ? { ...search, lastCount: Math.max(0, count) } : search,
  );
  persistSavedSearches(next);
  return next;
}

export function getNewCount(search: SavedSearch, currentCount: number): number {
  return Math.max(0, currentCount - search.lastCount);
}

export function readAlertCount(): number {
  const value = read<number>(ALERTS_KEY, 0);
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function writeAlertCount(total: number): void {
  write(ALERTS_KEY, Math.max(0, Math.floor(total)));
}

export function resetSavedSearches(): void {
  persistSavedSearches([]);
  writeAlertCount(0);
}
