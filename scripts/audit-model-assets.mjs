import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandsDir = join(root, 'src', 'data', 'brands');
const imagesPath = join(root, 'src', 'data', 'carImages.json');
const publicImagesDir = join(root, 'public', 'car-images');
const reportPath = join(root, 'docs', 'AUDIT-ASSETS.md');
const currentYear = new Date().getFullYear();

const images = JSON.parse(readFileSync(imagesPath, 'utf8'));
const models = [];
for (const file of readdirSync(brandsDir).filter(entry => entry.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(brandsDir, file), 'utf8'));
  for (const car of data.models ?? []) models.push(car);
}

const missingKey = [];
const nullKey = [];
const missingFile = [];
const genericName = [];
const yearMismatch = [];
const usedFiles = new Set();

for (const car of models) {
  const entry = images[String(car.id)];
  if (!entry) {
    missingKey.push(car);
    continue;
  }
  if (entry === null || !entry.file) {
    nullKey.push(car);
    continue;
  }
  usedFiles.add(entry.file);
  const diskPath = join(root, 'public', entry.file.replace(/^\//, ''));
  if (!existsSync(diskPath)) {
    missingFile.push({ car, file: entry.file });
    continue;
  }
  if (/(default|placeholder|hero|generic)/i.test(entry.file)) {
    genericName.push({ car, file: entry.file });
  }
  const mtimeYear = new Date(statSync(diskPath).mtime).getFullYear();
  if (car.year > currentYear && mtimeYear < car.year) {
    yearMismatch.push({ car, file: entry.file, mtimeYear });
  }
}

const diskFiles = new Set(
  existsSync(publicImagesDir)
    ? readdirSync(publicImagesDir).filter(file => /\.(jpe?g|png|webp|avif)$/i.test(file)).map(file => `/car-images/${file}`)
    : [],
);
const orphanFiles = [...diskFiles].filter(file => !usedFiles.has(file)).sort();

const lines = [
  '# Auditoría de assets de modelos',
  '',
  `Generado: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Resumen',
  '',
  `- Modelos en catálogo: **${models.length}**`,
  `- Modelos con foto: **${models.length - missingKey.length - nullKey.length}**`,
  `- Modelos sin clave en el manifiesto: **${missingKey.length}**`,
  `- Modelos con clave \`null\` (silueta): **${nullKey.length}**`,
  `- Archivos declarados que no existen en disco: **${missingFile.length}**`,
  `- Nombres genéricos: **${genericName.length}**`,
  `- Posible desfase año/foto: **${yearMismatch.length}**`,
  `- Archivos huérfanos en \`public/car-images\`: **${orphanFiles.length}**`,
  '',
  '## Modelos sin clave en el manifiesto',
  '',
  ...(missingKey.length ? missingKey.map(car => `- ${car.id} · ${car.brand} ${car.model} (${car.year})`) : ['- Ninguno']),
  '',
  '## Modelos con clave `null` (silueta)',
  '',
  ...(nullKey.length ? nullKey.map(car => `- ${car.id} · ${car.brand} ${car.model} (${car.year})`) : ['- Ninguno']),
  '',
  '## Archivos declarados que no existen',
  '',
  ...(missingFile.length ? missingFile.map(item => `- ${item.car.id} · ${item.car.brand} ${item.car.model}: \`${item.file}\``) : ['- Ninguno']),
  '',
  '## Nombres genéricos',
  '',
  ...(genericName.length ? genericName.map(item => `- ${item.car.id} · ${item.car.brand} ${item.car.model}: \`${item.file}\``) : ['- Ninguno']),
  '',
  '## Posible desfase año/foto',
  '',
  ...(yearMismatch.length ? yearMismatch.map(item => `- ${item.car.id} · ${item.car.brand} ${item.car.model} (${item.car.year}) foto de ${item.mtimeYear}: \`${item.file}\``) : ['- Ninguno']),
  '',
  '## Archivos huérfanos',
  '',
  ...(orphanFiles.length ? orphanFiles.map(file => `- \`${file}\``) : ['- Ninguno']),
  '',
];

writeFileSync(reportPath, lines.join('\n'));
console.log(`Auditoría de assets: ${models.length} modelos, ${missingKey.length} sin clave, ${nullKey.length} null, ${missingFile.length} faltantes, ${orphanFiles.length} huérfanos.`);
if (missingFile.length > 0) process.exitCode = 1;
