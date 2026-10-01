import { Car } from '../types';

export interface PriceWatchEntry {
  price: number;
  alert: boolean;
}

export type PriceWatchMap = Record<number, PriceWatchEntry>;

export interface PriceAlert {
  carId: number;
  previous: number;
  current: number;
}

const STORAGE_KEY = 'autolupa_price_watch';

export function readPriceWatch(): PriceWatchMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as PriceWatchMap) : {};
  } catch {
    return {};
  }
}

function writePriceWatch(map: PriceWatchMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    return;
  }
}

export function syncPriceWatch(favorites: Car[]): PriceAlert[] {
  const stored = readPriceWatch();
  const next: PriceWatchMap = {};
  const alerts: PriceAlert[] = [];

  for (const car of favorites) {
    const entry = stored[car.id];
    if (!entry) {
      next[car.id] = { price: car.price, alert: false };
      continue;
    }
    if (car.price < entry.price) {
      next[car.id] = { price: entry.price, alert: true };
      alerts.push({ carId: car.id, previous: entry.price, current: car.price });
    } else if (car.price > entry.price) {
      next[car.id] = { price: car.price, alert: false };
    } else {
      next[car.id] = { price: entry.price, alert: false };
    }
  }

  writePriceWatch(next);
  return alerts;
}

export function acknowledgePriceAlert(carId: number, currentPrice: number): void {
  const stored = readPriceWatch();
  const entry = stored[carId];
  if (!entry) return;
  writePriceWatch({ ...stored, [carId]: { price: currentPrice, alert: false } });
}
