// Descarga las fotos del Lote 18 desde Wikimedia Commons a 1000px de ancho,
// las guarda en public/car-images/<id>.jpg y actualiza src/data/carImages.json
// con source, license y attribution. Completa también los ids del catálogo que
// aún no estaban en el manifiesto.
// Uso: node scripts/download-picks.cjs [--dry-run]
const fs = require('fs');
const path = require('path');
const PICKS = require('./picks-lote18.cjs');

const ROOT = path.resolve(__dirname, '..');
const BRANDS_DIR = path.join(ROOT, 'src', 'data', 'brands');
const OUT_DIR = path.join(ROOT, 'public', 'car-images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'carImages.json');
const DRY = process.argv.includes('--dry-run');

const UA = 'AutoLupa/1.0 (https://autolupa.pages.dev; catalog images) node-fetch';
const WIDTH = 1000;

function stripTags(v) {
  return String(v || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

async function api(params) {
  const url = `https://commons.wikimedia.org/w/api.php?format=json&${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function info(file) {
  const data = await api({
    action: 'query',
    titles: 'File:' + file,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: String(WIDTH),
  });
  const page = Object.values(data.query.pages)[0];
  if (!page || !page.imageinfo) return null;
  const ii = page.imageinfo[0];
  const meta = ii.extmetadata || {};
  const served = (ii.thumburl || '').match(/\/(\d+)px-/);
  return {
    thumb: ii.thumburl,
    width: served ? Number(served[1]) : ii.width,
    source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`,
    license: stripTags(meta.LicenseShortName?.value),
    attribution: stripTags(meta.Artist?.value).slice(0, 60),
    page: ii.descriptionurl,
  };
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10000) throw new Error(`archivo demasiado pequeño: ${buf.length} bytes`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function readCatalog() {
  const map = new Map();
  for (const f of fs.readdirSync(BRANDS_DIR).filter((x) => x.endsWith('.json'))) {
    const jd = JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, f), 'utf8'));
    (jd.models || []).forEach((m) => map.set(String(m.id), m));
  }
  return map;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const catalog = readCatalog();
  const usedSources = new Set(
    Object.values(manifest).filter((v) => v && v.source).map((v) => v.source),
  );

  const ids = Object.keys(PICKS).map(Number).sort((a, b) => a - b);
  let bytes = 0;
  let ok = 0;

  for (const id of ids) {
    const file = PICKS[id];
    const car = catalog.get(String(id));
    const label = car ? `${car.brand} ${car.model}` : 'SIN EN CATÁLOGO';
    try {
      const meta = await info(file);
      if (!meta || !meta.thumb) throw new Error('sin imageinfo');
      if (!meta.license || !meta.attribution) throw new Error('falta licencia o autor');
      const prev = manifest[String(id)];
      if (usedSources.has(meta.source) && (!prev || prev.source !== meta.source)) {
        throw new Error('source duplicado');
      }
      usedSources.add(meta.source);
      if (meta.width < 800) throw new Error(`thumb solo ${meta.width}px`);
      const dest = path.join(OUT_DIR, `${id}.jpg`);
      const size = DRY ? 0 : await download(meta.thumb, dest);
      bytes += size;
      manifest[String(id)] = {
        file: `/car-images/${id}.jpg`,
        attribution: meta.attribution,
        license: meta.license,
        source: meta.source,
      };
      ok++;
      console.log(`✓ ${id} ${label} → ${id}.jpg (${meta.license}, ${meta.width}px, ${(size / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.log(`✗ ${id} ${label}: ${e.message}`);
      process.exitCode = 1;
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  for (const id of catalog.keys()) {
    if (!manifest[id]) {
      manifest[id] = { file: null };
      console.log(`· ${id} sin foto (se agrega al manifiesto como null)`);
    }
  }

  const ordered = {};
  Object.keys(manifest)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((n) => {
      ordered[n] = manifest[n];
    });

  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify(ordered, null, 2) + '\n');
  console.log(`\n${ok}/${ids.length} fotos | ${(bytes / 1048576).toFixed(1)} MB${DRY ? ' (dry-run)' : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
