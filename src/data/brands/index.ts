import type { Car } from '../../types';
import { enrichment } from '../enrichment';

export interface BrandData {
  brand: string;
  brandUrl: string;
  models: Car[];
}

const brandFiles = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: BrandData }>;

export const allBrands: BrandData[] = Object.values(brandFiles)
  .map(m => m.default)
  .sort((a, b) => a.brand.localeCompare(b.brand, 'es'));

function applyEnrichment(car: Car): Car {
  const extra = enrichment[`${car.brand}|${car.model}`];
  if (!extra) return car;
  return {
    ...car,
    electric_range_km: car.electric_range_km ?? extra.electric_range_km,
    battery_kwh: car.battery_kwh ?? extra.battery_kwh,
    safety_ratings:
      car.safety_ratings && car.safety_ratings.length > 0
        ? car.safety_ratings
        : extra.safety_ratings,
  };
}

export const carsData: Car[] = allBrands.flatMap(b => b.models.map(applyEnrichment));

const catalogYearList = carsData.map(c => c.year);
export const catalogYears: [number, number] = [Math.min(...catalogYearList), Math.max(...catalogYearList)];

export const brandUrls: Record<string, string> = Object.fromEntries(
  allBrands.map(b => [b.brand, b.brandUrl])
);

export function getBrandUrl(brand: string): string {
  return brandUrls[brand] || '#';
}

export const brands = [...new Set(carsData.map(c => c.brand))].sort((a, b) => a.localeCompare(b, 'es'));
export const carTypes = [...new Set(carsData.map(c => c.type))];
export const fuelTypes = [...new Set(carsData.map(c => c.fuel))];
export const transmissions = [...new Set(carsData.map(c => c.transmission))];
export const tractions = [...new Set(carsData.map(c => c.traction))];
export const originCountries = [...new Set(carsData.map(c => c.origin_country).filter((c): c is string => !!c))].sort((a, b) => a.localeCompare(b, 'es'));

/** Marcas presentes en el catálogo que no se comercializan como nuevas en Chile */
export const BRANDS_NOT_SOLD_NEW_IN_CHILE = ['Acura', 'Buick', 'Chrysler', 'GMC', 'Infiniti', 'Lincoln'];

export function isBrandSoldNewInChile(brand: string): boolean {
  return !BRANDS_NOT_SOLD_NEW_IN_CHILE.includes(brand);
}

const modelsByBrandMap = new Map<string, string[]>();
for (const c of carsData) {
  if (!modelsByBrandMap.has(c.brand)) modelsByBrandMap.set(c.brand, []);
  const models = modelsByBrandMap.get(c.brand)!;
  if (!models.includes(c.model)) models.push(c.model);
}

export function getModelsByBrand(brand: string): string[] {
  return modelsByBrandMap.get(brand) || [];
}

export function getCarImages(car: Car): string[] {
  const imgs = [car.image_url];
  if (car.images && car.images.length > 0) {
    imgs.push(...car.images);
  }
  return imgs.filter(img => img && img.length > 0);
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CL')}`;
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    sedan: 'Sedán',
    suv: 'SUV',
    pickup: 'Pick-up',
    hatchback: 'Hatchback',
    minivan: 'Minivan',
    wagon: 'Wagon',
    coupe: 'Coupé / Deportivo',
    convertible: 'Convertible',
  };
  return labels[type] || type;
}

export function getFuelLabel(fuel: string): string {
  const labels: Record<string, string> = {
    gasolina: 'Gasolina',
    diesel: 'Diésel',
    electrico: 'Eléctrico',
    hibrido: 'Híbrido',
    hibrido_enchufable: 'Híbrido Enchufable',
  };
  return labels[fuel] || fuel;
}
