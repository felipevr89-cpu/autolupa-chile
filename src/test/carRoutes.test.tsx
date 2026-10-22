import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CarPage } from '../pages/CarPage';
import { BrandPage } from '../pages/BrandPage';
import { carsData } from '../data/brands';
import { carIdFromSlug, carPath, carSlug } from '../lib/carSlug';

const car = carsData.find(c => c.brand === 'Toyota' && c.model === 'Corolla') ?? carsData[0];
const noop = () => {};

function renderCarPage(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/auto/:carSlug"
            element={<CarPage favorites={[]} onToggleFavorite={noop} onAddRecent={vi.fn()} />}
          />
          <Route path="/marca/:brandSlug" element={<BrandPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('rutas de auto', () => {
  it('genera una URL estable con id y slug ASCII', () => {
    expect(carPath({ id: 7, brand: 'Citroën', model: 'C3 Aircross', year: 2026 }))
      .toBe('/auto/7-citroen-c3-aircross-2026');
    expect(carIdFromSlug(carSlug(car))).toBe(car.id);
    expect(carIdFromSlug('sin-id')).toBeNull();
  });

  it('renderiza la ficha como página con un solo h1', () => {
    renderCarPage(carPath(car));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(car.model);
    expect(screen.getByText(/Volver al catálogo/i)).toBeInTheDocument();
  });

  it('redirige un slug incompleto a la URL canónica', () => {
    renderCarPage(`/auto/${car.id}`);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(car.model);
  });

  it('muestra un estado claro cuando el auto no existe', () => {
    renderCarPage('/auto/999999');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Auto no encontrado/i);
  });

  it('la página de marca enlaza a la ficha del auto', () => {
    renderCarPage('/marca/toyota');
    const firstToyota = carsData.find(c => c.brand === 'Toyota' && c.model === car.model) ?? car;
    const links = screen.getAllByRole('link').map(a => a.getAttribute('href'));
    expect(links).toContain(carPath(firstToyota));
  });
});
