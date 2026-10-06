// Imprime categorías, licencia y tamaño de archivos de Commons para
// verificar la curaduría de las fotos candidatas.
// Uso: node scripts/check-commons.cjs [--ids=63,84]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UA = 'AutoLupa/1.0 (https://autolupa.pages.dev; catalog images) node-fetch';

const PICKS = require('./picks-lote18.cjs');

const idsArg = process.argv.find((a) => a.startsWith('--ids='));
const only = idsArg ? new Set(idsArg.slice(6).split(',')) : null;

function stripTags(v) {
  return String(v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
    prop: 'categories|imageinfo',
    cllimit: '50',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1000',
  });
  const page = Object.values(data.query.pages)[0];
  if (!page || !page.imageinfo) return null;
  const ii = page.imageinfo[0];
  const meta = ii.extmetadata || {};
  return {
    categories: (page.categories || []).map((c) => c.title.replace('Category:', '')),
    license: stripTags(meta.LicenseShortName?.value),
    artist: stripTags(meta.Artist?.value).slice(0, 50),
    width: ii.width,
    height: ii.height,
    thumb: ii.thumburl,
  };
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'carImages.json'), 'utf8'));
  const usedSources = new Set(
    Object.values(manifest).filter((v) => v && v.source).map((v) => v.source),
  );
  const usedFiles = new Set(Object.values(manifest).filter((v) => v && v.file).map((v) => v.file));

  const entries = Object.entries(PICKS).filter(([id]) => !only || only.has(id));
  for (const [id, file] of entries) {
    try {
      const info_ = await info(file);
      if (!info_) {
        console.log(`${id} | ${file} | SIN INFO`);
        continue;
      }
      const source = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
      const dupSource = usedSources.has(source) ? ' DUP-FUENTE' : '';
      const dupFile = usedFiles.has(id + '.jpg') ? '' : '';
      console.log(
        `${id} | ${file} | ${info_.license} | ${info_.width}x${info_.height}${dupSource}${dupFile}\n     cats: ${info_.categories.slice(0, 6).join(' / ')}`,
      );
    } catch (e) {
      console.log(`${id} | ${file} | ERROR ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
