import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(file: string): string {
  return readFileSync(join(root, file), 'utf8');
}

function pngSize(file: string): { width: number; height: number } {
  const buffer = readFileSync(join(root, 'public', file));
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe('PWA instalable', () => {
  const manifest = JSON.parse(read('public/manifest.json')) as { icons: Array<{ src: string; sizes: string; type: string }>; display: string; start_url: string };

  it('declara display standalone, start_url y ámbito', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
  });

  it('ofrece iconos PNG de 192 y 512 además del SVG', () => {
    const sources = manifest.icons.map((icon) => `${icon.src} ${icon.sizes} ${icon.type}`);
    expect(sources).toContain('/icon-192.png 192x192 image/png');
    expect(sources).toContain('/icon-512.png 512x512 image/png');
    expect(sources.some((entry) => entry.startsWith('/favicon.svg'))).toBe(true);
  });

  it('los iconos PNG existen con sus dimensiones', () => {
    expect(pngSize('apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
    expect(pngSize('icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(pngSize('icon-512.png')).toEqual({ width: 512, height: 512 });
  });

  it('index.html declara los meta de iOS para abrir en pantalla completa', () => {
    const html = read('index.html');
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
    expect(html).toContain('<meta name="mobile-web-app-capable" content="yes" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="default" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="AutoLupa" />');
    expect(html).toContain('<link rel="manifest" href="/manifest.json" />');
    expect(html).toContain('<meta name="theme-color" content="#2563eb" />');
  });

  it('registra el service worker y cachea el offline', () => {
    expect(read('src/main.tsx')).toContain("navigator.serviceWorker.register('/sw.js')");
    expect(read('public/sw.js')).toContain("caches.match('/index.html')");
  });
});
