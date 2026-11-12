import type { Car } from '../types';
import { brands as catalogBrands, formatPrice, carsData, isBrandSoldNewInChile } from './brands';

export interface QueryIntent {
  budget?: { min?: number; max?: number };
  usage?: 'daily' | 'family' | 'adventure' | 'highway' | 'work';
  fuel?: 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'hibrido_enchufable';
  transmission?: 'manual' | 'automatica';
  traction?: '4x2' | '4x4' | 'awd';
  minSeats?: number;
  bodyType?: string;
  priorities: string[];
  brands: string[];
  minYear?: number;
  unknown: string[];
  models?: string[];
  mode?: 'model' | 'similar' | 'compare';
  cheaperThanRef?: boolean;
  minRangeKm?: number;
  minHp?: number;
  minBatteryKwh?: number;
  minTrunkLiters?: number;
  minKmL?: number;
  includeOrigins?: string[];
  excludeOrigins?: string[];
  excludeFuels?: string[];
  excludeBrands?: string[];
  excludeBodies?: string[];
  used?: boolean;
}

export interface Recommendation {
  car: Car;
  affinity: number;
  score: number;
  max: number;
  reasons: string[];
  discontinued?: boolean;
  role?: 'match' | 'alternative';
}

export interface RecommendResult {
  intent: QueryIntent;
  list: Recommendation[];
  unclear: boolean;
  reference?: Car;
}

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (w: string) => `(^|\\W)${esc(w)}(\\W|$)`;
const has = (s: string, w: string) => new RegExp(wordRe(w)).test(s);

const FUEL_WORDS: Record<string, string[]> = {
  hibrido_enchufable: ['enchufable', 'enchufables', 'plug in', 'plug-in', 'phev'],
  electrico: ['electrico', 'electrica', 'electricos', 'electricas', 'cero emisiones', 'ceroemisiones', 'bateria', 'ev', 'bev'],
  hibrido: ['hibrido', 'hibrida', 'hibridos', 'hibridas', 'hybrid', 'hev', 'mhev'],
  diesel: ['diesel', 'petrolero', 'petrolera', 'gasolero'],
  gasolina: ['gasolina', 'bencina', 'bencinero', 'bencinera', 'petrol'],
};

const RIDESHARE_WORDS = ['uber', 'cabify', 'didi', 'indriver', 'taxi', 'colectivo', 'aplicacion', 'aplicaciones', 'app'];

const USAGE_WORDS: Record<string, string[]> = {
  daily: ['ciudad', 'urbano', 'urbana', 'diario', 'diaria', 'centro', 'trabajo diario', 'santiago', 'oficina', 'universidad', 'primer auto'],
  family: ['familia', 'familiar', 'familiares', 'ninos', 'nino', 'hijos', 'hijas', 'guagua', 'guaguas', 'escuela', 'colegio', 'paseo'],
  adventure: ['aventura', 'off road', 'offroad', 'nieve', 'camping', 'cerro', 'tierra', 'barro', 'camino rural', 'campo', 'parcela', 'fundo', 'ripio', 'cordillera', 'montana', 'esqui'],
  highway: ['carretera', 'ruta', 'autopista', 'viajes', 'viajar', 'viaje', 'viaje largo', 'vacaciones', 'sur', 'norte', 'kilometraje'],
  work: ['carga', 'obra', 'comercio', 'reparto', 'feria', 'pesado', 'utilidad', 'trabajo', 'pyme', 'negocio', 'herramientas'],
};

const PRIORITY_WORDS: Record<string, string[]> = {
  performance: ['rendimiento', 'potencia', 'potente', 'rapido', 'rapida', 'veloz', 'deportivo', 'deportiva', 'aceleracion', 'caballos', 'turbo'],
  safety: ['seguridad', 'seguro', 'segura', 'airbags', 'ncap', 'adas', 'frenos'],
  space: ['espacio', 'espacioso', 'espaciosa', 'maletero', 'maleta', 'baul', 'capacidad', 'grande', 'amplio', 'amplia'],
  economy: ['economico', 'economica', 'barato', 'barata', 'ahorro', 'eficiente', 'consumo', 'eficiencia', 'gaste poco', 'gasta poco', 'rendidor', 'rendidora'],
  technology: ['tecnologia', 'tecnologico', 'conectividad', 'pantalla', 'moderno', 'moderna'],
  compact: ['estacionar', 'estacionamiento', 'pequeno', 'pequena', 'chico', 'chica', 'citycar', 'city car', 'facil de estacionar'],
};

const BODY_WORDS: Record<string, string[]> = {
  sedan: ['sedan', 'sedanes', 'berlina'],
  suv: ['suv', 'suvs', 'todo terreno', 'todoterreno', 'jeepeta'],
  pickup: ['pickup', 'pick up', 'pick-up', 'camioneta', 'camionetas'],
  hatchback: ['hatchback', 'hach', 'hatch'],
  minivan: ['minivan', 'van', 'furgon', 'mpv'],
  wagon: ['wagon', 'station wagon', 'vagoneta'],
  coupe: ['coupe', 'deportivo dos'],
  convertible: ['convertible', 'descapotable', 'cabrio'],
};

const TRANSMISSION_WORDS: Record<string, string[]> = {
  automatica: ['automatica', 'automatico', 'cvt', 'caja automatica'],
  manual: ['manual', 'mecanico', 'mecanica'],
};

