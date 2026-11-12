import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const siteUrl = (process.env.VITE_SITE_URL || 'https://autolupa.pages.dev').replace(/\/$/, '');
const SITE = 'AutoLupa';
const NOT_SOLD_NEW = ['Acura', 'Buick', 'Chrysler', 'GMC', 'Infiniti', 'Lincoln'];

const TYPE = { sedan: 'Sedán', suv: 'SUV', pickup: 'Pick-up', hatchback: 'Hatchback', minivan: 'Minivan', wagon: 'Station wagon', coupe: 'Coupé', convertible: 'Convertible' };
const FUEL = { gasolina: 'Gasolina', diesel: 'Diésel', electrico: 'Eléctrico', hibrido: 'Híbrido', hibrido_enchufable: 'Híbrido enchufable' };

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' y ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const price = (n) => `$${Number(n).toLocaleString('es-CL')}`;
const carPath = (c) => `/auto/${c.id}-${slugify(c.brand)}-${slugify(c.model)}-${c.year}`;

function loadCars() {
  const folder = join(root, 'src', 'data', 'brands');
  return readdirSync(folder)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(folder, f), 'utf8')).models || []);
}

function pairs(file, keys) {
  const src = readFileSync(join(root, 'src', 'data', file), 'utf8');
  const re = new RegExp(keys.map((k) => `${k}:\\s*'((?:[^'\\\\]|\\\\.)*)'`).join('[\\s\\S]*?'), 'g');
  return [...src.matchAll(re)].map((m) => Object.fromEntries(keys.map((k, i) => [k, m[i + 1].replace(/\\'/g, "'")])));
}

const STATIC = {
  '/autos': { title: 'Catálogo de autos nuevos en Chile', description: 'Busca y filtra autos nuevos en Chile por marca, precio, año, tipo y combustible. Precios de referencia y fichas técnicas.' },
  '/usados': { title: 'Autos Usados en Chile: Compra y Publica Gratis', description: 'Avisos de autos usados en Chile con contacto directo con el vendedor. Publica gratis y sin comisión.' },
  '/publicar-auto': { title: 'Publicar Auto Usado Gratis', description: 'Publica tu auto usado gratis en AutoLupa. Sin comisiones y con contacto directo por WhatsApp.' },
  '/tasar-auto': { title: '¿Cuánto vale tu auto? Tasador gratuito', description: 'Estima el valor de tu auto usado en Chile según marca, modelo, año y kilometraje.' },
  '/estadisticas': { title: 'Estadísticas', description: 'Estadísticas del mercado automotriz chileno: vehículos, marcas, precios promedio y más.' },
  '/estadisticas-mercado': { title: 'Estadísticas del mercado de usados', description: 'Indicadores del marketplace de autos usados de AutoLupa.' },
  '/top10': { title: 'Top 10 autos en Chile por categoría', description: 'Rankings de autos nuevos en Chile: seguridad, espacio, consumo, potencia, precio y autonomía eléctrica.' },
  '/blog': { title: 'Guías para comprar y vender autos en Chile', description: 'Guías prácticas: transferencia, revisión de usados, costo total de propiedad, crédito automotriz y más.' },
  '/glosario': { title: 'Glosario de términos automotrices', description: 'Qué significan CVT, PHEV, torque, ADAS y otros términos técnicos al comprar un auto.' },
  '/faq': { title: 'Preguntas frecuentes y compra segura', description: 'Cómo comprar y vender un auto usado sin estafas: documentos, pagos y señales de alerta.' },
  '/reclamos': { title: 'Reclamos y sugerencias', description: 'Envía un reclamo o sugerencia a AutoLupa y revisa las respuestas publicadas.' },
  '/quienes-somos': { title: 'Quiénes somos', description: 'AutoLupa: marketplace de autos usados y comparador de autos nuevos para Chile.' },
  '/contacto': { title: 'Contacto', description: 'Canales de contacto y soporte de AutoLupa.' },
  '/como-funciona': { title: 'Cómo funciona', description: 'Cómo comparar autos nuevos y comprar o publicar autos usados en AutoLupa.' },
  '/compra-segura': { title: 'Compra segura', description: 'Recomendaciones para comprar un auto usado de forma segura en Chile.' },
  '/privacidad': { title: 'Política de privacidad', description: 'Política de privacidad de AutoLupa.' },
  '/terminos': { title: 'Términos y condiciones', description: 'Términos y condiciones de AutoLupa.' },
  '/responsabilidad': { title: 'Declaración de responsabilidad', description: 'Declaración de responsabilidad de AutoLupa.' },
  '/compare': { title: 'Comparar Vehículos', description: 'Compara hasta 3 vehículos lado a lado con todas sus especificaciones.', noIndex: true },
  '/favorites': { title: 'Mis favoritos', description: 'Autos guardados en AutoLupa.', noIndex: true },
  '/mis-anuncios': { title: 'Mis avisos', description: 'Gestiona tus autos publicados en AutoLupa.', noIndex: true },
  '/moderacion': { title: 'Moderación de avisos', description: 'Panel privado de moderación de AutoLupa.', noIndex: true },
  '/tus-datos': { title: 'Tus datos', description: 'Descarga o elimina tus datos personales en AutoLupa.', noIndex: true },
};

function headFor(template, page) {
  const fullTitle = page.title ? `${page.title} | ${SITE}` : `Autos Usados y Nuevos en Chile | Publica Gratis | ${SITE}`;
  const url = `${siteUrl}${page.path === '/' ? '/' : page.path}`;
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(fullTitle)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${page.path.startsWith('/auto/') ? 'product' : 'website'}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(fullTitle)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`);
  const extra = [
    page.noIndex ? '<meta name="robots" content="noindex,nofollow" data-prerender />' : '',
    page.noCanonical ? '' : `<link rel="canonical" href="${esc(url)}" data-prerender />`,
    page.jsonLd ? `<script type="application/ld+json" data-prerender>${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');
  html = html.replace('</head>', `    ${extra}\n  </head>`);
  return html.replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
}

const shell = (inner, crumbs = []) => `
<div class="max-w-5xl mx-auto px-4 py-10 text-gray-900">
  <nav aria-label="Ruta de navegación" class="text-sm text-gray-500 mb-4"><a href="/">Inicio</a>${crumbs.map(([href, label]) => ` / ${href ? `<a href="${esc(href)}">${esc(label)}</a>` : esc(label)}`).join('')}</nav>
  ${inner}
</div>`;

const linkList = (items) => `<ul class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">${items.map(([href, label]) => `<li><a class="text-blue-700 underline" href="${esc(href)}">${esc(label)}</a></li>`).join('')}</ul>`;

function carPage(car, brandHref) {
  const discontinued = car.lineup_2026 === false || NOT_SOLD_NEW.includes(car.brand);
  const specs = [
    ['Tipo', TYPE[car.type] ?? car.type],
    ['Combustible', FUEL[car.fuel] ?? car.fuel],
    ['Plazas', car.seats],
    ['Transmisión', car.transmission === 'automatica' ? 'Automática' : 'Manual'],
    ['Tracción', String(car.traction).toUpperCase()],
    car.hp && ['Potencia', `${car.hp} HP`],
    car.torque_nm && ['Torque', `${car.torque_nm} Nm`],
    car.fuel_consumption_mixed_km_l && ['Consumo mixto', `${car.fuel_consumption_mixed_km_l} km/L`],
    car.battery_kwh && ['Batería', `${car.battery_kwh} kWh`],
    car.electric_range_km && ['Autonomía eléctrica', `${car.electric_range_km} km`],
    car.trunk_liters && ['Maletero', `${car.trunk_liters} L`],
    car.airbags && ['Airbags', car.airbags],
  ].filter(Boolean);
  const description = `${car.brand} ${car.model} ${car.year}: precio desde ${price(car.price)}. Ficha técnica, versiones, consumo, seguridad y costo total de propiedad.`;
  const url = `${siteUrl}${carPath(car)}`;
  return {
    path: carPath(car),
    title: `${car.brand} ${car.model} ${car.year} — Precio y ficha técnica`,
    description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: `${car.brand} ${car.model} ${car.year}`,
      brand: { '@type': 'Brand', name: car.brand },
      model: car.model,
      vehicleModelDate: String(car.year),
      bodyType: TYPE[car.type] ?? car.type,
      fuelType: FUEL[car.fuel] ?? car.fuel,
      vehicleTransmission: car.transmission === 'automatica' ? 'Automática' : 'Manual',
      seatingCapacity: car.seats,
      url,
      offers: {
        '@type': 'Offer',
        price: car.price,
        priceCurrency: 'CLP',
        availability: discontinued ? 'https://schema.org/Discontinued' : 'https://schema.org/InStock',
        url,
      },
    },
    body: shell(`
  <h1 class="text-3xl font-bold">${esc(car.brand)} ${esc(car.model)} ${car.year}</h1>
  <p class="text-2xl font-bold text-blue-700 mt-2">Desde ${price(car.price)}</p>
  ${discontinued ? '<p class="mt-1 text-amber-700">Fuera de la parrilla 2026 en Chile.</p>' : ''}
  <p class="mt-3">${esc(car.description)}</p>
  <h2 class="text-xl font-semibold mt-6">Ficha técnica</h2>
  <dl class="grid grid-cols-2 gap-2 mt-2">${specs.map(([k, v]) => `<div><dt class="text-sm text-gray-500">${esc(k)}</dt><dd class="font-medium">${esc(v)}</dd></div>`).join('')}</dl>
  <h2 class="text-xl font-semibold mt-6">Versiones y precios</h2>
  <ul class="mt-2">${car.versions.map((v) => `<li>${esc(v.version)} — ${price(v.price)}</li>`).join('')}</ul>
  <p class="mt-6"><a class="text-blue-700 underline" href="${esc(brandHref)}">Ver todos los modelos ${esc(car.brand)}</a> · <a class="text-blue-700 underline" href="/autos">Catálogo completo</a></p>`,
    [[brandHref, car.brand], [null, `${car.model} ${car.year}`]]),
  };
}

function brandPage(brand, cars) {
  const slug = slugify(brand);
  const sorted = [...cars].sort((a, b) => Number(a.lineup_2026 === false) - Number(b.lineup_2026 === false) || a.price - b.price);
  const min = Math.min(...cars.map((c) => c.price));
  const year = new Date().getFullYear();
  return {
    path: `/marcas/${slug}`,
    title: `${brand} en Chile ${year} — Modelos, precios y fichas técnicas`,
    description: `Catálogo ${brand} en Chile: ${cars.length} modelos desde ${price(min)}. Compara versiones, precios y especificaciones.`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Brand', name: brand, url: `${siteUrl}/marcas/${slug}`, description: `Catálogo ${brand} en Chile con ${cars.length} modelos, precios y fichas técnicas.` },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: brand, item: `${siteUrl}/marcas/${slug}` },
        ] },
      ],
    },
    body: shell(`
  <h1 class="text-3xl font-bold">${esc(brand)}</h1>
  <p class="mt-2">${cars.length} modelos ${esc(brand)} en el catálogo chileno, desde ${price(min)}.</p>
  <ul class="mt-4 space-y-1">${sorted.map((c) => `<li><a class="text-blue-700 underline" href="${esc(carPath(c))}">${esc(c.model)} ${c.year}</a> — ${esc(TYPE[c.type] ?? c.type)}, ${esc(FUEL[c.fuel] ?? c.fuel)}, desde ${price(c.price)}${c.lineup_2026 === false ? ' (fuera de parrilla 2026)' : ''}</li>`).join('')}</ul>`,
    [[null, brand]]),
  };
}

function main() {
  const templatePath = join(dist, 'index.html');
  if (!existsSync(templatePath)) throw new Error('dist/index.html no existe: ejecuta vite build antes del prerender');
  const template = readFileSync(templatePath, 'utf8')
    .replace(/<meta (name|property)="(description|keywords|og:[a-z:]+|twitter:[a-z:]+)"/g, '<meta data-prerender $1="$2"');
  const cars = loadCars();
  const byBrand = new Map();
  for (const c of cars) byBrand.set(c.brand, [...(byBrand.get(c.brand) ?? []), c]);
  const brands = [...byBrand.keys()].sort((a, b) => a.localeCompare(b, 'es'));
  const regions = pairs('chileRegions.ts', ['slug', 'name']);
  const articles = pairs('articles.ts', ['slug', 'title', 'excerpt']);

  const pages = [];
  const brandLinks = brands.map((b) => [`/marcas/${slugify(b)}`, b]);
  pages.push({
    path: '/',
    title: '',
    description: 'Autos usados y nuevos en Chile. Publica tu auto gratis, compara precios, kilometraje y especificaciones. Sin comisiones ni letra chica.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: SITE, url: siteUrl, potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/autos?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
        { '@type': 'Organization', name: SITE, url: siteUrl, logo: `${siteUrl}/icon-512.png` },
      ],
    },
    body: shell(`
  <h1 class="text-3xl font-bold">Encuentra tu auto ideal</h1>
  <p class="mt-2">Compara ${cars.length} autos nuevos de ${brands.length} marcas con precios de referencia en Chile, revisa avisos de autos usados y publica el tuyo gratis, sin comisión.</p>
  <p class="mt-4"><a class="text-blue-700 underline" href="/autos">Ver catálogo de autos nuevos</a> · <a class="text-blue-700 underline" href="/usados">Autos usados</a> · <a class="text-blue-700 underline" href="/tasar-auto">¿Cuánto vale tu auto?</a> · <a class="text-blue-700 underline" href="/publicar-auto">Publicar gratis</a></p>
  <h2 class="text-xl font-semibold mt-6">Marcas</h2>${linkList(brandLinks)}`),
  });
  pages.push({
    path: '/autos',
    ...STATIC['/autos'],
    body: shell(`
  <h1 class="text-3xl font-bold">Catálogo de autos nuevos</h1>
  <p class="mt-2">${cars.length} modelos de ${brands.length} marcas con versiones, precios de referencia y fichas técnicas.</p>${linkList(brandLinks)}`, [[null, 'Catálogo']]),
  });
  for (const [path, meta] of Object.entries(STATIC)) {
    if (path === '/autos') continue;
    pages.push({ path, ...meta, body: shell(`<h1 class="text-3xl font-bold">${esc(meta.title)}</h1><p class="mt-2">${esc(meta.description)}</p>`, [[null, meta.title]]) });
  }
  for (const b of brands) pages.push(brandPage(b, byBrand.get(b)));
  for (const c of cars) pages.push(carPage(c, `/marcas/${slugify(c.brand)}`));
  for (const r of regions) {
    pages.push({
      path: `/autos-usados-en/${r.slug}`,
      title: `Autos usados en ${r.name}`,
      description: `Avisos de autos usados en la región de ${r.name}, con contacto directo con el vendedor.`,
      body: shell(`<h1 class="text-3xl font-bold">Autos usados en ${esc(r.name)}</h1><p class="mt-2">Avisos de autos usados publicados en la región de ${esc(r.name)}.</p>${linkList(regions.map((x) => [`/autos-usados-en/${x.slug}`, x.name]))}`, [['/usados', 'Autos usados'], [null, r.name]]),
    });
  }
  for (const a of articles) {
    pages.push({
      path: `/blog/${a.slug}`,
      title: a.title,
      description: a.excerpt,
      body: shell(`<article><h1 class="text-3xl font-bold">${esc(a.title)}</h1><p class="mt-2">${esc(a.excerpt)}</p></article>`, [['/blog', 'Blog'], [null, a.title]]),
    });
  }

  for (const page of pages) {
    const html = headFor(template, page);
    const file = page.path === '/' ? join(dist, 'index.html') : join(dist, `${page.path.slice(1)}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  writeFileSync(join(dist, '404.html'), headFor(template, {
    path: '/404',
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    noIndex: true,
    noCanonical: true,
    body: shell('<h1 class="text-3xl font-bold">Página no encontrada</h1><p class="mt-2">La ruta a la que intentaste acceder no existe.</p><p class="mt-4"><a class="text-blue-700 underline" href="/">Volver al inicio</a> · <a class="text-blue-700 underline" href="/autos">Catálogo</a></p>'),
  }));
  writeFileSync(join(dist, 'spa.html'), template.replace(/<title>[^<]*<\/title>/, `<title>${SITE}</title>`));
  const legacy = brands
    .map((b) => [encodeURI(b.toLowerCase().replace(/\s+/g, '-')), slugify(b)])
    .filter(([from, to]) => from !== to);
  const baseRedirects = existsSync(join(dist, '_redirects')) ? readFileSync(join(dist, '_redirects'), 'utf8').trim().split('\n') : [];
  const rules = [
    ...legacy.flatMap(([from, to]) => [`/marcas/${from} /marcas/${to} 301`, `/marca/${from} /marcas/${to} 301`]),
    ...baseRedirects.filter((line) => !legacy.some(([from]) => line.includes(`/${from} `))),
  ];
  writeFileSync(join(dist, '_redirects'), rules.join('\n') + '\n');
  console.log(`[prerender] ${pages.length} páginas + 404.html + spa.html`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
