import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Blog } from '../pages/Blog';
import { SEO } from '../components/SEO';
import { track } from '../lib/analytics';

const indexHtml = readFileSync('index.html', 'utf8');
const ogPng = readFileSync('public/og.png');

describe('metadatos sociales (og:image)', () => {
  it('index.html declara og:image y twitter:image con el dominio del sitio', () => {
    expect(indexHtml).toMatch(/<meta property="og:image" content="https:\/\/[^"]+\/og\.png"/);
    expect(indexHtml).toMatch(/<meta name="twitter:image" content="https:\/\/[^"]+\/og\.png"/);
    expect(indexHtml).toContain('<meta property="og:site_name" content="AutoLupa"');
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary_large_image"');
  });

  it('public/og.png existe y mide 1200x630', () => {
    expect(ogPng.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(ogPng.readUInt32BE(16)).toBe(1200);
    expect(ogPng.readUInt32BE(20)).toBe(630);
    expect(indexHtml).toContain('/og.png');
  });

  it('el componente SEO inyecta og:image y twitter:image en cada página', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <SEO title="Prueba" description="Descripción de prueba" />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(document.querySelector('meta[property="og:image"]')).not.toBeNull());
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/\/og\.png$/);
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toMatch(/\/og\.png$/);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('http');
  });
});

describe('migas de pan visibles', () => {
  it('el blog muestra Inicio / Blog', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <Blog />
        </MemoryRouter>
      </HelmetProvider>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent(/Inicio/);
    expect(nav).toHaveTextContent(/Blog/);
  });
});

describe('eventos de Plausible', () => {
  it('track() no rompe la interfaz si no hay script de analítica', () => {
    delete window.plausible;
    expect(() => track('Prueba')).not.toThrow();
    expect(() => track('Prueba', { clave: 'valor' })).not.toThrow();
  });

  it('track() envía el evento con sus propiedades cuando Plausible está cargado', () => {
    const calls: Array<{ event: string; props?: Record<string, unknown> }> = [];
    window.plausible = (event, options) => calls.push({ event, props: options?.props });
    track('Search', { filtro: 'brand', valor: 'Toyota' });
    expect(calls).toEqual([{ event: 'Search', props: { filtro: 'brand', valor: 'Toyota' } }]);
    delete window.plausible;
  });
});