const TRACTION_WORDS: Record<string, string[]> = {
  '4x4': ['4x4', 'awd', '4wd', 'traccion total', 'doble traccion', 'traccion integral'],
  '4x2': ['4x2', 'traccion simple'],
};

const EUROPE = ['Alemania', 'Francia', 'Reino Unido', 'Italia', 'España', 'Suecia', 'República Checa', 'Rumania', 'Austria', 'Turquía'];

const ORIGIN_WORDS: Array<{ words: string[]; countries: string[] }> = [
  { words: ['chino', 'china', 'chinos', 'chinas'], countries: ['China'] },
  { words: ['japones', 'japonesa', 'japoneses', 'japonesas'], countries: ['Japón'] },
  { words: ['coreano', 'coreana', 'coreanos', 'coreanas'], countries: ['Corea del Sur'] },
  { words: ['aleman', 'alemana', 'alemanes', 'alemanas'], countries: ['Alemania'] },
  { words: ['americano', 'americana', 'americanos', 'gringo', 'gringa', 'estadounidense'], countries: ['Estados Unidos', 'USA'] },
  { words: ['europeo', 'europea', 'europeos', 'europeas'], countries: EUROPE },
  { words: ['frances', 'francesa', 'franceses'], countries: ['Francia'] },
  { words: ['italiano', 'italiana', 'italianos'], countries: ['Italia'] },
  { words: ['indio', 'india', 'hindu'], countries: ['India'] },
  { words: ['brasileno', 'brasilena', 'brasileros'], countries: ['Brasil'] },
];

const USED_WORDS = ['usado', 'usada', 'usados', 'usadas', 'segunda mano', 'seminuevo', 'seminueva', 'de ocasion'];
const SIMILAR_WORDS = ['parecido', 'parecida', 'similar', 'similares', 'alternativa', 'alternativas', 'como el', 'como la', 'tipo el', 'tipo la', 'en vez del', 'en vez de un', 'competencia', 'rival'];
const CHEAPER_WORDS = ['mas barato', 'mas barata', 'mas economico', 'mas economica', 'menos caro', 'menor precio'];
const COMPARE_WORDS = ['vs', 'versus', 'comparar', 'compara', 'comparacion', 'contra', 'o el', 'o la', 'mejor que'];

const VARIANT_WORDS = new Set(['hibrido', 'hibrida', 'hybrid', 'hev', 'mhev', 'phev', 'ev', 'electric', 'electrico', 'electrica', 'e-power', 'epower', 'shs', 'dm-i', 'dmi', 'turbo']);

const MODEL_STOPWORDS = new Set([
  'alto', 'city', 'rich', 'view', 'born', 'leon', 'toro', 'roma', 'han', 'tang', 'one', 'up', 'torres', 'rush',
  'spin', 'seal', 'shark', 'hunter', 'max', 'sol', 'mage', 'poer', 'kait', 'ami', 'song', 'king', 'yuan', 'atto',
  'dolphin', 'van', 'cargo', 'bus', 'tank', 'big', 'mini', 'plus', 'pro', 'link', 'grand', 'sport', 'era',
]);
const GENERIC_MODEL_WORDS = new Set([
  'pickup', '4x4', '4x2', 'van', 'suv', 'sedan', 'hatchback', 'minivan', 'cargo', 'furgon', 'bus', 'chasis', 'wagon',
  'coupe', 'hybrid', 'hibrido', 'hibrida', 'electric', 'electrico', 'ev', 'phev', 'hev', 'sport', 'cross', 'plus',
  'pro', 'max', 'gt', 'doble', 'cabina', 'minibus', 'custom', 'city', 'mini', 'new', 'all',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\$/g, ' ')
    .replace(/\n/g, ' ');
}

function canon(text: string): string {
  return normalize(text).replace(/\s+/g, ' ').trim();
}

function modelPattern(key: string): RegExp {
  const tokens = key.replace(/[-.\s]+/g, ' ').trim().split(' ').flatMap(t => t.match(/[a-z]+|\d+|[^a-z\d]+/g) ?? []);
  return new RegExp(`(^|[^a-z0-9])${tokens.map(esc).join('[\\s.-]?')}(?=[^a-z0-9]|$)`);
}

function toCLP(raw: string, unit?: string): number {
  const base = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  const u = (unit || raw).toLowerCase();
  return /(millones|millon|palos|palo|m|mm|lucas)\b/.test(u) ? (/lucas/.test(u) ? base * 1e3 : base * 1e6) : base;
}

function originMatch(word: string): string[] | null {
  for (const o of ORIGIN_WORDS) if (o.words.includes(word)) return o.countries;
  return null;
}

function fuelMatch(word: string): string | null {
  for (const [k, ws] of Object.entries(FUEL_WORDS)) if (ws.includes(word)) return k;
  return null;
}

function bodyMatch(word: string): string | null {
  for (const [k, ws] of Object.entries(BODY_WORDS)) if (ws.includes(word)) return k;
  return null;
}

interface ModelEntry { key: string; model: string; brand: string; needsBrand: boolean; re: RegExp }

const modelIndexCache = new WeakMap<Car[], ModelEntry[]>();

