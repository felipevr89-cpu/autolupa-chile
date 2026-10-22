import type { Car } from '../types';

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' y ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function carSlug(car: Pick<Car, 'id' | 'brand' | 'model' | 'year'>): string {
  return `${car.id}-${slugify(car.brand)}-${slugify(car.model)}-${car.year}`;
}

export function carPath(car: Pick<Car, 'id' | 'brand' | 'model' | 'year'>): string {
  return `/auto/${carSlug(car)}`;
}

export function carIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)(?:-|$)/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}
