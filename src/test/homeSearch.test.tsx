import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Home } from '../pages/Home';
import type { Filters } from '../types';
import { defaultYearRange } from '../hooks/useCars';

const noop = () => {};
const setSearchQuery = vi.fn();

const filters: Filters = {
  brand: [],
  type: [],
  fuel: [],
  seats: [],
  priceRange: [0, 500000000],
  transmission: [],
  traction: [],
  minAirbags: 0,
  origin_country: [],
  model: [],
  yearRange: defaultYearRange,
};

function LocationProbe() {
  const location = useLocation();
  return <p>ruta={location.pathname}{location.search}</p>;
}

function HomeMock() {
  return (
    <Home
      cars={[]}
      allCarsCount={625}
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
  );
}

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeMock />} />
          <Route path="/usados" element={<LocationProbe />} />
          <Route path="/autos" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function renderHomeAtAutos() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/autos']}>
        <Routes>
          <Route path="/autos" element={<HomeMock />} />
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
    expect(screen.getByText('ruta=/usados?q=Corolla+2019')).toBeInTheDocument();
  });

  it('muestra Región solo en la pestaña de usados', () => {
    renderHome();
    expect(screen.queryByLabelText(/región/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /autos usados/i }));
    expect(screen.getByLabelText(/región/i)).toBeInTheDocument();
  });

  it('envía Región al buscar usados', () => {
    renderHome();
    fireEvent.click(screen.getByRole('tab', { name: /autos usados/i }));
    fireEvent.change(screen.getByLabelText(/buscar autos usados/i), { target: { value: 'Corolla' } });
    fireEvent.change(screen.getByLabelText(/región/i), { target: { value: 'Coquimbo' } });
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    expect(screen.getByText('ruta=/usados?q=Corolla&region=Coquimbo')).toBeInTheDocument();
  });

  it('no envía Región al buscar autos nuevos', () => {
    renderHome();
    fireEvent.click(screen.getByRole('tab', { name: /autos usados/i }));
    fireEvent.change(screen.getByLabelText(/región/i), { target: { value: 'Coquimbo' } });
    fireEvent.click(screen.getByRole('tab', { name: /autos nuevos/i }));
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    expect(screen.getByText('ruta=/autos')).toBeInTheDocument();
  });

  it('muestra 6 destacados antes de abrir el catálogo completo', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /autos destacados/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver catálogo completo \(625 vehículos\)/i })).toBeInTheDocument();
    expect(screen.queryByText(/mostrando 1-15 de 625 vehículos/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ver catálogo completo/i }));

    expect(screen.getByRole('heading', { name: /explorar todo el catálogo/i })).toBeInTheDocument();
    expect(screen.getByText(/mostrando 1-15 de 625 vehículos/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver catálogo completo/i })).not.toBeInTheDocument();
  });

  it('escribe en el catálogo cuando la pestaña activa es de nuevos', () => {
    renderHome();
    const input = screen.getByLabelText(/buscar autos nuevos/i);
    fireEvent.change(input, { target: { value: 'SUV' } });
    expect(setSearchQuery).toHaveBeenCalledWith('SUV');
    expect(screen.getByText(/fichas de catálogo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    expect(screen.getByText('ruta=/autos')).toBeInTheDocument();
  });

  it('en /autos abre el catálogo completo', () => {
    renderHomeAtAutos();
    expect(screen.getByRole('heading', { name: /catálogo de autos nuevos/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/buscar autos nuevos/i)).toBeInTheDocument();
  });
});
