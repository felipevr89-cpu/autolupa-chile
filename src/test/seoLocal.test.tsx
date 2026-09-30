import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UsadosRegion } from '../pages/UsadosRegion';
import {
  CHILE_REGIONS,
  getRegionBySlug,
  getRegionByName,
  getRegionDescription,
  regionPath,
} from '../data/chileRegions';
import { USED_REGIONS } from '../data/usedListings';

function renderRegion(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/autos-usados-en/:regionSlug" element={<UsadosRegion />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('landing pages por región', () => {
  it('cubre las 16 regiones con slugs únicos', () => {
    expect(CHILE_REGIONS).toHaveLength(16);
    expect(new Set(CHILE_REGIONS.map((region) => region.slug)).size).toBe(16);
    expect(new Set(CHILE_REGIONS.map((region) => region.name)).size).toBe(16);
    expect(CHILE_REGIONS.map((region) => region.name).sort()).toEqual([...USED_REGIONS].sort());
  });

  it('usa cifras oficiales de comunas (346 en total)', () => {
    const total = CHILE_REGIONS.reduce((sum, region) => sum + region.communes, 0);
    expect(total).toBe(346);
    for (const region of CHILE_REGIONS) {
      expect(region.capital.length).toBeGreaterThan(2);
      expect(region.cities.length).toBeGreaterThan(0);
      expect(regionPath(region)).toBe(`/autos-usados-en/${region.slug}`);
    }
  });

  it('resuelve regiones por slug y por nombre', () => {
    expect(getRegionBySlug('metropolitana')?.name).toBe('Metropolitana');
    expect(getRegionBySlug('ohiggins')?.name).toBe("O'Higgins");
    expect(getRegionBySlug('no-existe')).toBeUndefined();
    expect(getRegionBySlug(undefined)).toBeUndefined();
    expect(getRegionByName('Aysén')?.slug).toBe('aysen');
    expect(getRegionByName('Desconocida')).toBeUndefined();
  });

  it('describe la región con capital y cantidad de avisos', () => {
    const region = getRegionBySlug('valparaiso');
    expect(region).toBeDefined();
    const withListings = getRegionDescription(region!, 12);
    const withoutListings = getRegionDescription(region!, 0);
    expect(withListings).toContain('Valparaíso');
    expect(withListings).toContain('12 avisos');
    expect(withoutListings).toContain('Publica tu auto gratis');
    expect(withoutListings).toContain('38 comunas');
  });

  it('renderiza la página de la región con navegación entre regiones', () => {
    renderRegion('/autos-usados-en/metropolitana');
    expect(screen.getByRole('heading', { name: /autos usados en metropolitana/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Región Metropolitana de Santiago/).length).toBeGreaterThan(0);
    expect(screen.getByText(/preparación/i)).toBeInTheDocument();
    expect(document.querySelectorAll('a[href^="/autos-usados-en/"]').length).toBe(16);
  });

  it('oculta del índice una región inexistente', () => {
    renderRegion('/autos-usados-en/inventada');
    expect(screen.getByRole('heading', { name: /no encontramos esa región/i })).toBeInTheDocument();
    expect(screen.getByText(/elige una de las 16 regiones/i)).toBeInTheDocument();
    expect(document.querySelectorAll('a[href^="/autos-usados-en/"]').length).toBe(16);
  });
});
