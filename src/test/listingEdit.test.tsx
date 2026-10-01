import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { MisAnuncios } from '../pages/MisAnuncios';
import {
  toListingEditDraft,
  validateListingEdit,
  type ListingEditDraft,
  type UsedListing,
} from '../data/usedListings';
import { getMyUsedListings, updateUsedListing } from '../lib/usedListings';
import type { User } from '../types';

vi.mock('../lib/usedListings', () => ({
  getMyUsedListings: vi.fn(),
  markUsedListingAsSold: vi.fn(),
  updateUsedListing: vi.fn(),
}));

const user: User = { uid: 'uid-1', displayName: 'Ana', email: 'ana@correo.cl', photoURL: null };

function makeListing(overrides: Partial<UsedListing> = {}): UsedListing {
  return {
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
    description: 'Corolla con mantención al día, único dueño y interiores impecables.',
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
    ...overrides,
  };
}

function renderMisAnuncios() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <MisAnuncios user={user} isCloudAuthAvailable onSignIn={vi.fn()} />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getMyUsedListings).mockResolvedValue([makeListing()]);
  vi.mocked(updateUsedListing).mockResolvedValue(undefined);
});

describe('validación de edición de avisos', () => {
  it('acepta un borrador válido y parte desde el aviso publicado', () => {
    const draft = toListingEditDraft(makeListing());
    expect(validateListingEdit(draft)).toEqual({});
    expect(draft.price).toBe(12_000_000);
    expect(draft.contactPhone).toBe('+56912345678');
  });

  it('rechaza precio, kilometraje, descripción, región y contacto fuera de rango', () => {
    const base = toListingEditDraft(makeListing());
    const cases: Array<[ListingEditDraft, string]> = [
      [{ ...base, price: 50_000 }, 'price'],
      [{ ...base, price: 3_000_000_000 }, 'price'],
      [{ ...base, mileage: -1 }, 'mileage'],
      [{ ...base, mileage: 2_500_000 }, 'mileage'],
      [{ ...base, color: 'x'.repeat(41) }, 'color'],
      [{ ...base, region: 'Narnia' }, 'region'],
      [{ ...base, commune: 'x'.repeat(81) }, 'commune'],
      [{ ...base, description: 'muy corta' }, 'description'],
      [{ ...base, contactName: 'A' }, 'contactName'],
      [{ ...base, contactPhone: '123' }, 'contactPhone'],
      [{ ...base, contactEmail: 'no-es-correo' }, 'contactEmail'],
    ];

    for (const [draft, field] of cases) {
      expect(validateListingEdit(draft)).toHaveProperty(field);
    }
  });

  it('permite dejar el correo vacío', () => {
    const base = toListingEditDraft(makeListing());
    expect(validateListingEdit({ ...base, contactEmail: '' })).toEqual({});
  });
});

describe('edición desde mis avisos', () => {
  it('abre el formulario, guarda el precio y avisa que vuelve a revisión', async () => {
    renderMisAnuncios();

    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }));

    const price = screen.getByRole('spinbutton', { name: /precio \(clp\)/i });
    fireEvent.change(price, { target: { value: '11500000' } });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(updateUsedListing).toHaveBeenCalledTimes(1));
    expect(updateUsedListing).toHaveBeenCalledWith('listing-1', expect.objectContaining({ price: 11_500_000 }));
    expect(await screen.findByRole('status')).toHaveTextContent(/revisión/i);
    expect(screen.queryByRole('form', { name: /editar toyota/i })).not.toBeInTheDocument();
  });

  it('muestra el error de validación sin tocar la base de datos', async () => {
    renderMisAnuncios();

    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }));

    const price = screen.getByRole('spinbutton', { name: /precio \(clp\)/i });
    fireEvent.change(price, { target: { value: '50000' } });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Ingresa un precio válido.')).toBeInTheDocument();
    expect(updateUsedListing).not.toHaveBeenCalled();
    expect(screen.getByRole('form', { name: /editar toyota/i })).toBeInTheDocument();
  });

  it('permite cerrar el formulario sin guardar', async () => {
    renderMisAnuncios();

    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('form', { name: /editar toyota/i })).not.toBeInTheDocument();
    expect(updateUsedListing).not.toHaveBeenCalled();
  });

  it('no ofrece editar un aviso vendido', async () => {
    vi.mocked(getMyUsedListings).mockResolvedValue([makeListing({ status: 'sold' })]);

    renderMisAnuncios();

    expect(await screen.findByText(/vendido/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });
});
