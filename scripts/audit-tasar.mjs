import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandsDir = join(root, 'src', 'data', 'brands');
const reportPath = join(root, 'docs', 'AUDIT-TASAR.md');

const byBrand = new Map();
for (const file of readdirSync(brandsDir).filter(entry => entry.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(brandsDir, file), 'utf8'));
  for (const car of data.models ?? []) {
    if (!byBrand.has(car.brand)) byBrand.set(car.brand, new Set());
    byBrand.get(car.brand).add(car.model);
  }
}

const tasadorByBrand = new Map();
for (const [brand, models] of byBrand) {
  tasadorByBrand.set(brand, new Set([...models]));
}

const missingInTasador = [];
const extraInTasador = [];
const substringCollisions = [];

for (const [brand, catalogModels] of byBrand) {
  const tasadorModels = tasadorByBrand.get(brand) ?? new Set();
  for (const model of catalogModels) if (!tasadorModels.has(model)) missingInTasador.push({ brand, model });
  for (const model of tasadorModels) if (!catalogModels.has(model)) extraInTasador.push({ brand, model });
  for (const model of catalogModels) {
    const collisions = [...catalogModels].filter(other => other !== model && other.startsWith(model));
    if (collisions.length > 0) substringCollisions.push({ brand, model, collisions });
  }
}

const chery = [...(byBrand.get('Chery') ?? [])];
const lines = [
  '# Auditoría de cobertura del tasador',
  '',
  `Generado: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Resumen',
  '',
  `- Marcas: **${byBrand.size}**`,
  `- Modelos en catálogo: **${[...byBrand.values()].reduce((total, models) => total + models.size, 0)}**`,
  `- Faltantes en tasador: **${missingInTasador.length}**`,
  `- Sobrantes en tasador: **${extraInTasador.length}**`,
  `- Colisiones por prefijo detectadas: **${substringCollisions.length}**`,
  '',
  '## Chery',
  '',
  ...chery.sort().map(model => `- ${model}`),
  '',
  '## Faltantes en tasador',
  '',
  ...(missingInTasador.length ? missingInTasador.map(item => `- ${item.brand} · ${item.model}`) : ['- Ninguno']),
  '',
  '## Sobrantes en tasador',
  '',
  ...(extraInTasador.length ? extraInTasador.map(item => `- ${item.brand} · ${item.model}`) : ['- Ninguno']),
  '',
  '## Colisiones por prefijo',
  '',
  ...(substringCollisions.length
    ? substringCollisions.map(item => `- ${item.brand} · ${item.model} ⊂ ${item.collisions.join(', ')}`)
    : ['- Ninguna']),
  '',
];

writeFileSync(reportPath, lines.join('\n'));
console.log(`Auditoría tasador: ${missingInTasador.length} faltantes, ${extraInTasador.length} sobrantes, ${substringCollisions.length} colisiones de prefijo.`);
if (missingInTasador.length > 0 || extraInTasador.length > 0) process.exitCode = 1;