function modelIndex(cars: Car[]): ModelEntry[] {
  const cached = modelIndexCache.get(cars);
  if (cached) return cached;
  const seen = new Set<string>();
  const out: ModelEntry[] = [];
  for (const c of cars) {
    const id = `${c.brand}|${c.model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const key = canon(c.model);
    if (!key) continue;
    const words = key.replace(/[-.]/g, ' ').split(' ').filter(Boolean);
    const generic = words.every(w => GENERIC_MODEL_WORDS.has(w) || /^\d+$/.test(w));
    const needsBrand = key.replace(/[^a-z0-9]/g, '').length < 3 || MODEL_STOPWORDS.has(key) || generic || /^\d+$/.test(key);
    out.push({ key, model: c.model, brand: c.brand, needsBrand, re: modelPattern(key) });
  }
  out.sort((a, b) => b.key.length - a.key.length);
  modelIndexCache.set(cars, out);
  return out;
}

export function parseQuery(text: string, brandList: string[] = catalogBrands, cars: Car[] = carsData): QueryIntent {
  let s = ' ' + canon(text).replace(/\bmini\s+van\b/g, 'minivan') + ' ';
  const intent: QueryIntent = { priorities: [], brands: [], unknown: [] };
  const strip = (re: RegExp) => { s = s.replace(re, ' '); };
  const swap = (words: string[]) =>
    s.replace(new RegExp('(^|\\W)(' + words.map(esc).join('|') + ')(?=\\W|$)', 'g'), ' ');
  const brandLowers = [...new Set(brandList)].map(b => ({ b, k: canon(b) })).sort((a, b) => b.k.length - a.k.length);

  if (USED_WORDS.some(w => has(s, w))) { intent.used = true; s = swap(USED_WORDS); }

  const negRe = /(?<=\s)(?:que no sea[n]?|no sea[n]?|no quiero(?: un| una| nada)?|no me gusta[n]?|sin|nada de|excepto|salvo|ni)\s+(?:un |una |el |la |los |las |de |marca |auto |autos |nada )*([a-z0-9]+(?: [a-z0-9]+)?)/g;
  for (const m of [...s.matchAll(negRe)]) {
    const words = m[1].split(' ');
    let consumed = '';
    for (let i = words.length; i >= 1 && !consumed; i--) {
      const w = words.slice(0, i).join(' ');
      const origin = originMatch(w);
      const fuel = fuelMatch(w);
      const body = bodyMatch(w);
      const brand = brandLowers.find(x => x.k === w);
      if (origin) intent.excludeOrigins = [...(intent.excludeOrigins ?? []), ...origin];
      else if (fuel) intent.excludeFuels = [...(intent.excludeFuels ?? []), fuel];
      else if (body) intent.excludeBodies = [...(intent.excludeBodies ?? []), body];
      else if (brand) intent.excludeBrands = [...(intent.excludeBrands ?? []), brand.b];
      else continue;
      consumed = w;
    }
    if (consumed) s = s.replace(m[0].slice(0, m[0].indexOf(consumed) + consumed.length), ' ');
  }

  for (const o of ORIGIN_WORDS) {
    if (o.words.some(w => has(s, w))) {
      intent.includeOrigins = [...(intent.includeOrigins ?? []), ...o.countries];
      s = swap(o.words);
    }
  }

  const n = '(\\d+(?:[.,]\\d+)?)';
  const cmp = '(?:mas de|sobre|por sobre|minimo|al menos|desde|arriba de|de)?\\s*';
  const num = (raw: string) => parseFloat(raw.replace(',', '.'));
  const kml = s.match(new RegExp(`${cmp}${n}\\s*(?:km|kms|kilometros)\\s*(?:/|por|x)\\s*(?:l|lt|litro|litros)\\b`));
  if (kml) { intent.minKmL = num(kml[1]); s = s.replace(kml[0], ' '); }
  strip(/\d[\d.]*\s*(?:km|kms|kilometros)\s*(?:al|por|x|cada)\s*(?:ano|mes|dia|semana)\b/g);
  const range = s.match(new RegExp(`${cmp}${n}\\s*(?:km|kms|kilometros)\\b(?:\\s*de autonomia)?`));
  if (range) {
    const v = num(range[1]);
    if (!intent.used && v >= 50 && v <= 1500) intent.minRangeKm = v;
    s = s.replace(range[0], ' ');
    strip(/\bautonomia\b/g);
  }
  const hp = s.match(new RegExp(`${cmp}${n}\\s*(?:hp|cv|caballos|bhp|ps)\\b`));
  if (hp) { intent.minHp = num(hp[1]); s = s.replace(hp[0], ' '); }
  const kwh = s.match(new RegExp(`${cmp}${n}\\s*kwh\\b`));
  if (kwh) { intent.minBatteryKwh = num(kwh[1]); s = s.replace(kwh[0], ' '); }
  const lts = s.match(new RegExp(`${cmp}${n}\\s*(?:l|lt|lts|litros)\\b`));
  if (lts) {
    if (num(lts[1]) >= 100) intent.minTrunkLiters = num(lts[1]);
    s = s.replace(lts[0], ' ');
  }

  const isUsedYear = (y: number) => y < 2024;
  const years = [...s.matchAll(/\b(19|20)\d{2}\b/g)].map(m => parseInt(m[0], 10));
  if (years.length > 0) {
    const y = Math.max(...years);
    if (isUsedYear(y)) intent.used = true;
    intent.minYear = y;
    strip(/\b(19|20)\d{2}\b/g);
  }

  if (CHEAPER_WORDS.some(w => has(s, w))) { intent.cheaperThanRef = true; s = swap(CHEAPER_WORDS); }
  const similar = SIMILAR_WORDS.some(w => has(s, w));
  if (similar) s = swap(SIMILAR_WORDS);
  const compare = COMPARE_WORDS.some(w => has(s, w));

  const mentionedBrands = brandLowers.filter(x => has(s, x.k)).map(x => x.b);
  const models: string[] = [];
  const modelBrands = new Set<string>();
  const index = modelIndex(cars);
  for (const e of index) {
    if (!e.re.test(s)) continue;
    if (e.needsBrand && !mentionedBrands.includes(e.brand)) continue;
    if (mentionedBrands.length > 0 && !mentionedBrands.includes(e.brand) && index.some(o => o.key === e.key && mentionedBrands.includes(o.brand))) continue;
    models.push(`${e.brand}|${e.model}`);
    for (const o of index) {
      if (o.brand === e.brand && o.key.startsWith(e.key + ' ') && o.key.slice(e.key.length + 1).split(' ').every(w => VARIANT_WORDS.has(w))) models.push(`${o.brand}|${o.model}`);
    }
    modelBrands.add(e.brand);
    s = s.replace(new RegExp(e.re.source, 'g'), ' ');
  }
  if (models.length > 0) {
    intent.models = [...new Set(models)];
    intent.mode = similar || intent.cheaperThanRef ? 'similar' : compare && new Set(models.map(m => m.split('|')[1].split(' ')[0])).size >= 2 ? 'compare' : 'model';
    if (compare) s = swap(COMPARE_WORDS);
  }

  for (const [key, words] of Object.entries(TRACTION_WORDS)) {
    if (words.some(w => has(s, w))) {
      intent.traction = intent.traction || (key === '4x4' ? '4x4' : '4x2');
      s = swap(words);
    }
  }

  for (const [key, words] of Object.entries(FUEL_WORDS)) {
    if (words.some(w => has(s, w))) {
      if (key === 'hibrido_enchufable' && intent.fuel === 'hibrido') intent.fuel = 'hibrido_enchufable';
      else if (!intent.fuel) intent.fuel = key as QueryIntent['fuel'];
      s = swap(words);
    }
  }

  for (const [key, words] of Object.entries(TRANSMISSION_WORDS)) {
    if (words.some(w => has(s, w))) {
      intent.transmission = key as QueryIntent['transmission'];
      s = swap(words);
    }
  }

  if (RIDESHARE_WORDS.some(w => has(s, w))) {
    intent.usage = 'daily';
    intent.priorities.push('economy');
    s = swap(RIDESHARE_WORDS);
  }

  for (const [key, words] of Object.entries(PRIORITY_WORDS)) {
    if (words.some(w => has(s, w))) {
      if (!intent.priorities.includes(key)) intent.priorities.push(key);
      s = swap(words);
    }
  }

  for (const [key, words] of Object.entries(USAGE_WORDS)) {
    if (words.some(w => has(s, w))) {
      if (!intent.usage && key !== 'work') intent.usage = key as QueryIntent['usage'];
      else if (!intent.usage && key === 'work' && !hasWorkRemainder(s)) intent.usage = 'work';
      s = swap(words);
    }
  }

  for (const [key, words] of Object.entries(BODY_WORDS)) {
    if (words.some(w => has(s, w))) {
      if (!intent.bodyType) intent.bodyType = key;
      s = swap(words);
    }
  }

  const seatMatch = s.match(/\b(\d{1,2})\s*(plazas|asientos|pasajeros|plaza|personas|corridas)\b/);
  if (seatMatch) {
    const k = parseInt(seatMatch[1], 10);
    if (seatMatch[2] === 'corridas') intent.minSeats = k >= 3 ? 7 : 5;
    else if (k >= 3) intent.minSeats = Math.min(k, 9);
    s = s.replace(seatMatch[0], ' ');
  }

  const units = '(?:\\s*(millones|millon|palos|palo|lucas|mm|m))?';
  const money = '([0-9][0-9.]*)';
  const rangeM = s.match(new RegExp(`entre\\s+${money}${units}\\s*(?:y|a)\\s+${money}${units}`));
  if (rangeM) {
    const [full, loRaw, loU, hiRaw, hiU] = rangeM;
    const u = loU || hiU;
    intent.budget = { min: toCLP(loRaw, u), max: toCLP(hiRaw, u) };
    s = s.replace(full, ' ');
  } else {
    const maxM = s.match(new RegExp(`(?:hasta|menos de|bajo|debajo de|maximo|max|no mas de|no pasar de|no por encima de|tope de|tope|presupuesto de|presupuesto)\\s+${money}${units}`));
    if (maxM) {
      intent.budget = { ...intent.budget, max: toCLP(maxM[1], maxM[2]) };
      s = s.replace(maxM[0], ' ');
    }
    const minM = s.match(new RegExp(`(?:desde|mas de|sobre|por sobre|minimo)\\s+${money}${units}`));
    if (minM) {
      intent.budget = { ...intent.budget, min: toCLP(minM[1], minM[2]) };
      s = s.replace(minM[0], ' ');
    }
  }

  if (!intent.budget) {
    const withDots = s.match(/\b\d{1,3}(?:\.\d{3}){1,2}(?:\.\d{3})?\b/);
    if (withDots) {
      intent.budget = { max: toCLP(withDots[0]) };
      s = s.replace(withDots[0], ' ');
    } else {
      const withUnit = s.match(/\b(\d+)\s*(millones|millon|palos|palo|mm|m)\b/);
      if (withUnit) {
        intent.budget = { max: toCLP(withUnit[1], withUnit[2]) };
        s = s.replace(withUnit[0], ' ');
      }
    }
  }
  if (intent.budget) {
    const fix = (v?: number) => (v !== undefined && v > 0 && v < 1000 ? v * 1e6 : v);
    intent.budget = { ...(intent.budget.min !== undefined ? { min: fix(intent.budget.min) } : {}), ...(intent.budget.max !== undefined ? { max: fix(intent.budget.max) } : {}) };
  }

  for (const { b, k } of brandLowers) {
    if (has(s, k) && !(intent.excludeBrands ?? []).includes(b)) {
      if (!modelBrands.has(b) || intent.mode !== 'similar') intent.brands.push(b);
      s = s.replace(new RegExp(wordRe(k), 'g'), ' ');
    }
  }
  if (intent.mode === 'similar') intent.brands = intent.brands.filter(b => !modelBrands.has(b));

  intent.unknown = [...new Set(s.split(/\s+/).map(t => t.replace(/[^A-Za-z0-9]/g, '')).filter(w => w.length > 2 && !/^[0-9]+$/.test(w)))];

  return intent;
}

function hasWorkRemainder(s: string): boolean {
  const workSuffix = /(carga|obra|feria|reparto)/.test(s);
  return workSuffix && /diario|diaria|ciudad|urbano/.test(s);
}

function getFuelLabelFor(fuel: string): string {
  const map: Record<string, string> = {
    gasolina: 'gasolina',
    diesel: 'diésel',
    electrico: 'eléctrico',
    hibrido: 'híbrido',
    hibrido_enchufable: 'híbrido enchufable',
  };
  return map[fuel] || fuel;
}

interface Part {
  score: number;
  max: number;
  reasons: string[];
}

const BODY_LABEL: Record<string, string> = { suv: 'SUV', sedan: 'Sedán', pickup: 'Pick-up', hatchback: 'Hatchback', minivan: 'Van / Minivan', wagon: 'Station wagon', coupe: 'Coupé', convertible: 'Convertible' };

const EMPTY: Part = { score: 0, max: 0, reasons: [] };
const nf = (v: number) => v.toLocaleString('es-CL');

function scoreBudget(car: Car, b: QueryIntent['budget']): Part {
  if (!b) return EMPTY;
  const price = car.price;
  const inRange = (b.max === undefined || price <= b.max) && (b.min === undefined || price >= b.min);
  if (inRange) {
    const ratio = b.max ? price / b.max : 1;
    return {
      score: 16 + 4 * Math.min(ratio, 1),
      max: 20,
      reasons: b.min !== undefined && b.max !== undefined
        ? [`Precio ${formatPrice(price)} dentro de tu rango`]
        : b.max !== undefined
          ? [`Precio ${formatPrice(price)} bajo tu tope de ${formatPrice(b.max)}`]
          : [`Precio ${formatPrice(price)} sobre tu mínimo de ${formatPrice(b.min!)}`],
    };
  }
  if (b.min !== undefined && price < b.min) return { score: 10, max: 20, reasons: [`Precio ${formatPrice(price)}, bajo tu mínimo de ${formatPrice(b.min)}`] };
  if (b.max !== undefined && price <= b.max * 1.15) return { score: 8, max: 20, reasons: [`Precio ${formatPrice(price)}, sobre tu tope de ${formatPrice(b.max)} por poco`] };
  return { score: 0, max: 20, reasons: [`Precio ${formatPrice(price)}, por encima de tu presupuesto`] };
}

function scoreUsage(car: Car, u: QueryIntent['usage']): Part {
  if (!u) return EMPTY;
  let score = 0;
  const reasons: string[] = [];
  switch (u) {
    case 'daily':
      if (car.type === 'sedan' || car.type === 'hatchback') { score += 5; reasons.push('Compacto, fácil en ciudad'); }
      if (car.fuel === 'hibrido' || car.fuel === 'hibrido_enchufable' || car.fuel === 'electrico') { score += 10; reasons.push('Consumo urbano eficiente'); }
      else if (car.fuel_consumption_mixed_km_l && car.fuel_consumption_mixed_km_l >= 16) score += 6;
      if (car.traction === '4x2') score += 5;
      break;
    case 'family':
      if (car.seats >= 5) score += 6;
      if (car.seats >= 7) { score += 4; reasons.push(`${car.seats} plazas`); }
      if (car.type === 'suv' || car.type === 'minivan' || car.type === 'wagon') { score += 4; reasons.push(`Formato ${BODY_LABEL[car.type]}`); }
      if (car.trunk_liters && car.trunk_liters >= 400) { score += 3; reasons.push(`Maletero ${car.trunk_liters} L`); }
      if ((car.airbags ?? 0) >= 6) score += 2;
      if (car.isofix) score += 1;
      break;
    case 'adventure':
      if (car.traction === '4x4' || car.traction === 'awd') { score += 10; reasons.push('Tracción 4x4/AWD'); }
      if (car.type === 'suv' || car.type === 'pickup') { score += 6; reasons.push('Apto para terrenos'); }
      if (car.ground_clearance_mm && car.ground_clearance_mm >= 200) { score += 4; reasons.push(`${car.ground_clearance_mm} mm de despeje`); }
      break;
    case 'highway': {
      const cons = car.fuel_consumption_mixed_km_l;
      if (cons && cons >= 14) { score += 7; reasons.push(`Consumo mixto ${cons} km/L`); }
      if (car.fuel === 'diesel' || car.fuel === 'hibrido') score += 3;
      if (car.transmission === 'automatica') score += 2;
      if (car.trunk_liters && car.trunk_liters >= 450) { score += 4; reasons.push(`Maletero ${car.trunk_liters} L`); }
      if (car.electric_range_km && car.electric_range_km >= 400) { score += 4; reasons.push(`Autonomía ${car.electric_range_km} km`); }
      else if (car.fuel === 'electrico') score -= 2;
      break;
    }
    case 'work':
      if (car.type === 'pickup') { score += 8; reasons.push('Pick-up, efectiva para carga'); }
      if (car.type === 'minivan') score += 4;
      if (car.fuel === 'diesel') { score += 4; reasons.push('Diésel'); }
      if (car.torque_nm && car.torque_nm >= 300) { score += 4; reasons.push(`${car.torque_nm} Nm de torque`); }
      break;
  }
  return { score: Math.max(0, Math.min(score, 20)), max: 20, reasons };
}

function scoreFuel(car: Car, f: QueryIntent['fuel']): Part {
  if (!f) return EMPTY;
  if (car.fuel === f) return { score: 15, max: 15, reasons: [`Motor ${getFuelLabelFor(car.fuel)}`] };
  if (f === 'hibrido' && car.fuel === 'hibrido_enchufable') return { score: 10, max: 15, reasons: ['Híbrido enchufable, una variante de híbrido'] };
  if (f === 'electrico' && car.fuel === 'hibrido_enchufable') return { score: 7, max: 15, reasons: ['Enchufable, cerca de lo eléctrico'] };
  if (f === 'gasolina' && car.fuel === 'hibrido') return { score: 8, max: 15, reasons: ['Híbrido (usa bencina)'] };
  return { score: 0, max: 15, reasons: [] };
}

function bestSafety(car: Car): { stars: number; program?: string } {
  if (!car.safety_ratings?.length) return { stars: 0 };
  const best = [...car.safety_ratings].sort((a, b) => b.stars - a.stars || b.year - a.year)[0];
  return { stars: best.stars, program: best.program };
}

function scorePriority(car: Car, priorities: string[]): Part {
  if (priorities.length === 0) return EMPTY;
  let score = 0;
  const reasons: string[] = [];
  const per = 15 / priorities.length;
  for (const p of priorities) {
    let sub = 0;
    if (p === 'performance') {
      if (car.hp) { sub += Math.min(car.hp / 400, 1) * 9; if (car.hp >= 180) reasons.push(`${car.hp} HP`); }
      if (car.torque_nm) sub += Math.min(car.torque_nm / 500, 1) * 4;
      if (car.traction === '4x4' || car.traction === 'awd') sub += 2;
    } else if (p === 'safety') {
      const best = bestSafety(car);
      sub += best.stars * 1.6;
      if (best.stars >= 4) reasons.push(`${best.stars} estrellas ${best.program}`);
      sub += Math.min((car.airbags ?? 0) / 7, 1) * 3;
      if (car.adas && car.adas.length >= 3) { sub += 2; reasons.push(`${car.adas.length} asistencias ADAS`); }
      if (car.isofix) sub += 1;
    } else if (p === 'space') {
      if (car.trunk_liters) { sub += Math.min(car.trunk_liters / 550, 1) * 7; if (car.trunk_liters >= 450) reasons.push(`Maletero ${car.trunk_liters} L`); }
      if (car.seats >= 5) sub += 3;
      if (car.type === 'suv' || car.type === 'minivan' || car.type === 'wagon') sub += 3;
      if (car.length_mm && car.length_mm >= 4500) sub += 2;
    } else if (p === 'economy') {
      if (car.fuel === 'electrico' || car.fuel === 'hibrido' || car.fuel === 'hibrido_enchufable') { sub += 5; reasons.push('Bajo costo por kilómetro'); }
      if (car.fuel_consumption_mixed_km_l) { sub += Math.min(car.fuel_consumption_mixed_km_l / 22, 1) * 5; if (car.fuel_consumption_mixed_km_l >= 15) reasons.push(`Consumo mixto ${car.fuel_consumption_mixed_km_l} km/L`); }
      sub += Math.max(0, 1 - car.price / 30000000) * 5;
    } else if (p === 'technology') {
      if (car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable') { sub += 5; reasons.push('Electrificado'); }
      if (car.infotainment && car.infotainment.length >= 4) { sub += 4; reasons.push('Conectividad completa'); }
      if (car.adas) { sub += Math.min(car.adas.length / 5, 1) * 6; if (car.adas.length >= 4) reasons.push(`${car.adas.length} asistencias ADAS`); }
    } else if (p === 'compact') {
      if (car.length_mm) {
        sub += car.length_mm <= 3900 ? 12 : car.length_mm <= 4200 ? 9 : car.length_mm <= 4400 ? 4 : 0;
        if (car.length_mm <= 4200) reasons.push(`${nf(car.length_mm)} mm de largo, fácil de estacionar`);
      } else if (car.type === 'hatchback') sub += 6;
      if (car.type === 'hatchback') sub += 3;
    }
    score += Math.min(sub, 15) * (per / 15);
  }
  return { score: Math.min(score, 15), max: 15, reasons };
}

function scoreSeats(car: Car, min: QueryIntent['minSeats']): Part {
  if (!min) return EMPTY;
  const ok = car.seats >= min;
  return { score: ok ? 10 : 2, max: 10, reasons: ok ? [`${car.seats} plazas`] : [`${car.seats} plazas, menos de ${min}`] };
}

function scoreTransmission(car: Car, t: QueryIntent['transmission']): Part {
  if (!t) return EMPTY;
  const match = car.transmission === t || car.versions?.some(v => v.transmission === t);
  return { score: match ? 8 : 0, max: 8, reasons: match ? ['Transmisión ' + (t === 'automatica' ? 'automática' : 'manual')] : [] };
}

function scoreTraction(car: Car, t: QueryIntent['traction']): Part {
  if (!t) return EMPTY;
  const tr = new Set([car.traction, ...(car.versions ?? []).map(v => v.traction)]);
  if (t === '4x4') {
    if (tr.has('4x4') || tr.has('awd')) return { score: 7, max: 7, reasons: ['Tracción 4x4/AWD'] };
    return { score: 1, max: 7, reasons: [] };
  }
  if (tr.has(t)) return { score: 7, max: 7, reasons: [`Tracción ${t}`] };
  return { score: tr.has('awd') ? 3 : 0, max: 7, reasons: [] };
}

function scoreBody(car: Car, b: QueryIntent['bodyType']): Part {
  if (!b) return EMPTY;
  const match = car.type === b;
  return { score: match ? 5 : 0, max: 5, reasons: match ? [`Formato ${BODY_LABEL[b] ?? b}`] : [] };
}

function scoreSpecs(car: Car, i: QueryIntent): Part {
  let score = 0;
  let max = 0;
  const reasons: string[] = [];
  const check = (want: number | undefined, have: number | undefined, label: (v: number) => string) => {
    if (want === undefined) return;
    max += 10;
    if (have !== undefined && have >= want) { score += 10; reasons.push(label(have)); }
    else if (have === undefined) score += 2;
  };
  check(i.minRangeKm, car.electric_range_km, v => `Autonomía ${nf(v)} km`);
  check(i.minHp, car.hp, v => `${v} HP`);
  check(i.minBatteryKwh, car.battery_kwh, v => `Batería ${v} kWh`);
  check(i.minTrunkLiters, car.trunk_liters, v => `Maletero ${v} L`);
  check(i.minKmL, car.fuel_consumption_mixed_km_l, v => `Consumo mixto ${v} km/L`);
  return { score, max, reasons };
}

function qualityScore(car: Car): number {
  const best = bestSafety(car);
  let q = best.stars * 1.2;
  if ((car.airbags ?? 0) >= 6) q += 1.5;
  if (car.adas && car.adas.length >= 3) q += 1.5;
  if ((car.warranty_years ?? 0) >= 5) q += 1;
  return Math.min(q, 10);
}

function similarity(car: Car, ref: Car): Part {
  let score = 0;
  const reasons: string[] = [];
  if (car.type === ref.type) { score += 10; }
  const diff = Math.abs(car.price - ref.price) / ref.price;
  score += Math.max(0, 1 - diff / 0.4) * 8;
  if (car.seats === ref.seats) score += 3;
  if (car.length_mm && ref.length_mm) {
    const d = Math.abs(car.length_mm - ref.length_mm);
    score += Math.max(0, 1 - d / 400) * 5;
    if (d <= 150) reasons.push(`Tamaño similar al ${ref.model} (${nf(car.length_mm)} mm)`);
  }
  if (car.fuel === ref.fuel) score += 2;
  if (car.traction === ref.traction) score += 2;
  return { score, max: 30, reasons };
}

function isDiscontinued(car: Car): boolean {
  return car.lineup_2026 === false || !isBrandSoldNewInChile(car.brand);
}

export function scoreRecommendation(car: Car, intent: QueryIntent): { score: number; max: number; reasons: string[] } {
  const parts: Part[] = [
    scoreBudget(car, intent.budget),
    scoreUsage(car, intent.usage),
    scoreFuel(car, intent.fuel),
    scorePriority(car, intent.priorities),
    scoreSeats(car, intent.minSeats),
    scoreTransmission(car, intent.transmission),
    scoreTraction(car, intent.traction),
    scoreBody(car, intent.bodyType),
    scoreSpecs(car, intent),
  ];
  let score = 0;
  let max = 0;
  const reasons: string[] = [];
  for (const p of parts) {
    score += p.score;
    max += p.max;
    for (const r of p.reasons) if (!reasons.includes(r)) reasons.push(r);
  }
  return { score, max: Math.max(max, 1), reasons };
}

function hardFilter(cars: Car[], intent: QueryIntent): Car[] {
  const { bodyType, minYear, minSeats, includeOrigins, excludeOrigins, excludeFuels, excludeBrands, excludeBodies } = intent;
  let f = cars;
  if (bodyType) f = f.filter(c => c.type === bodyType);
  if (intent.brands.length > 0) f = f.filter(c => intent.brands.includes(c.brand));
  if (minYear && !intent.used) f = f.filter(c => c.year >= minYear);
  if (minSeats && minSeats >= 6) f = f.filter(c => c.seats >= minSeats);
  if (includeOrigins?.length) f = f.filter(c => includeOrigins.includes(c.origin_country ?? c.origin));
  if (excludeOrigins?.length) f = f.filter(c => !excludeOrigins.includes(c.origin_country ?? c.origin));
  if (excludeFuels?.length) f = f.filter(c => !excludeFuels.includes(c.fuel));
  if (excludeBrands?.length) f = f.filter(c => !excludeBrands.includes(c.brand));
  if (excludeBodies?.length) f = f.filter(c => !excludeBodies.includes(c.type));
  if (intent.fuel === 'electrico' && intent.minRangeKm) f = f.filter(c => c.fuel === 'electrico');
  const below = (want: number | undefined, have: number | undefined) => want !== undefined && have !== undefined && have < want;
  f = f.filter(c =>
    !below(intent.minRangeKm, c.electric_range_km) &&
    !below(intent.minHp, c.hp) &&
    !below(intent.minBatteryKwh, c.battery_kwh) &&
    !below(intent.minTrunkLiters, c.trunk_liters) &&
    !below(intent.minKmL, c.fuel_consumption_mixed_km_l),
  );
  if (intent.minRangeKm) f = f.filter(c => c.electric_range_km !== undefined);
  return f;
}

function pickRepresentative(cars: Car[]): Car {
  return [...cars].sort((a, b) => Number(isDiscontinued(a)) - Number(isDiscontinued(b)) || b.year - a.year)[0];
}

export function isNaturalLanguageQuery(text: string): boolean {
  const i = parseQuery(text);
  return !!(i.budget || i.usage || i.fuel || i.transmission || i.traction || i.minSeats || i.bodyType ||
    i.priorities.length || i.minRangeKm || i.minHp || i.minBatteryKwh || i.minTrunkLiters || i.minKmL ||
    i.includeOrigins?.length || i.excludeOrigins?.length || i.excludeFuels?.length || i.excludeBrands?.length ||
    i.used || i.mode === 'similar' || i.mode === 'compare');
}

export function recommend(text: string, cars: Car[] = carsData, brandList: string[] = catalogBrands): RecommendResult {
  const intent = parseQuery(text, brandList, cars);
  const hasSignal =
    !!intent.budget || !!intent.usage || !!intent.fuel || !!intent.transmission ||
    !!intent.traction || !!intent.minSeats || !!intent.bodyType ||
    intent.priorities.length > 0 || intent.brands.length > 0 || !!intent.minYear ||
    !!intent.models?.length || !!intent.minRangeKm || !!intent.minHp || !!intent.minBatteryKwh ||
    !!intent.minTrunkLiters || !!intent.minKmL || !!intent.includeOrigins?.length ||
    !!intent.excludeOrigins?.length || !!intent.excludeFuels?.length || !!intent.excludeBrands?.length || !!intent.used;
  if (!hasSignal) return { intent, list: [], unclear: true };

  const modelKeys = new Set(intent.models ?? []);
  const matched = cars.filter(c => modelKeys.has(`${c.brand}|${c.model}`));
  let reference: Car | undefined;
  if (intent.mode === 'similar' && matched.length > 0) {
    reference = pickRepresentative(matched);
    if (intent.cheaperThanRef) intent.budget = { ...intent.budget, max: Math.min(intent.budget?.max ?? Infinity, reference.price - 1) };
  }

  const pool = hardFilter(intent.mode === 'similar' ? cars.filter(c => !modelKeys.has(`${c.brand}|${c.model}`)) : cars, intent);

  const build = (car: Car, role: Recommendation['role']) => {
    const base = scoreRecommendation(car, intent);
    let score = base.score;
    let max = base.max;
    const reasons = [...base.reasons];
    if (reference) {
      const sim = similarity(car, reference);
      score += sim.score;
      max += sim.max;
      reasons.unshift(...sim.reasons);
      if (car.price < reference.price) reasons.push(`${formatPrice(reference.price - car.price)} más barato que el ${reference.model}`);
    }
    const q = qualityScore(car);
    score += q;
    max += 10;
    const discontinued = isDiscontinued(car);
    if (discontinued) {
      score *= 0.8;
      reasons.push(!isBrandSoldNewInChile(car.brand) ? 'Marca sin venta de nuevos en Chile' : 'Fuera de la parrilla 2026 (stock remanente)');
    }
    if (role === 'match') { score = max; }
    return { car, score, max, q, discontinued, role, reasons };
  };

  let scored: ReturnType<typeof build>[];
  if (intent.mode === 'model' || intent.mode === 'compare') {
    const top = intent.mode === 'compare'
      ? [...new Set(intent.models)].map(k => pickRepresentative(cars.filter(c => `${c.brand}|${c.model}` === k)))
      : matched;
    const topIds = new Set(top.map(c => c.id));
    const first = top.map(c => build(c, 'match')).sort((a, b) => Number(a.discontinued) - Number(b.discontinued) || b.car.year - a.car.year);
    const ref = pickRepresentative(top);
    reference = ref;
    const alts = cars
      .filter(c => !topIds.has(c.id) && c.type === ref.type && !isDiscontinued(c))
      .filter(c => !intent.excludeOrigins?.includes(c.origin_country ?? c.origin))
      .map(c => {
        const sim = similarity(c, ref);
        const q = qualityScore(c);
        return { car: c, score: sim.score + q, max: sim.max + 10, q, discontinued: false, role: 'alternative' as const, reasons: sim.reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    scored = [...first, ...alts];
    if (intent.mode === 'model') reference = undefined;
  } else {
    scored = pool.map(c => build(c, undefined));
    scored.sort((a, b) => b.score - a.score || b.q - a.q || a.car.price - b.car.price);
  }

  return {
    intent,
    unclear: false,
    reference,
    list: scored.map(s => ({
      car: s.car,
      affinity: Math.max(0, Math.min(100, Math.round((s.score / s.max) * 100))),
      score: s.score,
      max: s.max,
      reasons: s.reasons.slice(0, 4),
      discontinued: s.discontinued,
      role: s.role,
    })),
  };
}
