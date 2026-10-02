import { Car } from '../types';
import { carsData } from './brands';

export type EstadoVehiculo = 'excelente' | 'bueno' | 'regular';

export interface EstadoOption {
  id: EstadoVehiculo;
  label: string;
  factor: number;
  hint: string;
}

export const ESTADOS_VEHICULO: EstadoOption[] = [
  { id: 'excelente', label: 'Excelente', factor: 1.03, hint: 'Sin detalles, mantención al día' },
  { id: 'bueno', label: 'Bueno', factor: 1, hint: 'Uso normal, detalles mínimos' },
  { id: 'regular', label: 'Regular', factor: 0.94, hint: 'Requiere retoques o mantención pendiente' },
];

export const KM_POR_ANIO = 15_000;
export const MARGEN_RANGO = 0.06;

export function getDepreciacionAcumulada(age: number): number {
  let factor = 1;
  for (let year = 1; year <= age; year += 1) {
    const rate = year <= 1 ? 0.18 : year <= 3 ? 0.12 : year <= 6 ? 0.09 : 0.07;
    factor *= 1 - rate;
  }
  return factor;
}

export function getFactorKilometraje(km: number, age: number): number {
  const esperado = KM_POR_ANIO * Math.max(age, 1);
  const uso = (km - esperado) / esperado;
  const limitado = Math.min(Math.max(uso, -0.1), 1);
  return 1 - limitado * 0.15;
}

export function getFactorEstado(estado: EstadoVehiculo): number {
  return ESTADOS_VEHICULO.find(option => option.id === estado)?.factor ?? 1;
}

export interface TasacionInput {
  brand: string;
  model: string;
  version?: string;
  year: number;
  km: number;
  estado: EstadoVehiculo;
}

export interface TasacionResultado {
  car: Car;
  versionName: string | null;
  precioLista: number;
  valorEstimado: number;
  min: number;
  max: number;
  anios: number;
  factorDepreciacion: number;
  factorKilometraje: number;
  factorEstado: number;
  comparables: Car[];
}

export function getComparables(car: Car, valor: number, limit = 3): Car[] {
  const candidatos = carsData.filter(candidate => candidate.id !== car.id && candidate.type === car.type);
  const cercanos = candidatos.filter(candidate => Math.abs(candidate.price - valor) <= valor * 0.35);
  const base = cercanos.length >= limit ? cercanos : candidatos;
  const ordenados = [...base].sort(
    (a, b) => Math.abs(a.price - valor) - Math.abs(b.price - valor),
  );

  const elegidos: Car[] = [];
  for (const candidate of ordenados) {
    if (elegidos.length >= limit) break;
    if (!elegidos.some(chosen => chosen.brand === candidate.brand)) elegidos.push(candidate);
  }
  for (const candidate of ordenados) {
    if (elegidos.length >= limit) break;
    if (!elegidos.includes(candidate)) elegidos.push(candidate);
  }
  return elegidos;
}

export function estimarValor(input: TasacionInput): TasacionResultado | null {
  const car = carsData.find(candidate => candidate.brand === input.brand && candidate.model === input.model);
  if (!car) return null;

  const anios = Math.max(0, new Date().getFullYear() - input.year);
  const version = input.version
    ? car.versions.find(option => option.version === input.version)
    : undefined;
  const precioLista = version?.price ?? car.price;
  const factorDepreciacion = getDepreciacionAcumulada(anios);
  const factorKilometraje = getFactorKilometraje(input.km, anios);
  const factorEstado = getFactorEstado(input.estado);

  const bruto = precioLista * factorDepreciacion * factorKilometraje * factorEstado;
  const valorEstimado = Math.max(100_000, Math.round(bruto / 1000) * 1000);

  return {
    car,
    versionName: version?.version ?? null,
    precioLista,
    valorEstimado,
    min: Math.round((valorEstimado * (1 - MARGEN_RANGO)) / 1000) * 1000,
    max: Math.round((valorEstimado * (1 + MARGEN_RANGO)) / 1000) * 1000,
    anios,
    factorDepreciacion,
    factorKilometraje,
    factorEstado,
    comparables: getComparables(car, valorEstimado),
  };
}
