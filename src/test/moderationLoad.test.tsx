import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { ModeracionUsados } from '../pages/ModeracionUsados';
import { isCurrentUserModerator, getModerationQueue, getOpenListingReports } from '../lib/usedListings';
import { getOpenSuggestions } from '../lib/suggestions';
import type { UsedListing } from '../data/usedListings';
import type { User } from '../types';

vi.mock('../lib/usedListings', () => ({
  isCurrentUserModerator: vi.fn(),
  getModerationQueue: vi.fn(),
  getOpenListingReports: vi.fn(),
  moderateUsedListing: vi.fn(),
  resolveListingReport: vi.fn(),
}));

vi.mock('../lib/suggestions', () => ({
  getOpenSuggestions: vi.fn(),
  answerSuggestion: vi.fn(),
}));

const user: User = { uid: 'uid-mod', displayName: 'Moderación', email: 'mod@autolupa.cl', photoURL: null };

function renderModeracion() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <ModeracionUsados user={user} isCloudAuthAvailable onSignIn={vi.fn()} />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isCurrentUserModerator).mockResolvedValue(true);
  vi.mocked(getOpenListingReports).mockResolvedValue([]);
  vi.mocked(getOpenSuggestions).mockResolvedValue([]);
  vi.mocked(getModerationQueue).mockResolvedValue([] as UsedListing[]);
});

describe('panel de moderación', () => {
  it('muestra skeleton mientras carga la cola, no un estado vacío falso', async () => {
    let resolveQueue: (value: UsedListing[]) => void = () => undefined;
    vi.mocked(getModerationQueue).mockReturnValue(new Promise<UsedListing[]>((resolve) => { resolveQueue = resolve; }));

    renderModeracion();

    expect(await screen.findAllByLabelText('Cargando')).toHaveLength(3);
    expect(screen.queryByText('No hay avisos pendientes.')).toBeNull();

    resolveQueue([]);

    expect(await screen.findByText('No hay avisos pendientes.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Cargando')).toBeNull();
  });

  it('oculta el skeleton y muestra la cola cuando responde', async () => {
    const listing = {
      id: 'listing-1',
      sellerId: 'uid-1',
      status: 'pending',
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
      publishedAt: null,
      expiresAt: null,
      featuredUntil: null,
      moderationNote: null,
      seller: null,
    } as unknown as UsedListing;
    vi.mocked(getModerationQueue).mockResolvedValue([listing]);

    renderModeracion();

    expect(await screen.findByText('Toyota Corolla 2019')).toBeInTheDocument();
    expect(screen.getByText('1 pendientes')).toBeInTheDocument();
    expect(screen.queryByLabelText('Cargando')).toBeNull();
  });
});
