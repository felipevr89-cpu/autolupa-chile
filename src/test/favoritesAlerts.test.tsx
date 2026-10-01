import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { Favorites } from '../pages/Favorites';
import { carsData, formatPrice } from '../data/brands';
import type { Car } from '../types';
import type { UsedListing } from '../data/usedListings';
import { acknowledgePriceAlert, readPriceWatch, syncPriceWatch } from '../lib/priceWatch';
import {
  getSavedListings,
  isListingSaved,
  resetSavedListings,
  toggleSavedListing,
  updateSavedPrice,
} from '../lib/savedListings';
import { getSavedUsedListings } from '../lib/usedListings';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: null,
}));

vi.mock('../lib/usedListings', () => ({
  getSavedUsedListings: vi.fn(),
}));

const mockedFetch = vi.mocked(getSavedUsedListings);

function makeCar(overrides: Partial<Car> = {}): Car {
  return { ...carsData[0], ...overrides };
}

function renderFavorites(cars: Car[], favorites: number[]) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Favorites
          allCars={cars}
          favorites={favorites}
          compareList={[]}
          onToggleFavorite={vi.fn()}
          onAddToCompare={vi.fn()}
          onRemoveFromCompare={vi.fn()}
        />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  resetSavedListings();
  vi.clearAllMocks();
});

describe('seguimiento de precios de favoritos', () => {
  it('registra el precio de referencia en la primera visita', () => {
    const car = makeCar({ price: 20_000_000 });
    expect(syncPriceWatch([car])).toEqual([]);
    expect(readPriceWatch()[car.id]).toEqual({ price: 20_000_000, alert: false });
  });

  it('alerta cuando el precio baja y se limpia al reconocer la alerta', () => {
    const car = makeCar({ price: 20_000_000 });
    syncPriceWatch([car]);

    const cheaper = { ...car, price: 18_500_000 };
    const alerts = syncPriceWatch([cheaper]);
    expect(alerts).toEqual([{ carId: car.id, previous: 20_000_000, current: 18_500_000 }]);

    const persisted = syncPriceWatch([cheaper]);
    expect(persisted).toHaveLength(1);

    acknowledgePriceAlert(car.id, 18_500_000);
    expect(syncPriceWatch([cheaper])).toEqual([]);
  });

  it('sube la referencia cuando el precio vuelve a subir', () => {
    const car = makeCar({ price: 20_000_000 });
    syncPriceWatch([car]);
    syncPriceWatch([{ ...car, price: 18_000_000 }]);

    const raised = { ...car, price: 21_000_000 };
    expect(syncPriceWatch([raised])).toEqual([]);
    expect(readPriceWatch()[car.id]).toEqual({ price: 21_000_000, alert: false });
  });

  it('deja de seguir los autos que ya no son favoritos', () => {
    const car = makeCar({ price: 20_000_000 });
    syncPriceWatch([car]);
    expect(Object.keys(readPriceWatch())).toHaveLength(1);

    syncPriceWatch([]);
    expect(readPriceWatch()).toEqual({});
  });
});

describe('avisos guardados', () => {
  it('alterna el guardado y lo persiste en localStorage', () => {
    const listing = {
      id: 'listing-1',
      slug: 'toyota-corolla-2019-x1',
      title: 'Toyota Corolla 2019',
      price: 12_000_000,
      savedAt: '',
    };

    expect(toggleSavedListing(listing)).toBe(true);
    expect(isListingSaved('listing-1')).toBe(true);
    expect(getSavedListings()['listing-1'].slug).toBe('toyota-corolla-2019-x1');
    expect(getSavedListings()['listing-1'].savedAt).not.toBe('');

    updateSavedPrice('listing-1', 11_000_000);
    expect(getSavedListings()['listing-1'].price).toBe(11_000_000);

    expect(toggleSavedListing(listing)).toBe(false);
    expect(isListingSaved('listing-1')).toBe(false);
  });
});

describe('página de favoritos con alertas', () => {
  it('muestra la baja de precio de un favorito y la descarta', async () => {
    const car = makeCar({ price: 17_990_000 });
    localStorage.setItem(
      'autolupa_price_watch',
      JSON.stringify({ [car.id]: { price: 18_990_000, alert: false } }),
    );

    renderFavorites([car], [car.id]);

    expect(await screen.findByText(/Bajas de precio en tus favoritos/i)).toBeInTheDocument();
    const panel = screen.getByRole('region', { name: 'Bajas de precio' });
    expect(within(panel).getByText(`${car.brand} ${car.model} ${car.year}`)).toBeInTheDocument();
    expect(within(panel).getByText(formatPrice(18_990_000))).toBeInTheDocument();
    expect(within(panel).getByText(formatPrice(17_990_000))).toBeInTheDocument();

    await userEvent.click(within(panel).getByRole('button', { name: 'Entendido' }));

    expect(screen.queryByText(/Bajas de precio en tus favoritos/i)).not.toBeInTheDocument();
    expect(readPriceWatch()[car.id]).toEqual({ price: 17_990_000, alert: false });
  });

  it('avisa cuando un aviso guardado bajó de precio', async () => {
    const savedAt = new Date().toISOString();
    toggleSavedListing({
      id: 'listing-1',
      slug: 'toyota-corolla-2019-x1',
      title: 'Toyota Corolla 2019',
      price: 12_000_000,
      savedAt,
    });
    mockedFetch.mockResolvedValue([
      { id: 'listing-1', slug: 'toyota-corolla-2019-x1', price: 11_000_000 },
    ] as UsedListing[]);

    renderFavorites([], []);

    expect(await screen.findByText(/Avisos guardados/i)).toBeInTheDocument();
    expect(await screen.findByText(/Bajó de precio/i)).toBeInTheDocument();
    expect(screen.getByText(formatPrice(11_000_000))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver aviso/i })).toHaveAttribute(
      'href',
      '/usados/toyota-corolla-2019-x1',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    await waitFor(() => expect(getSavedListings()['listing-1'].price).toBe(11_000_000));
  });

  it('marca el aviso guardado que ya no está publicado', async () => {
    toggleSavedListing({
      id: 'listing-2',
      slug: 'kia-sportage-2018-y2',
      title: 'Kia Sportage 2018',
      price: 9_500_000,
      savedAt: new Date().toISOString(),
    });
    mockedFetch.mockResolvedValue([]);

    renderFavorites([], []);

    expect(await screen.findByText(/ya no está publicado/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ver aviso/i })).not.toBeInTheDocument();
  });

  it('no consulta la base sin avisos guardados', () => {
    renderFavorites([], []);
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(screen.queryByText(/Avisos guardados/i)).not.toBeInTheDocument();
  });
});
