import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PublishFloat } from '../components/Layout/PublishFloat';

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:page" element={<PublishFloat />} />
          <Route path="/" element={<PublishFloat />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('botón flotante de publicación en móvil', () => {
  it('aparece en las páginas públicas', () => {
    renderAt('/usados');
    expect(screen.getByRole('link', { name: /publicar gratis/i })).toHaveAttribute('href', '/publicar-auto');
  });

  it('se oculta dentro del formulario y de páginas privadas', () => {
    renderAt('/publicar-auto');
    expect(screen.queryByRole('link', { name: /publicar gratis/i })).not.toBeInTheDocument();
  });

  it('se oculta en la gestión de anuncios', () => {
    renderAt('/mis-anuncios');
    expect(screen.queryByRole('link', { name: /publicar gratis/i })).not.toBeInTheDocument();
  });
});
