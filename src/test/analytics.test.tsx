import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CarDetail } from '../components/Cars/CarDetail';
import { SavedSearches } from '../components/Used/SavedSearches';
import { UsedListingDetail } from '../pages/UsedListingDetail';
import { carsData } from '../data/brands';
import { reportUsedListing, getUsedListingBySlug } from '../lib/usedListings';
import type { UsedListing } from '../data/usedListings';
import type { User } from '../types';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {},
}));

vi.mock('../lib/usedListings', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/usedListings')>()),
  getUsedListingBySlug: vi.fn(),
  reportUsedListing: vi.fn(),
  countActiveUsedListings: vi.fn().mockResolvedValue(0),
}));

const user: User = { uid: 'uid-1', displayName: 'Ana', email: 'ana@correo.cl', photoURL: null };
const noop = () => Promise.resolve();

const listing = {
  id: 'listing-1',
  sellerId: 'uid-1',
  status: 'active',
  slug: 'toyota-corolla-2019-x1',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2019,
  price: 12_000_000,
  mileage: 80_000,
  fuel: 'gasolina',
  transmission: 'automatica',
  color: 'Blanco',
  region: 'Metropolitana',
  commune: 'Santiago',
  description: 'Corolla con mantención al día, único dueño.',
  contactName: 'Ana Pérez',
  contactPhone: '+56912345678',
  contactEmail: 'ana@correo.cl',
  photoUrls: [],
  createdAt: '2026-09-20T10:00:00.000Z',
  updatedAt: '2026-09-20T10:00:00.000Z',
  publishedAt: '2026-09-20T10:00:00.000Z',
  expiresAt: null,
  featuredUntil: null,
  moderationNote: null,
  seller: null,
} as unknown as UsedListing;

function renderWithRouter(ui: React.ReactElement, path: string, entry: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.plausible = vi.fn();
  vi.mocked(getUsedListingBySlug).mockResolvedValue(listing);
  vi.mocked(reportUsedListing).mockResolvedValue(undefined as never);
});

afterEach(() => {
  delete window.plausible;
});

describe('eventos del embudo en la interfaz', () => {
  it('la ficha del auto registra el contacto por WhatsApp con la marca', () => {
    const car = carsData[0];
    render(
      <HelmetProvider>
        <MemoryRouter>
          <CarDetail car={car} onClose={vi.fn()} isFavorite={false} onToggleFavorite={vi.fn()} />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('link', { name: /compartir por whatsapp/i }));

    expect(window.plausible).toHaveBeenCalledWith('ContactSeller', { props: { origen: 'auto', marca: car.brand } });
    expect(screen.getByRole('button', { name: /compartir este auto/i })).toBeInTheDocument();
  });

  it('la ficha del aviso registra el contacto y el reporte enviado', async () => {
    renderWithRouter(
      <UsedListingDetail user={user} isCloudAuthAvailable onSignIn={noop} />,
      '/usados/:slug',
      '/usados/toyota-corolla-2019-x1',
    );

    await screen.findByRole('heading', { level: 1, name: 'Corolla' });

    fireEvent.click(screen.getByRole('link', { name: /contactar por whatsapp/i }));
    expect(window.plausible).toHaveBeenCalledWith('ContactSeller', { props: { origen: 'aviso', region: 'Metropolitana' } });

    fireEvent.change(screen.getByPlaceholderText('Cuéntanos qué problema detectaste'), {
      target: { value: 'Precio muy por debajo del mercado.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar reporte/i }));

    expect(await screen.findByText(/recibimos tu reporte/i)).toBeInTheDocument();
    expect(window.plausible).toHaveBeenCalledWith('Report', { props: { region: 'Metropolitana' } });
    expect(screen.getByRole('button', { name: /compartir aviso/i })).toBeInTheDocument();
  });

  it('guardar y quitar una búsqueda guardada queda medido', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <SavedSearches onApply={vi.fn()} filters={{ search: '', brand: 'Toyota' }} currentTotal={3} />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(window.plausible).toHaveBeenCalledWith('SavedSearch', { props: { accion: 'guardar' } });

    fireEvent.click(screen.getByRole('button', { name: /eliminar búsqueda/i }));
    expect(window.plausible).toHaveBeenCalledWith('SavedSearch', { props: { accion: 'quitar' } });
  });
});
