import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Home } from '../pages/Home';
import type { Filters } from '../types';

const noop = () => {};
const setSearchQuery = vi.fn();

const filters: Filters = {
  brand: [],
  type: [],
  fuel: [],
  seats: [],
  priceRange: [0, 100000000],
  transmission: [],
  traction: [],
  minAirbags: 0,
  origin_country: [],
  model: [],
  yearRange: [2020, 2026],
};

function LocationProbe() {
  const location = useLocation();
  return <p>ruta={location.pathname}{location.search}</p>;
}

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                cars={[]}
                allCarsCount={626}
                totalPages={1}
                currentPage={1}
                setCurrentPage={noop}
                filters={filters}
                updateFilter={noop}
                resetFilters={noop}
                searchQuery=""
                setSearchQuery={setSearchQuery}
                sortBy="brand"
                setSortBy={noop}
                favorites={[]}
                compareList={[]}
                onToggleFavorite={noop}
                onAddToCompare={noop}
                onRemoveFromCompare={noop}
              />
            }
          />
          <Route path="/usados" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('buscador dual de la portada', () => {
  it('alterna entre catálogo de nuevos y avisos usados', () => {
    renderHome();
    const usedTab = screen.getByRole('tab', { name: /autos usados/i });
    expect(usedTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(usedTab);
    expect(usedTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /autos nuevos/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByLabelText(/buscar autos usados/i)).toBeInTheDocument();
  });

  it('envía la búsqueda de usados a /usados con la query', () => {
    renderHome();
    fireEvent.click(screen.getByRole('tab', { name: /autos usados/i }));
    fireEvent.change(screen.getByLabelText(/buscar autos usados/i), { target: { value: 'Corolla 2019' } });
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    expect(screen.getByText('ruta=/usados?q=Corolla%202019')).toBeInTheDocument();
  });

  it('escribe en el catálogo cuando la pestaña activa es de nuevos', () => {
    renderHome();
    const input = screen.getByLabelText(/buscar autos nuevos/i);
    fireEvent.change(input, { target: { value: 'SUV' } });
    expect(setSearchQuery).toHaveBeenCalledWith('SUV');
    expect(screen.getByText(/fichas de catálogo/i)).toBeInTheDocument();
  });
});
