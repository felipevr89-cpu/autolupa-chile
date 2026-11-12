import { describe, it, expect } from 'vitest';
import { normalizeYearRange, defaultYearRange } from '../hooks/useCars';
import { carsData, catalogYears } from '../data/brands';

describe('rango de años del catálogo', () => {
  it('el rango por defecto cubre todos los años del catálogo', () => {
    const years = carsData.map(c => c.year);
    expect(defaultYearRange).toEqual([Math.min(...years), Math.max(...years)]);
  });

  it('migra el rango antiguo guardado (2020–2026) sin ocultar modelos 2027', () => {
    expect(normalizeYearRange([2020, 2026])).toEqual(catalogYears);
  });

  it('respeta un tope explícito anterior al año en curso', () => {
    expect(normalizeYearRange([2025, 2025])).toEqual([2025, 2025]);
  });
});
