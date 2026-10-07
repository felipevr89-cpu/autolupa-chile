import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyUsedListingFilters } from '../data/usedListings';
import { getActiveUsedListings, getSavedUsedListings, getUsedListingBySlug } from '../lib/usedListings';

const state = vi.hoisted(() => ({
  calls: [] as Array<{ table: string; select: string }>,
  columnExists: false,
  listingRows: [] as Array<Record<string, unknown>>,
  profileRows: [] as Array<Record<string, unknown>>,
}));

vi.mock('../lib/supabase', () => {
  const relationshipError = {
    code: 'PGRST200',
    message: "Could not find a relationship between 'used_listings' and 'profiles' in the schema cache",
  };
  const missingColumnError = { code: '42703', message: 'column profiles.email_verified does not exist' };

  function resultFor(table: string, select: string, single: boolean) {
    if (table === 'used_listings') {
      if (/:profiles\(/.test(select)) return { data: null, error: relationshipError, count: null };
      if (single) return { data: state.listingRows[0] ?? null, error: null, count: null };
      return { data: state.listingRows, error: null, count: state.listingRows.length };
    }
    if (table === 'profiles') {
      if (select.includes('email_verified') && !state.columnExists) {
        return { data: null, error: missingColumnError, count: null };
      }
      const columns = select.split(',');
      const rows = state.profileRows.map((row) =>
        Object.fromEntries(columns.filter((column) => column in row).map((column) => [column, row[column]])),
      );
      if (single) return { data: rows[0] ?? null, error: null, count: null };
      return { data: rows, error: null, count: null };
    }
    return { data: [], error: null, count: null };
  }

  interface QueryResult {
    data: unknown;
    error: { code: string; message: string } | null;
    count: number | null;
  }

  interface FakeQuery extends PromiseLike<QueryResult> {
    select(columns: string): FakeQuery;
    eq(...args: unknown[]): FakeQuery;
    lte(...args: unknown[]): FakeQuery;
    gte(...args: unknown[]): FakeQuery;
    ilike(...args: unknown[]): FakeQuery;
    or(...args: unknown[]): FakeQuery;
    in(...args: unknown[]): FakeQuery;
    order(...args: unknown[]): FakeQuery;
    range(...args: unknown[]): FakeQuery;
    maybeSingle(): FakeQuery;
  }

  function from(table: string): FakeQuery {
    let select = '';
    let single = false;
    const result = (): Promise<QueryResult> => Promise.resolve(resultFor(table, select, single));
    const query: FakeQuery = {
      select(columns: string) {
        select = columns;
        state.calls.push({ table, select: columns });
        return query;
      },
      eq: () => query,
      lte: () => query,
      gte: () => query,
      ilike: () => query,
      or: () => query,
      in: () => query,
      order: () => query,
      range: () => query,
      maybeSingle: () => {
        single = true;
        return query;
      },
      then: (onFulfilled, onRejected) => result().then(onFulfilled, onRejected),
    };
    return query;
  }

  return {
    isSupabaseConfigured: true,
    supabase: {
      from,
      storage: {
        from: () => ({
          getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/${path}` } }),
        }),
      },
    },
  };
});

const listingRow: Record<string, unknown> = {
  id: 'listing-1',
  status: 'active',
  slug: 'toyota-corolla-2020-abcd1234',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  price_clp: 8_500_000,
  mileage_km: 65_000,
  fuel: 'hibrido',
  transmission: 'automatica',
  color: 'Blanco',
  region: 'Metropolitana',
  commune: 'Las Condes',
  description: 'Vehículo en excelente estado, con mantenciones al día.',
  contact_name: 'Camila Pérez',
  contact_phone: '+56912345678',
  contact_email: 'camila@example.com',
  photo_paths: ['seller-1/listing-1/foto.jpg'],
  published_at: '2026-10-01T00:00:00.000Z',
  expires_at: null,
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
  seller_id: 'seller-1',
};

const profileRow: Record<string, unknown> = {
  id: 'seller-1',
  display_name: 'Camila Pérez',
  avatar_url: null,
  created_at: '2026-09-30T19:42:17.113786+00:00',
  email_verified: true,
};

beforeEach(() => {
  state.calls = [];
  state.columnExists = false;
  state.listingRows = [listingRow];
  state.profileRows = [profileRow];
});

describe('consulta pública de avisos', () => {
  it('no usa el embed seller:profiles, que PostgREST rechaza porque no existe la FK', async () => {
    const { listings } = await getActiveUsedListings(emptyUsedListingFilters);

    expect(listings).toHaveLength(1);
    expect(listings[0].seller?.display_name).toBe('Camila Pérez');
    expect(listings[0].photoUrls[0]).toContain('https://cdn.test/');
    for (const call of state.calls) {
      expect(call.select).not.toContain(':profiles(');
    }
  });

  it('carga los perfiles de todos los avisos en una sola consulta', async () => {
    const listings = await getSavedUsedListings(['listing-1']);

    expect(listings).toHaveLength(1);
    expect(listings[0].seller?.display_name).toBe('Camila Pérez');
    expect(state.calls.filter((call) => call.table === 'profiles')).toHaveLength(1);
  });
});

describe('badge de correo verificado en el detalle', () => {
  it('mantiene el aviso disponible cuando falta la columna email_verified', async () => {
    state.columnExists = false;

    const listing = await getUsedListingBySlug('toyota-corolla-2020-abcd1234');

    expect(listing?.seller?.display_name).toBe('Camila Pérez');
    expect(listing?.seller?.email_verified).toBeUndefined();

    const profileSelects = state.calls.filter((call) => call.table === 'profiles');
    expect(profileSelects).toHaveLength(2);
    expect(profileSelects[0].select).toContain('email_verified');
    expect(profileSelects[1].select).not.toContain('email_verified');
  });

  it('entrega email_verified en una sola consulta cuando la columna existe', async () => {
    state.columnExists = true;

    const listing = await getUsedListingBySlug('toyota-corolla-2020-abcd1234');

    expect(listing?.seller?.email_verified).toBe(true);
    expect(state.calls.filter((call) => call.table === 'profiles')).toHaveLength(1);
  });
});
