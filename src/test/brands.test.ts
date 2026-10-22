import { describe, it, expect } from 'vitest';
import {
  carsData,
  brands,
  formatPrice,
  getTypeLabel,
  getFuelLabel,
} from '../data/brands';

describe('brands data helpers', () => {
  it('formatPrice formats CLP with es-CL locale', () => {
    expect(formatPrice(12345678)).toBe('$12.345.678');
    expect(formatPrice(0)).toBe('$0');
  });

  it('getTypeLabel maps keys to Spanish labels', () => {
    expect(getTypeLabel('suv')).toBe('SUV');
    expect(getTypeLabel('hatchback')).toBe('Hatchback');
    expect(getTypeLabel('pickup')).toBe('Pick-up');
  });

  it('getFuelLabel maps keys to Spanish labels', () => {
    expect(getFuelLabel('electrico')).toBe('Eléctrico');
    expect(getFuelLabel('hibrido_enchufable')).toBe('Híbrido Enchufable');
  });
});

describe('catalog integrity', () => {
  it('has a large, complete catalog without deletions', () => {
    expect(carsData.length).toBeGreaterThanOrEqual(600);
    expect(brands.length).toBeGreaterThanOrEqual(95);
  });

  it('every car has required fields and valid values', () => {
    for (const c of carsData) {
      expect(c.brand.length).toBeGreaterThan(0);
      expect(c.model.length).toBeGreaterThan(0);
      expect(c.price).toBeGreaterThan(0);
      expect(['sedan', 'suv', 'pickup', 'hatchback', 'minivan', 'wagon', 'coupe', 'convertible']).toContain(c.type);
      expect(['gasolina', 'diesel', 'electrico', 'hibrido', 'hibrido_enchufable']).toContain(c.fuel);
      expect(['4x2', '4x4', 'awd']).toContain(c.traction);
      expect(c.seats).toBeGreaterThan(0);
    }
  });

  it('has unique ids across the catalog', () => {
    const ids = carsData.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the base price equal to the cheapest published version', () => {
    for (const c of carsData) {
      expect(c.versions.length).toBeGreaterThan(0);
      const cheapest = Math.min(...c.versions.map((v) => v.price));
      expect(c.price).toBe(cheapest);
    }
  });

  it('keeps list prices and bonuses consistent when present', () => {
    for (const c of carsData) {
      if (c.price_list != null) expect(c.price_list).toBeGreaterThanOrEqual(c.price);
      if (c.price_list != null && c.price_bonus != null) {
        expect(c.price_bonus).toBe(c.price_list - c.price);
      }
      for (const v of c.versions) {
        if (v.price_list != null) expect(v.price_list).toBeGreaterThanOrEqual(v.price);
        if (v.price_list != null && v.price_bonus != null) {
          expect(v.price_bonus).toBe(v.price_list - v.price);
        }
      }
    }
  });

  it('applies enrichment: some EVs have range/battery and models have sourced safety ratings', () => {
    const modelY = carsData.find((c) => c.brand === 'Tesla' && c.model === 'Model Y');
    expect(modelY?.electric_range_km).toBeGreaterThan(0);
    expect(modelY?.battery_kwh).toBeGreaterThan(0);

    const withRatings = carsData.filter((c) => (c.safety_ratings ?? []).length > 0);
    expect(withRatings.length).toBeGreaterThan(5);
    for (const c of withRatings) {
      for (const r of c.safety_ratings ?? []) {
        expect(r.program.length).toBeGreaterThan(0);
        expect(r.stars).toBeGreaterThanOrEqual(0);
        expect(r.stars).toBeLessThanOrEqual(5);
        expect(r.year).toBeGreaterThan(2000);
        expect(r.source).toMatch(/^https?:\/\//);
      }
    }
  });

  it('electric cars never report fuel consumption in km/L or a fuel tank', () => {
    const evsWithFuelData = carsData.filter(
      (c) =>
        c.fuel === 'electrico' &&
        (c.fuel_consumption_mixed_km_l ||
          c.fuel_consumption_city_km_l ||
          c.fuel_consumption_highway_km_l ||
          c.fuel_tank_liters)
    );
    expect(evsWithFuelData).toHaveLength(0);
  });
});
