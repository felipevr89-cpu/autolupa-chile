import { slugify } from './carSlug';

export function brandSlug(brand: string): string {
  return slugify(brand);
}

export function legacyBrandSlug(brand: string): string {
  return brand.toLowerCase().replace(/\s+/g, '-');
}
