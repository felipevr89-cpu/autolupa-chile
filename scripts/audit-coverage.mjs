import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandsDir = join(root, 'src', 'data', 'brands');
const reportPath = join(root, 'docs', 'AUDIT-COVERAGE.md');

const TOP_BRANDS = [
  'Toyota', 'Suzuki', 'Hyundai', 'Ford', 'Peugeot', 'Nissan', 'Mitsubishi', 'MG',
  'Chery', 'Volkswagen', 'Mazda', 'Honda', 'Renault', 'RAM', 'Jeep', 'Fiat',
  'Citroën', 'Subaru', 'Kia', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus',
];

const REQUIRED_MODELS = [
  ['Toyota', 'Corolla'], ['Toyota', 'RAV4'], ['Toyota', 'Hilux'],
  ['Suzuki', 'Swift'], ['Suzuki', 'Baleno'], ['Suzuki', 'Vitara'],
  ['Hyundai', 'Tucson'], ['Hyundai', 'Accent'], ['Hyundai', 'Grand i10'],
  ['Ford', 'Ranger'], ['Ford', 'Territory'],
  ['Peugeot', '208'], ['Peugeot', '2008'],
  ['Mitsubishi', 'L200'], ['Nissan', 'Navara'],
  ['MG', 'MG ZS'],
  ['Chery', 'Tiggo 2'], ['Chery', 'Tiggo 4'], ['Chery', 'Tiggo 7'],
  ['Chery', 'Tiggo 8'], ['Chery', 'Tiggo 8 Pro'], ['Chery', 'Tiggo 8 Pro Max'],
  ['Volkswagen', 'Polo'], ['Volkswagen', 'T-Cross'],
  ['Mazda', 'CX-5'], ['Honda', 'CR-V'], ['Renault', 'Kwid'],
  ['RAM', '700'], ['Jeep', 'Renegade'], ['Kia', 'Sportage'], ['Kia', 'Soluto'],
];

const byBrand = new Map();
for (const file of readdirSync(brandsDir).filter(entry => entry.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(brandsDir, file), 'utf8'));
  for (const car of data.models ?? []) {
    if (!byBrand.has(car.brand)) byBrand.set(car.brand, []);
    byBrand.get(car.brand).push(car);
  }
}

function hasModel(brand, model) {
  const candidates = byBrand.get(brand) ?? [];
  const wanted = model.toLowerCase();
  return candidates.some(car => {
    const name = car.model.toLowerCase();
    return name === wanted || name.startsWith(wanted);
  });
}

const brandRows = TOP_BRANDS.map(brand => {
  const count = byBrand.get(brand)?.length ?? 0;
  const gap = Math.max(0, 3 - count);
  return { brand, count, gap, status: gap === 0 ? 'OK' : 'GAP' };
});

const missingModels = REQUIRED_MODELS.filter(([brand, model]) => !hasModel(brand, model));
const missingBrands = TOP_BRANDS.filter(brand => !byBrand.has(brand));

const lines = [
  '# Auditoría de cobertura del catálogo',
  '',
  `Generado: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Resumen',
  '',
  `- Marcas en catálogo: **${byBrand.size}**`,
  `- Modelos en catálogo: **${[...byBrand.values()].reduce((total, models) => total + models.length, 0)}**`,
  `- Top brands sin catálogo: **${missingBrands.length}**`,
  `- Top brands con menos de 3 modelos: **${brandRows.filter(row => row.gap > 0).length}**`,
  `- Modelos obligatorios faltantes: **${missingModels.length}**`,
  '',
  '## Top marcas ANAC',
  '',
  '| Marca | Modelos en catálogo | Gap a 3 | Estado |',
  '|---|---:|---:|---|',
  ...brandRows.map(row => `| ${row.brand} | ${row.count} | ${row.gap} | ${row.status} |`),
  '',
  '## Modelos obligatorios',
  '',
  '| Marca | Modelo | Estado |',
  '|---|---|---|',
  ...REQUIRED_MODELS.map(([brand, model]) => `| ${brand} | ${model} | ${hasModel(brand, model) ? 'OK' : 'FALTA'} |`),
  '',
  '## Brechas',
  '',
  ...(missingBrands.length ? missingBrands.map(brand => `- Marca sin catálogo: ${brand}`) : ['- Sin marcas del top fuera del catálogo.']),
  ...(missingModels.length ? missingModels.map(([brand, model]) => `- Modelo faltante: ${brand} ${model}`) : ['- Sin modelos obligatorios faltantes.']),
  '',
];

writeFileSync(reportPath, lines.join('\n'));
console.log(`Cobertura: ${byBrand.size} marcas, ${missingBrands.length} top sin catálogo, ${brandRows.filter(row => row.gap > 0).length} con <3 modelos, ${missingModels.length} modelos obligatorios faltantes.`);
if (missingBrands.length > 0 || brandRows.some(row => row.gap > 0) || missingModels.length > 0) process.exitCode = 1;
