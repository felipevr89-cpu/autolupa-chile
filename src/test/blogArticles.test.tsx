import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  it('enlaza las guías publicadas y marca las futuras como en preparación', () => {
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
    expect(screen.getAllByText(/en preparación/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('link', { name: /los 10 mejores autos familiares/i })).not.toBeInTheDocument();
  });
});
