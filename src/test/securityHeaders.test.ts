import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicDir = join(process.cwd(), 'public');

function readPublicFile(path: string): string {
  return readFileSync(join(publicDir, path), 'utf8');
}

describe('cabeceras y archivos de seguridad', () => {
  const headers = readPublicFile('_headers');

  it('aplica CSP con frame-ancestors, nosniff y HSTS en todas las respuestas', () => {
    expect(headers).toMatch(/Content-Security-Policy:.*default-src 'self'/);
    expect(headers).toMatch(/Content-Security-Policy:.*frame-ancestors 'none'/);
    expect(headers).toMatch(/Content-Security-Policy:.*object-src 'none'/);
    expect(headers).toMatch(/Content-Security-Policy:.*connect-src[^;]*supabase\.co/);
    expect(headers).toMatch(/Content-Security-Policy:.*script-src[^;]*plausible\.io/);
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('X-Frame-Options: DENY');
    expect(headers).toContain('Strict-Transport-Security:');
    expect(headers).toContain('Referrer-Policy: strict-origin-when-cross-origin');
  });

  it('no cachea las rutas con datos personales', () => {
    expect(headers).toMatch(/\/tus-datos\n\s+Cache-Control: private, no-store/);
    expect(headers).toMatch(/\/mis-anuncios\n\s+Cache-Control: private, no-store/);
    expect(headers).toMatch(/\/moderacion\n\s+Cache-Control: private, no-store/);
    expect(headers).toMatch(/\/assets\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
  });

  it('publica security.txt con contacto, caducidad y política', () => {
    const security = readPublicFile(join('.well-known', 'security.txt'));
    expect(security).toMatch(/^Contact: mailto:/m);
    expect(security).toMatch(/^Expires: \d{4}-\d{2}-\d{2}T/m);
    expect(security).toMatch(/^Policy: https:\/\//m);
    expect(security).toMatch(/^Canonical: https:\/\//m);
  });

  it('robots.txt bloquea las rutas privadas y publica el sitemap', () => {
    const robots = readPublicFile('robots.txt');
    expect(robots).toContain('Disallow: /mis-anuncios');
    expect(robots).toContain('Disallow: /moderacion');
    expect(robots).toMatch(/^Sitemap: https:/m);
  });
});
