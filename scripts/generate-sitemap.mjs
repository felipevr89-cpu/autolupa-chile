import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadLocalEnv() {
  try {
    const content = readFileSync(join(root, '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    return;
  }
}

loadLocalEnv();

const siteUrl = (process.env.VITE_SITE_URL || 'https://autolupa.pages.dev').replace(/\/$/, '');

const staticRoutes = [
  ['/', 'daily', 1.0],
  ['/usados', 'hourly', 1.0],
  ['/publicar-auto', 'monthly', 0.8],
  ['/compare', 'weekly', 0.8],
  ['/favorites', 'weekly', 0.6],
  ['/estadisticas', 'weekly', 0.7],
  ['/top10', 'weekly', 0.5],
  ['/privacidad', 'monthly', 0.3],
  ['/terminos', 'monthly', 0.3],
  ['/blog', 'weekly', 0.7],
  ['/estadisticas-mercado', 'weekly', 0.7],
  ['/glosario', 'weekly', 0.8],
  ['/reclamos', 'weekly', 0.6],
];

function brandSlugs() {
  const folder = join(root, 'src', 'data', 'brands');
  return readdirSync(folder)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(join(folder, file), 'utf8')).brand)
    .filter((brand) => typeof brand === 'string' && brand.length > 0)
    .map((brand) => brand.toLowerCase().replace(/\s+/g, '-'));
}

function articleSlugs() {
  const source = readFileSync(join(root, 'src', 'data', 'articles.ts'), 'utf8');
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
}

function regionSlugs() {
  const source = readFileSync(join(root, 'src', 'data', 'chileRegions.ts'), 'utf8');
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
}

async function activeListingSlugs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const now = new Date().toISOString();
  const params = new URLSearchParams({
    select: 'slug',
    status: 'eq.active',
    published_at: `lte.${now}`,
    or: `(expires_at.is.null,expires_at.gt.${now})`,
    limit: '5000',
  });

  try {
    const response = await fetch(`${url}/rest/v1/used_listings?${params.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();
    return rows.map((row) => row.slug).filter((slug) => typeof slug === 'string');
  } catch (error) {
    console.warn(`[sitemap] avisos activos no disponibles: ${error.message}`);
    return [];
  }
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const routes = [
  ...staticRoutes.map(([path, changefreq, priority]) => ({ loc: `${siteUrl}${path}`, changefreq, priority })),
  ...brandSlugs().map((slug) => ({ loc: `${siteUrl}/marca/${slug}`, changefreq: 'weekly', priority: 0.7 })),
  ...regionSlugs().map((slug) => ({ loc: `${siteUrl}/autos-usados-en/${slug}`, changefreq: 'daily', priority: 0.8 })),
  ...articleSlugs().map((slug) => ({ loc: `${siteUrl}/blog/${slug}`, changefreq: 'monthly', priority: 0.7 })),
  ...(await activeListingSlugs()).map((slug) => ({ loc: `${siteUrl}/usados/${slug}`, changefreq: 'daily', priority: 0.6 })),
];

const seen = new Set();
const urls = routes.filter((route) => {
  if (seen.has(route.loc)) return false;
  seen.add(route.loc);
  return true;
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((route) =>
    [
      '  <url>',
      `    <loc>${escapeXml(route.loc)}</loc>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log(`[sitemap] ${urls.length} URLs escritas en public/sitemap.xml`);
