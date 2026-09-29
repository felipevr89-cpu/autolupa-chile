// Resuelve la mejor imagen de Wikipedia para cada auto, la descarga a
// public/car-images/<id>.<ext> y genera src/data/carImages.json con atribución.
// Uso: node scripts/fetch-images.cjs [--force]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BRANDS_DIR = path.join(ROOT, 'src', 'data', 'brands');
const OUT_DIR = path.join(ROOT, 'public', 'car-images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'carImages.json');
const FORCE = process.argv.includes('--force');
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity;

const UA = 'AutoLupa/1.0 (https://autolupa.pages.dev; catalog images) node-fetch';

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const BRAND_ALIASES = {
  GWM: ['Haval', 'Ora', 'Great Wall'],
  KGM: ['SsangYong', 'KG Mobility'],
  KYC: ['Kaiyi'],
  ZNA: ['Dongfeng', 'ZNA'],
};

// brand|model → término de búsqueda alternativo (modelos rebautizados)
const MODEL_OVERRIDES = {
  'Kia|Morning': 'Kia Picanto',
  'Nissan|March': 'Nissan Micra',
  'GWM|Haval H6 HEV': 'Haval H6',
  'GWM|H6 Híbrido': 'Haval H6',
  'GWM|H6 PHEV': 'Haval H6',
  'GWM|H6': 'Haval H6',
  'GWM|Jolion': 'Haval Jolion',
  'GWM|Haval Jolion': 'Haval Jolion',
  'GWM|Jolion Pro': 'Haval Jolion',
  'GWM|Jolion Pro Híbrido': 'Haval Jolion',
  'GWM|Dargo': 'Haval Dargo',
  'GWM|ORA 03': 'Ora Funky Cat',
  'ORA|03': 'Ora Funky Cat',
  'GWM|Poer': 'Great Wall Poer',
  'GWM|Poer Plus': 'Great Wall Poer',
  'GWM|Poer P500 Híbrido': 'Great Wall Poer',
  'GWM|Wingle 5': 'Great Wall Wingle',
  'GWM|Wingle 7': 'Great Wall Wingle',
  'KGM|Rexton': 'SsangYong Rexton',
  'KGM|Musso Grand': 'SsangYong Musso',
  'Suzuki|S-Cross': 'Suzuki SX4 S-Cross',
  'Suzuki|Across Hybrid': 'Suzuki Across',
  'Cupra|Ateca': 'Cupra Ateca',
  'Mercedes-Benz|EQG': 'Mercedes-Benz EQG',
  'Renault|Arkana MHEV': 'Renault Arkana',
};

function buildSearchTerms(brand, model) {
  const b = normalize(brand);
  const m = normalize(model);
  const terms = [];

  const override = MODEL_OVERRIDES[`${brand}|${model}`];
  if (override) terms.push(override);

  (BRAND_ALIASES[brand] || []).forEach((alias) => {
    terms.push(`${alias} ${m}`);
  });

  terms.push(`${b} ${m} (automóvil)`);
  terms.push(`${b} ${m} car`);
  terms.push(`${b} ${m}`);
  if (m.startsWith('Serie ')) {
    const num = m.replace('Serie ', '');
    terms.unshift(`BMW ${num} Series`);
    terms.push(`BMW ${num}`);
  }
  if (m.startsWith('Clase ')) {
    const letter = m.replace('Clase ', '');
    terms.unshift(`Mercedes-Benz ${letter}-Class`);
    terms.push(`Mercedes-${letter}-Class`);
  }
  return [...new Set(terms)];
}

const STOPWORDS = new Set(['de', 'la', 'el', 'and', 'the', 'car', 'automovil', 'automóvil', 'serie', 'clase', 'model', 'new', 'nuevo', 'nueva']);
function tokens(s) {
  return normalize(s).toLowerCase().split(' ').filter((t) => t.length > 1 && !STOPWORDS.has(t));
}
function titleMatchesCar(title, brand, model) {
  const t = normalize(title).toLowerCase();
  const brandVariants = [brand, ...(BRAND_ALIASES[brand] || [])];
  const brandToks = brandVariants.flatMap((bv) => tokens(bv));
  const modelToks = tokens(model);
  const brandOk = brandToks.length === 0 || brandToks.some((tok) => t.includes(tok));
  const modelOk = modelToks.length === 0 || modelToks.some((tok) => t.includes(tok));
  return brandOk && modelOk;
}

const BAD_IMG = /logo|badge|emblem|wordmark|icon|map|flag|chart|diagram|signature/i;
function looksLikePhoto(url) {
  if (BAD_IMG.test(url)) return false;
  return /\.(jpe?g|png|webp)/i.test(url);
}

async function j(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resolveImage(wiki, term, brand, model) {
  const searchUrl = `https://${wiki}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&srlimit=5`;
  const searchData = await j(searchUrl);
  const pages = searchData.query?.search || [];
  const candidate = pages.find((p) => titleMatchesCar(p.title, brand, model));
  if (!candidate) return null;

  const imgUrl = `https://${wiki}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.title)}&prop=pageimages&piprop=thumbnail|name&pithumbsize=800&format=json`;
  const imgData = await j(imgUrl);
  const imgPage = Object.values(imgData.query?.pages || {})[0];
  const source = imgPage?.thumbnail?.source;
  const name = imgPage?.pageimage;
  if (!source || !looksLikePhoto(source)) return null;
  if (name && BAD_IMG.test(name)) return null;

  let attribution = '', license = '', descUrl = '';
  if (name) {
    try {
      const fileUrl = `https://${wiki}.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(name)}&prop=imageinfo&iiprop=extmetadata|url&format=json`;
      const fileData = await j(fileUrl);
      const filePage = Object.values(fileData.query?.pages || {})[0];
      const ii = filePage?.imageinfo?.[0];
      const meta = ii?.extmetadata || {};
      attribution = (meta.Artist?.value || '').replace(/<[^>]+>/g, '').trim();
      license = (meta.LicenseShortName?.value || '').trim();
      descUrl = ii?.descriptionurl || '';
    } catch {}
  }
  return { source, page: `https://${wiki}.wikipedia.org/wiki/${encodeURIComponent(candidate.title)}`, attribution, license, descUrl };
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('download HTTP ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function extFromUrl(url) {
  const m = url.match(/\.(jpe?g|png|webp)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(BRANDS_DIR).filter((f) => f.endsWith('.json'));
  const cars = [];
  for (const f of files) {
    const jd = JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, f), 'utf8'));
    (jd.models || []).forEach((m) => cars.push(m));
  }

  const manifest = fs.existsSync(MANIFEST) && !FORCE ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  let found = 0, failed = 0, skipped = 0, bytes = 0, processed = 0;

  for (const car of cars) {
    if (processed >= LIMIT) break;
    const key = String(car.id);
    if (manifest[key] && manifest[key].file && !FORCE) { skipped++; found++; continue; }
    processed++;

    const terms = buildSearchTerms(car.brand, car.model);
    let result = null;
    for (const term of terms) {
      for (const wiki of ['es', 'en']) {
        try {
          result = await resolveImage(wiki, term, car.brand, car.model);
        } catch { result = null; }
        await sleep(120);
        if (result) break;
      }
      if (result) break;
    }

    if (!result) {
      manifest[key] = { file: null };
      failed++;
      console.log(`✗ ${car.brand} ${car.model} (id ${car.id})`);
      continue;
    }

    const ext = extFromUrl(result.source);
    const fileName = `${car.id}.${ext}`;
    try {
      const size = await download(result.source, path.join(OUT_DIR, fileName));
      bytes += size;
      manifest[key] = {
        file: `/car-images/${fileName}`,
        attribution: result.attribution || null,
        license: result.license || null,
        source: result.descUrl || result.page,
      };
      found++;
      console.log(`✓ ${car.brand} ${car.model} → ${fileName} (${(size / 1024).toFixed(0)} KB)`);
    } catch (e) {
      manifest[key] = { file: null };
      failed++;
      console.log(`✗ download ${car.brand} ${car.model}: ${e.message}`);
    }
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0));
    await sleep(80);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0));
  console.log(`\nTotal: ${cars.length} | con imagen: ${found} | sin imagen: ${failed} | ya existían: ${skipped} | ${(bytes / 1048576).toFixed(1)} MB descargados`);
}

main();
