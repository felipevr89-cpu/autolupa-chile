import { track } from './analytics';

export interface GapEntry {
  query: string;
  source: 'smartask' | 'hero' | 'brand';
  at: string;
}

const STORAGE_KEY = 'autolupa_search_gaps';
const MAX_ENTRIES = 200;

export function recordGap(query: string, source: GapEntry['source'] = 'smartask'): void {
  const cleaned = query.trim();
  if (!cleaned) return;
  try {
    const current = readGaps();
    const next = [{ query: cleaned, source, at: new Date().toISOString() }, ...current].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  track('brand_search_miss', { query: cleaned, source });
}

export function readGaps(): GapEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as GapEntry[] : [];
  } catch {
    return [];
  }
}
