// Busca en Wikimedia Commons imágenes candidatas para los modelos que hoy
// están en silueta y escribe candidates-<fecha>.json para curaduría manual.
// Uso: node scripts/find-commons-images.mjs [--ids=63,84] [--limit=6]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BRANDS_DIR = path.join(ROOT, 'src', 'data', 'brands');
const MANIFEST = path.join(ROOT, 'src', 'data', 'carImages.json');
const OUT = path.join(ROOT, 'scripts', `candidates-${new Date().toISOString().slice(0, 10)}.json`);

const UA = 'AutoLupa/1.0 (https://autolupa.pages.dev; catalog images) node-fetch';

const idsArg = process.argv.find((a) => a.startsWith('--ids='));
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const ONLY_IDS = idsArg ? new Set(idsArg.slice(6).split(',')) : null;
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 6;

const TERM_OVERRIDES = {
  63: ['BYD Tang L DM', 'BYD Tang L'],
  95: ['Chery Tiggo 2', 'Chirey Tiggo 2 Pro'],
  98: ['Chery Tiggo 4 Pro', 'Chery Tiggo 4 Pro Max', 'Chirey Tiggo 4 Pro'],
  107: ['Chevrolet Captiva EV', 'Chevrolet Captiva 2026'],
  146: ['DFSK C37', 'DFSK Supervan'],
  223: ['Great Wall Poer'],
  296: ['JMC Teshun', 'JMC Touring'],
  300: ['Kaiyi E5', 'Kaiyi Xingjian'],
  364: ['Livan S7', 'Livan 7 SUV'],
  433: ['MG RX8', 'Roewe RX8'],
  439: ['MINI Cooper 2025', 'MINI Cooper F56', 'MINI Countryman 2024'],
  510: ['Renault Logan', 'Renault Logan 2024'],
  527: ['Shineray T30', 'Shineray pickup'],
  528: ['Shineray X30 van', 'Shineray Cargo'],
  529: ['Shineray X5', 'Brilliance Shineray'],
  615: ['Zhengzhou Nissan Navara', 'Dongfeng Nissan Navara'],
  616: ['ZX Auto Admiral', 'Zhongxing SUV'],
  626: ['Ford Territory', 'Ford Territory 2024'],
  627: ['Ford Maverick', 'Ford Maverick 2024'],
  629: ['Soueast S06', 'Soueast'],
  630: ['Soueast S06', 'Soueast'],
  632: ['Soueast S08', 'Soueast'],
};

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(s) {
  return normalize(s).toLowerCase().split(' ').filter((t) => t.length > 2);
}

const BAD = /logo|badge|emblem|wordmark|icon|map$|flag|chart|diagram|signature|interior|engine|dashboard/i;

async function api(params) {
  const url = `https://commons.wikimedia.org/w/api.php?format=json&${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripTags(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function searchCandidates(brand, model, terms) {
  const results = [];
  const seen = new Set();
  for (const term of terms) {
    try {
      const data = await api({
        action: 'query',
        list: 'search',
        srsearch: term,
        srnamespace: '6',
        srlimit: '12',
      });
      for (const hit of data.query?.search || []) {
        const title = hit.title;
        if (seen.has(title)) continue;
        if (!/\.(jpe?g|png)$/i.test(title)) continue;
        if (BAD.test(title)) continue;
        seen.add(title);
        results.push(title);
      }
    } catch {
      /* seguimos con el siguiente término */
    }
    await sleep(120);
    if (results.length >= LIMIT * 3) break;
  }

  if (results.length === 0) return [];
  const batch = results.slice(0, LIMIT * 2);
  try {
    const data = await api({
      action: 'query',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: '1000',
    });
    const pages = Object.values(data.query?.pages || {});
    const brandToks = tokens(brand);
    const modelToks = tokens(model);
    const scored = [];
    for (const page of pages) {
      const ii = page.imageinfo?.[0];
      if (!ii) continue;
      const title = normalize(page.title).toLowerCase();
      const brandOk = brandToks.some((t) => title.includes(t));
      const modelOk = modelToks.some((t) => title.includes(t));
      const meta = ii.extmetadata || {};
      scored.push({
        title: page.title,
        thumb: ii.thumburl || ii.url,
        descriptionurl: ii.descriptionurl,
        width: ii.width,
        height: ii.height,
        license: stripTags(meta.LicenseShortName?.value),
        artist: stripTags(meta.Artist?.value).slice(0, 80),
        match: `${brandOk ? 'B' : '-'}${modelOk ? 'M' : '-'}`,
        score: (brandOk ? 2 : 0) + (modelOk ? 3 : 0),
      });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, LIMIT);
  } catch {
    return [];
  }
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const cars = [];
  for (const file of fs.readdirSync(BRANDS_DIR).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, file), 'utf8'));
    (data.models || []).forEach((m) => cars.push({ ...m, brand: data.brand }));
  }

  const missing = cars.filter((car) => {
    const entry = manifest[String(car.id)];
    return !entry || !entry.file;
  });
  console.log(`Modelos en silueta: ${missing.length}`);

  const output = {};
  let processed = 0;
  for (const car of missing) {
    if (ONLY_IDS && !ONLY_IDS.has(String(car.id))) continue;
    processed++;
    const terms = TERM_OVERRIDES[car.id] || [
      `${car.brand} ${car.model} car`,
      `${car.brand} ${car.model} (automóvil)`,
      `${car.brand} ${car.model}`,
    ];
    const candidates = await searchCandidates(car.brand, car.model, terms);
    output[car.id] = {
      brand: car.brand,
      model: car.model,
      type: car.type,
      terms,
      candidates,
    };
    console.log(
      `${String(car.id).padStart(4)} ${car.brand} ${car.model}: ${candidates.length} candidatas` +
        (candidates.length ? ` → ${candidates[0].title}` : ''),
    );
    await sleep(150);
  }

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`\nCandidatas en ${path.relative(ROOT, OUT)} (${processed} modelos)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
