import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CarGrid } from '../components/Cars/CarGrid';

const noop = () => {};

describe('grilla de autos', () => {
  it('ofrece volver al catálogo completo cuando no hay resultados', () => {
    render(
      <MemoryRouter>
        <CarGrid
          cars={[]}
          favorites={[]}
          compareList={[]}
          onToggleFavorite={noop}
          onAddToCompare={noop}
          onRemoveFromCompare={noop}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /no se encontraron resultados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver todos los autos/i })).toHaveAttribute('href', '/autos');
  });
});
