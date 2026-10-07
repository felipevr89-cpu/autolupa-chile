import { describe, it, expect } from 'vitest';
import { calculateTCO } from '../data/tco';
import { TYPICAL_MONTHLY_RATE, annualEffectiveRate } from '../data/credit';
import { Car } from '../types';

const mockCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2026,
  price: 18_000_000,
  type: 'sedan',
  fuel: 'gasolina',
  transmission: 'automatica',
  seats: 5,
  traction: '4x2',
  description: 'Sedán familiar',
  hp: 140,
  torque_nm: 175,
  airbags: 6,
  origin_country: 'Japón',
  fuel_consumption_mixed_km_l: 16,
  fuel_consumption_city_km_l: 14,
  fuel_consumption_highway_km_l: 18,
  fuel_tank_liters: 50,
  trunk_liters: 470,
  length_mm: 4630,
  wheelbase_mm: 2700,
  ground_clearance_mm: 135,
  engine_cc: 1800,
  warranty_years: 5,
  warranty_km: 100_000,
};

const mockEV: Car = {
  ...mockCar,
  id: 2,
  brand: 'Tesla',
  model: 'Model 3',
  fuel: 'electrico',
  battery_kwh: 60,
  electric_range_km: 510,
  fuel_consumption_mixed_km_l: undefined as unknown as number,
  fuel_consumption_city_km_l: undefined,
  fuel_consumption_highway_km_l: undefined,
  fuel_tank_liters: undefined,
};

const mockPHEV: Car = {
  ...mockCar,
  id: 3,
  brand: 'Hyundai',
  model: 'Tucson PHEV',
  fuel: 'hibrido_enchufable',
  battery_kwh: 13.8,
  electric_range_km: 60,
};

describe('calculateTCO', () => {
  it('calculates correct monthly payment for combustion car', () => {
    const result = calculateTCO(mockCar, 48, 1000);
    expect(result.monthlyLoan).toBeGreaterThan(0);
    expect(result.loanMonths).toBe(48);
    expect(result.loanRate).toBeCloseTo(annualEffectiveRate(TYPICAL_MONTHLY_RATE), 5);
    expect(result.loanRate).toBeCloseTo(0.127, 3);
  });

  it('includes all cost components', () => {
    const result = calculateTCO(mockCar, 48, 1000);
    expect(result.breakdown).toHaveLength(7);
    expect(result.breakdown.map(b => b.label)).toContain('Cuota crédito');
    expect(result.breakdown.map(b => b.label)).toContain('SOAP');
    expect(result.breakdown.map(b => b.label)).toContain('Seguro');
    expect(result.breakdown.map(b => b.label)).toContain('Combustible');
    expect(result.breakdown.map(b => b.label)).toContain('Depreciación');
  });

  it('calculates depreciation and blended charging', () => {
    const result = calculateTCO(mockCar, 48, 1000);
    expect(result.depreciacionAnual).toBeGreaterThan(0);
    const ev = calculateTCO(mockEV, 48, 1000);
    expect(ev.fuelOrChargeMonthly).toBe(Math.round((1000 * (60 / 510)) * 190));
  });

  it('has higher total monthly with shorter loan term', () => {
    const result24 = calculateTCO(mockCar, 24, 1000);
    const result60 = calculateTCO(mockCar, 60, 1000);
    expect(result24.totalMonthly).toBeGreaterThan(result60.totalMonthly);
  });

  it('calculates EV charging cost instead of fuel', () => {
    const result = calculateTCO(mockEV, 48, 1000);
    expect(result.fuelOrChargeMonthly).toBeGreaterThan(0);
    expect(result.breakdown.find(b => b.label === 'Carga eléctrica')).toBeDefined();
    expect(result.breakdown.find(b => b.label === 'Combustible')).toBeUndefined();
  });

  it('calculates PHEV hybrid cost', () => {
    const result = calculateTCO(mockPHEV, 48, 1000);
    expect(result.fuelOrChargeMonthly).toBeGreaterThan(0);
  });

  it('total monthly is sum of all components', () => {
    const result = calculateTCO(mockCar, 48, 1000);
    const sum = result.breakdown.reduce((acc, b) => acc + b.monthly, 0);
    expect(result.totalMonthly).toBe(sum);
  });

  it('total annual is 12x monthly', () => {
    const result = calculateTCO(mockCar, 48, 1000);
    expect(result.totalAnnual).toBe(result.totalMonthly * 12);
  });

  it('total 5 years is 5x annual', () => {
    const result = calculateTCO(mockCar, 48, 1000);
    expect(result.total5Years).toBe(result.totalAnnual * 5);
  });

  it('higher km increases fuel cost', () => {
    const low = calculateTCO(mockCar, 48, 500);
    const high = calculateTCO(mockCar, 48, 2000);
    expect(high.fuelOrChargeMonthly).toBeGreaterThan(low.fuelOrChargeMonthly);
  });

  describe('permiso de circulación (fórmula SII)', () => {
    it('aplica la escala progresiva acumulativa de la FAQ 001.170.5079.007', () => {
      const result = calculateTCO(mockCar, 48, 1000);
      expect(result.permisoCirculacion).toBe(420_071);
    });

    it('EV y PHEV (año >= 2021) pagan 25% del permiso (Ley 21.505)', () => {
      expect(calculateTCO(mockEV, 48, 1000).permisoCirculacion).toBe(105_018);
      expect(calculateTCO(mockPHEV, 48, 1000).permisoCirculacion).toBe(105_018);
    });

    it('respeta el mínimo de media UTM (0,5 UTM)', () => {
      const cheap = calculateTCO({ ...mockCar, price: 3_000_000 }, 48, 1000);
      expect(cheap.permisoCirculacion).toBe(34_876);
    });

    it('usados pagan menos por depreciación de la tasación', () => {
      const used = calculateTCO({ ...mockCar, year: 2022 }, 48, 1000);
      expect(used.permisoCirculacion).toBe(228_742);
      expect(used.permisoCirculacion).toBeLessThan(calculateTCO(mockCar, 48, 1000).permisoCirculacion);
    });
  });
});
