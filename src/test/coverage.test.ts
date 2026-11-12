import { describe, expect, it } from 'vitest';
import { carsData, getModelsByBrand } from '../data/brands';
import { recommend } from '../data/recommender';

const TOP_BRANDS = [
  'Toyota', 'Suzuki', 'Hyundai', 'Ford', 'Peugeot', 'Nissan', 'Mitsubishi', 'MG',
  'Chery', 'Volkswagen', 'Mazda', 'Honda', 'Renault', 'RAM', 'Jeep', 'Fiat',
  'Citroën', 'Subaru', 'Kia', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus',
];

const REQUIRED_MODELS: Array<[string, string]> = [
  ['Toyota', 'Corolla'], ['Toyota', 'RAV4'], ['Toyota', 'Hilux'],
  ['Suzuki', 'Swift'], ['Suzuki', 'Baleno'], ['Suzuki', 'Vitara'],
  ['Hyundai', 'Tucson'], ['Hyundai', 'Accent'], ['Hyundai', 'Grand i10'],
  ['Ford', 'Ranger'], ['Ford', 'Territory'],
  ['Peugeot', '208'], ['Peugeot', '2008'],
  ['Mitsubishi', 'L200'], ['Nissan', 'Navara'], ['MG', 'MG ZS'],
  ['Chery', 'Tiggo 2'], ['Chery', 'Tiggo 4'], ['Chery', 'Tiggo 7'],
  ['Chery', 'Tiggo 8'], ['Chery', 'Tiggo 8 Pro'], ['Chery', 'Tiggo 8 Pro Max'],
  ['Volkswagen', 'Polo'], ['Volkswagen', 'T-Cross'],
  ['Mazda', 'CX-5'], ['Honda', 'CR-V'], ['Renault', 'Kwid'],
  ['RAM', '700'], ['Jeep', 'Renegade'], ['Kia', 'Sportage'], ['Kia', 'Soluto'],
];

function hasModel(brand: string, model: string): boolean {
  const wanted = model.toLowerCase();
  return carsData.some(car => car.brand === brand && (car.model.toLowerCase() === wanted || car.model.toLowerCase().startsWith(wanted)));
}

describe('cobertura del catálogo', () => {
  it('cada marca del top ANAC tiene al menos 3 modelos', () => {
    for (const brand of TOP_BRANDS) {
      const count = carsData.filter(car => car.brand === brand).length;
      expect(count, `${brand} tiene ${count} modelos`).toBeGreaterThanOrEqual(3);
    }
  });

  it('los modelos obligatorios del mercado chileno están presentes', () => {
    for (const [brand, model] of REQUIRED_MODELS) {
      expect(hasModel(brand, model), `${brand} ${model} falta`).toBe(true);
    }
  });

  it('el selector del tasador cubre todos los modelos del catálogo', () => {
    const brands = [...new Set(carsData.map(car => car.brand))];
    for (const brand of brands) {
      const catalog = [...new Set(carsData.filter(car => car.brand === brand).map(car => car.model))].sort();
      expect(getModelsByBrand(brand).slice().sort()).toEqual(catalog);
    }
  });

  it('los tres Tiggo 8 están disponibles en el tasador', () => {
    const models = getModelsByBrand('Chery');
    expect(models).toContain('Tiggo 8');
    expect(models).toContain('Tiggo 8 Pro');
    expect(models).toContain('Tiggo 8 Pro Max');
  });

  it('el buscador NLU encuentra las 10 marcas top', () => {
    for (const brand of TOP_BRANDS.slice(0, 10)) {
      expect(recommend(brand).list.length, `${brand} sin resultados`).toBeGreaterThan(0);
    }
  });
});
