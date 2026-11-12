import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brandSlug, legacyBrandSlug } from '../lib/brandSlug';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('SEO e indexación', () => {
  it('genera slugs de marca ASCII', () => {
    expect(brandSlug('Citroën')).toBe('citroen');
    expect(brandSlug('Škoda')).toBe('skoda');
    expect(brandSlug('Lynk & Co')).toBe('lynk-y-co');
    expect(brandSlug('Mercedes-Benz')).toBe('mercedes-benz');
    expect(legacyBrandSlug('Citroën')).toBe('citroën');
  });

  it('no usa un comodín SPA que devuelva 200 en rutas inexistentes', () => {
    const redirects = read('public/_redirects');
    expect(redirects).not.toMatch(/^\/\*\s/m);
    expect(redirects).toMatch(/^\/marca\/:slug \/marcas\/:slug 301$/m);
    expect(redirects).toMatch(/^\/usados\/\* \/spa 200$/m);
    expect(redirects).not.toMatch(/^\/auto\/\*/m);
  });

  it('el build ejecuta el prerender', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts.build).toContain('scripts/prerender.mjs');
  });

  it('el sitemap no publica rutas personales ni slugs Unicode', () => {
    const sitemap = read('public/sitemap.xml');
    expect(sitemap).not.toContain('/compare<');
    expect(sitemap).not.toContain('/tus-datos<');
    expect(sitemap).toContain('/marcas/citroen<');
    const brandUrls = sitemap.match(/\/marcas\/[^<]+/g) ?? [];
    expect(brandUrls.length).toBeGreaterThan(90);
    for (const url of brandUrls) expect(url).toMatch(/^\/marcas\/[a-z0-9-]+$/);
  });

  it('robots bloquea la plantilla SPA interna', () => {
    expect(read('public/robots.txt')).toMatch(/^Disallow: \/spa$/m);
  });
});
