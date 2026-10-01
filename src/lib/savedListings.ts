import { useSyncExternalStore } from 'react';

export interface SavedListing {
  id: string;
  slug: string;
  title: string;
  price: number;
  savedAt: string;
}

export type SavedListingMap = Record<string, SavedListing>;

const STORAGE_KEY = 'autolupa_saved_listings';

let cache: SavedListingMap | null = null;
const listeners = new Set<() => void>();

function load(): SavedListingMap {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cache =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as SavedListingMap)
        : {};
  } catch {
    cache = {};
  }
  return cache;
}

function commit(next: SavedListingMap): SavedListingMap {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    cache = { ...next };
  }
  listeners.forEach((listener) => listener());
  return next;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface SavedListingInput {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
}

export function toSavedListing(listing: SavedListingInput): SavedListing {
  return {
    id: listing.id,
    slug: listing.slug,
    title: `${listing.brand} ${listing.model} ${listing.year}`,
    price: listing.price,
    savedAt: '',
  };
}

export function getSavedListings(): SavedListingMap {
  return load();
}

export function isListingSaved(id: string): boolean {
  return !!load()[id];
}

export function toggleSavedListing(listing: SavedListing): boolean {
  const current = load();
  if (current[listing.id]) {
    const next = { ...current };
    delete next[listing.id];
    commit(next);
    return false;
  }
  commit({
    ...current,
    [listing.id]: { ...listing, savedAt: new Date().toISOString() },
  });
  return true;
}

export function updateSavedPrice(id: string, price: number): void {
  const current = load();
  const entry = current[id];
  if (!entry || entry.price === price) return;
  commit({ ...current, [id]: { ...entry, price } });
}

export function removeSavedListing(id: string): void {
  const current = load();
  if (!current[id]) return;
  const next = { ...current };
  delete next[id];
  commit(next);
}

export function resetSavedListings(): void {
  cache = {};
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

export function useSavedListings(): SavedListingMap {
  return useSyncExternalStore(subscribe, getSavedListings, getSavedListings);
}

export function useIsListingSaved(id: string): boolean {
  return useSyncExternalStore(subscribe, () => isListingSaved(id), () => false);
}
