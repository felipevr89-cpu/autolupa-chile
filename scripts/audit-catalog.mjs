import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandsDir = join(root, 'src', 'data', 'brands');
const validTypes = new Set(['sedan', 'suv', 'pickup', 'hatchback', 'minivan', 'wagon', 'coupe', 'convertible']);
const validFuels = new Set(['gasolina', 'diesel', 'electrico', 'hibrido', 'hibrido_enchufable']);
const validTransmissions = new Set(['manual', 'automatica']);
const validTractions = new Set(['4x2', '4x4', 'awd']);

const errors = [];
const warnings = [];
const ids = new Map();
const keys = new Map();
let modelCount = 0;
let versionCount = 0;
let sourceCount = 0;
let legacyNcap = 0;
let missingElectric = 0;

for (const file of readdirSync(brandsDir).filter((entry) => entry.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(brandsDir, file), 'utf8'));
  for (const car of data.models ?? []) {
    modelCount += 1;
    const where = `${file}#${car.id} ${car.brand ?? '?'} ${car.model ?? '?'}`;

    if (!Number.isInteger(car.id) || car.id <= 0) errors.push(`${where}: id inválido`);
    if (ids.has(car.id)) errors.push(`${where}: id duplicado con ${ids.get(car.id)}`);
    else ids.set(car.id, where);

    if (!car.brand || !car.model) errors.push(`${where}: marca o modelo vacío`);
    if (!validTypes.has(car.type)) errors.push(`${where}: tipo inválido (${car.type})`);
    if (!validFuels.has(car.fuel)) errors.push(`${where}: combustible inválido (${car.fuel})`);
    if (!validTransmissions.has(car.transmission)) errors.push(`${where}: transmisión inválida (${car.transmission})`);
    if (!validTractions.has(car.traction)) errors.push(`${where}: tracción inválida (${car.traction})`);
    if (!(car.seats > 0)) errors.push(`${where}: plazas inválidas`);
    if (!(car.price > 0)) errors.push(`${where}: precio inválido`);
    if (car.price % 100 !== 0) errors.push(`${where}: precio no termina en 00 (${car.price})`);

    const key = [car.brand, car.model, car.year, car.fuel].join('|').toLowerCase();
    if (keys.has(key)) errors.push(`${where}: modelo duplicado con ${keys.get(key)}`);
    else keys.set(key, where);

    if (!Array.isArray(car.versions) || car.versions.length === 0) {
      errors.push(`${where}: sin versiones`);
      continue;
    }

    for (const version of car.versions) {
      versionCount += 1;
      if (!version.version) errors.push(`${where}: versión sin nombre`);
      if (!(version.price > 0)) errors.push(`${where}: versión ${version.version} sin precio`);
      if (!version.transmission) errors.push(`${where}: versión ${version.version} sin transmisión`);
      if (!version.traction) errors.push(`${where}: versión ${version.version} sin tracción`);
      if (version.price_list != null) {
        if (version.price_list < version.price) errors.push(`${where}: versión ${version.version} con precio lista menor al precio`);
        if (version.price_bonus != null && version.price_bonus !== version.price_list - version.price) {
          errors.push(`${where}: versión ${version.version} con bono inconsistente`);
        }
      }
    }

    const cheapest = Math.min(...car.versions.map((version) => version.price));
    if (car.price !== cheapest) errors.push(`${where}: price ${car.price} ≠ versión mínima ${cheapest}`);
    if (car.price_list != null && car.price_list < car.price) errors.push(`${where}: price_list menor que price`);
    if (car.price_list != null && car.price_bonus != null && car.price_bonus !== car.price_list - car.price) {
      errors.push(`${where}: price_bonus inconsistente`);
    }

    for (const rating of car.safety_ratings ?? []) {
      sourceCount += 1;
      if (!rating.program) errors.push(`${where}: rating sin programa`);
      if (!(rating.stars >= 0 && rating.stars <= 5)) errors.push(`${where}: rating con estrellas fuera de rango`);
      if (!(rating.year > 2000)) errors.push(`${where}: rating con año inválido`);
      if (!/^https?:\/\//.test(rating.source ?? '')) errors.push(`${where}: rating sin fuente`);
    }

    if (car.latin_ncap_stars != null) legacyNcap += 1;
    if ((car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable') && (!(car.battery_kwh > 0) || !(car.electric_range_km > 0))) {
      missingElectric += 1;
    }
  }
}

if (legacyNcap > 0) warnings.push(`${legacyNcap} modelos conservan latin_ncap_stars legacy (ya no se muestran en la interfaz)`);
if (missingElectric > 0) warnings.push(`${missingElectric} EV/PHEV sin batería/autonomía en el JSON (pueden venir de enrichment.ts)`);

console.log(`Catálogo: ${modelCount} modelos, ${versionCount} versiones. Ratings de seguridad en JSON: ${sourceCount} (enrichment.ts agrega las fichas con fuente).`);
for (const warning of warnings) console.log(`AVISO: ${warning}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} errores:`);
  for (const error of errors.slice(0, 200)) console.error(`- ${error}`);
  if (errors.length > 200) console.error(`... y ${errors.length - 200} más`);
  process.exit(1);
}
console.log('Sin errores de integridad.');
