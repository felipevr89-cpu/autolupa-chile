import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Blog } from '../pages/Blog';
import { BlogArticle } from '../pages/BlogArticle';
import { articles, getArticleBySlug } from '../data/articles';

function renderBlogArticle(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticle />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('guías del blog', () => {
  it('publica al menos las dos guías de compra nuevas', () => {
    expect(articles.length).toBeGreaterThanOrEqual(2);
    expect(getArticleBySlug('transferencia-vehiculo-chile')).toBeDefined();
    expect(getArticleBySlug('revision-auto-usado-checklist')).toBeDefined();
    expect(getArticleBySlug('no-existe')).toBeUndefined();
    expect(getArticleBySlug(undefined)).toBeUndefined();
  });

  it('cada guía publicada tiene título, fecha y secciones con contenido', () => {
    for (const article of articles) {
      expect(article.title.length).toBeGreaterThan(20);
      expect(article.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.sections.length).toBeGreaterThanOrEqual(4);
      for (const section of article.sections) {
        expect(section.heading.length).toBeGreaterThan(5);
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });

  it('la guía de transferencia cubre CAV, documentos, Registro Civil y fraudes', () => {
    const guide = getArticleBySlug('transferencia-vehiculo-chile');
    const headings = guide!.sections.map((section) => section.heading).join(' | ');
    expect(headings).toMatch(/Anotaciones Vigentes/i);
    expect(headings).toMatch(/Documentos/i);
    expect(headings).toMatch(/Registro Civil/i);
    expect(headings).toMatch(/fraudes/i);
    expect(JSON.stringify(guide)).toContain('$1.560');
  });

  it('la checklist de usados cubre papeles, carrocería, motor y prueba de conducción', () => {
    const guide = getArticleBySlug('revision-auto-usado-checklist');
    const headings = guide!.sections.map((section) => section.heading).join(' | ');
    expect(headings).toMatch(/Papeles/i);
    expect(headings).toMatch(/Carrocería/i);
    expect(headings).toMatch(/Motor/i);
    expect(headings).toMatch(/Prueba de conducción/i);
  });

  it('renderiza una guía con su ruta, secciones y enlaces de cierre', () => {
    renderBlogArticle('transferencia-vehiculo-chile');
    expect(screen.getByRole('heading', { level: 1, name: /transferencia de vehículo en chile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Certificado de Anotaciones Vigentes/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole('navigation', { name: /ruta de navegación/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /buscar autos usados/i })).toHaveAttribute('href', '/usados');
    expect(screen.getByRole('link', { name: /ver todas las guías/i })).toHaveAttribute('href', '/blog');
  });

  it('responde con estado no encontrado ante un slug desconocido', () => {
    renderBlogArticle('guia-inventada');
    expect(screen.getByRole('heading', { name: /esta guía no existe/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al blog/i })).toHaveAttribute('href', '/blog');
  });
});

describe('listado del blog', () => {
  it('enlaza todas las guías publicadas y ya no queda ninguna en preparación', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Blog />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByRole('link', { name: /transferencia de vehículo en chile/i })).toHaveAttribute(
      'href',
      '/blog/transferencia-vehiculo-chile',
    );
    expect(screen.getByRole('link', { name: /revisión de auto usado antes de comprar/i })).toHaveAttribute(
      'href',
      '/blog/revision-auto-usado-checklist',
    );
    expect(screen.queryByText(/en preparación/i)).not.toBeInTheDocument();
    const links = screen.getAllByRole('link');
    for (const article of articles) {
      expect(links.some((link) => link.getAttribute('href') === `/blog/${article.slug}`)).toBe(true);
    }
  });

  it('publica las nueve guías que estaban en preparación', () => {
    const pending = [
      'guia-comparar-autos-chile',
      'mejores-autos-familia-2026',
      'autos-electricos-chile-2026',
      'tcu-costo-vehiculo-propiedad',
      'seguros-auto-chile-comparar',
      'autos-chinos-chile-opinion',
      'hibridos-vs-electricos',
      'permiso-circulacion-2026',
      'autos-seguros-chile-latin-ncap',
    ];
    expect(articles.length).toBeGreaterThanOrEqual(11);
    for (const slug of pending) {
      expect(getArticleBySlug(slug)).toBeDefined();
    }
  });
});

describe('autoría y fuentes de las guías (E-E-A-T)', () => {
  it('cada guía declara revisión, fecha ISO y al menos dos fuentes oficiales', () => {
    for (const article of articles) {
      expect(article.reviewed.length).toBeGreaterThan(3);
      expect(article.isoReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.isoReviewed >= article.isoDate).toBe(true);
      expect(article.sources.length).toBeGreaterThanOrEqual(2);
      for (const source of article.sources) {
        expect(source.label.length).toBeGreaterThan(3);
        expect(source.url).toMatch(/^https:\/\//);
      }
    }
  });

  it('muestra autor, fechas y fuentes en la página de la guía', () => {
    const article = getArticleBySlug('permiso-circulacion-2026')!;
    renderBlogArticle('permiso-circulacion-2026');

    expect(screen.getByText(/equipo editorial de autolupa/i)).toBeInTheDocument();
    expect(screen.getByText(/actualizado el/i)).toHaveTextContent(article.reviewed);
    expect(screen.getByRole('heading', { name: 'Fuentes oficiales' })).toBeInTheDocument();

    for (const source of article.sources) {
      const link = document.querySelector(`a[href="${source.url}"]`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('rel')).toContain('noopener');
      expect(link!.getAttribute('target')).toBe('_blank');
      expect(document.body.textContent).toContain(source.label);
    }
  });

  it('el JSON-LD separa la fecha de publicación de la de revisión', async () => {
    const article = getArticleBySlug('autos-electricos-chile-2026')!;
    renderBlogArticle('autos-electricos-chile-2026');

    await waitFor(() => expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull());
    const script = document.querySelector('script[type="application/ld+json"]');
    const payload = JSON.parse(script!.textContent ?? '{}') as { '@graph': Array<Record<string, unknown>> };
    const entry = payload['@graph'].find((node) => node['@type'] === 'Article');
    expect(entry).toBeDefined();
    expect(entry!.datePublished).toBe(article.isoDate);
    expect(entry!.dateModified).toBe(article.isoReviewed);
    expect((entry!.author as Record<string, unknown>).name).toBe('Equipo editorial de AutoLupa');
  });
});
