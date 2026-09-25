import { supabase } from './supabase';
import {
  buildUsedListingSlug,
  normalizeUsedListingPhone,
  USED_LISTING_TERMS_VERSION,
  type UsedListing,
  type UsedListingDraft,
  type UsedListingFilters,
  type UsedListingFuel,
  type UsedListingPage,
  type UsedListingSeller,
  type UsedListingStatus,
  type UsedListingTransmission,
  validateUsedListingDraft,
} from '../data/usedListings';

interface UsedListingRow {
  id: string;
  seller_id?: string;
  status: UsedListingStatus;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price_clp: number;
  mileage_km: number;
  fuel: UsedListingFuel;
  transmission: UsedListingTransmission;
  color: string | null;
  region: string;
  commune: string | null;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string | null;
  photo_paths: string[];
  moderation_note?: string | null;
  featured_until?: string | null;
  terms_accepted_version?: string;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  seller: UsedListingSeller | UsedListingSeller[] | null;
}

const sellerRelation = 'seller:profiles(display_name,avatar_url,created_at)';

export const internalUsedListingColumns = [
  'seller_id',
  'moderation_note',
  'featured_until',
  'terms_accepted_version',
] as const;

const publicColumns = [
  'id',
  'status',
  'slug',
  'brand',
  'model',
  'year',
  'price_clp',
  'mileage_km',
  'fuel',
  'transmission',
  'color',
  'region',
  'commune',
  'description',
  'contact_name',
  'contact_phone',
  'contact_email',
  'photo_paths',
  'published_at',
  'expires_at',
  'created_at',
  'updated_at',
].join(',');

export const usedListingPublicColumns = publicColumns;

const privateColumns = [
  'seller_id',
  'moderation_note',
  'featured_until',
  'terms_accepted_version',
].join(',');

interface UsedListingReportRow {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  listing: Pick<UsedListingRow, 'id' | 'brand' | 'model' | 'year' | 'slug'> | Pick<UsedListingRow, 'id' | 'brand' | 'model' | 'year' | 'slug'>[] | null;
}

export class MarketplaceUnavailableError extends Error {
  constructor() {
    super('El mercado de usados aún no está disponible.');
    this.name = 'MarketplaceUnavailableError';
  }
}

function client() {
  if (!supabase) throw new MarketplaceUnavailableError();
  return supabase;
}

function getPublicPhotoUrl(path: string): string {
  return client().storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
}

function mapSeller(seller: UsedListingRow['seller']): UsedListingSeller | null {
  if (Array.isArray(seller)) return seller[0] ?? null;
  return seller ?? null;
}

function mapListing(row: UsedListingRow): UsedListing {
  return {
    id: row.id,
    sellerId: row.seller_id ?? '',
    status: row.status,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    year: row.year,
    price: Number(row.price_clp),
    mileage: row.mileage_km,
    fuel: row.fuel,
    transmission: row.transmission,
    color: row.color ?? '',
    region: row.region,
    commune: row.commune ?? '',
    description: row.description,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email ?? '',
    photoUrls: (row.photo_paths ?? []).map(getPublicPhotoUrl),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
    expiresAt: row.expires_at ?? null,
    featuredUntil: row.featured_until ?? null,
    moderationNote: row.moderation_note ?? null,
    seller: mapSeller(row.seller),
  };
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toSafeSearch(value: string): string {
  return value.trim().replace(/[%_,]/g, ' ').slice(0, 80);
}

interface UsedListingQuery {
  or(condition: string): this;
  ilike(column: string, value: string): this;
  eq(column: string, value: string): this;
  gte(column: string, value: number): this;
  lte(column: string, value: number): this;
}

function applyUsedListingFilters<T extends UsedListingQuery>(query: T, filters: UsedListingFilters): T {
  const safeSearch = toSafeSearch(filters.search);
  const minYear = toOptionalNumber(filters.minYear);
  const maxYear = toOptionalNumber(filters.maxYear);
  const minPrice = toOptionalNumber(filters.minPrice);
  const maxPrice = toOptionalNumber(filters.maxPrice);
  const maxMileage = toOptionalNumber(filters.maxMileage);

  if (safeSearch) query = query.or(`brand.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%`);
  if (filters.brand) query = query.ilike('brand', filters.brand);
  if (filters.region) query = query.eq('region', filters.region);
  if (filters.fuel) query = query.eq('fuel', filters.fuel);
  if (filters.transmission) query = query.eq('transmission', filters.transmission);
  if (minYear !== undefined) query = query.gte('year', minYear);
  if (maxYear !== undefined) query = query.lte('year', maxYear);
  if (minPrice !== undefined) query = query.gte('price_clp', minPrice);
  if (maxPrice !== undefined) query = query.lte('price_clp', maxPrice);
  if (maxMileage !== undefined) query = query.lte('mileage_km', maxMileage);

  return query;
}

export async function getActiveUsedListings(
  filters: UsedListingFilters,
  page = 1,
  pageSize = 12,
): Promise<UsedListingPage> {
  const database = client();
  const now = new Date().toISOString();
  let query = database
    .from('used_listings')
    .select(`${publicColumns},${sellerRelation}`, { count: 'exact' })
    .eq('status', 'active')
    .lte('published_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  query = applyUsedListingFilters(query, filters);

  if (filters.sort === 'price-asc') query = query.order('price_clp', { ascending: true });
  if (filters.sort === 'price-desc') query = query.order('price_clp', { ascending: false });
  if (filters.sort === 'mileage-asc') query = query.order('mileage_km', { ascending: true });
  if (filters.sort === 'recent') query = query.order('published_at', { ascending: false });

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(48, Math.max(1, pageSize));
  const from = (safePage - 1) * safePageSize;
  const { data, error, count } = await query.range(from, from + safePageSize - 1);

  if (error) throw error;
  const rows = (data ?? []) as unknown as UsedListingRow[];

  return { listings: rows.map(mapListing), total: count ?? rows.length };
}

export async function getUsedListingBySlug(slug: string): Promise<UsedListing | null> {
  const { data, error } = await client()
    .from('used_listings')
    .select(`${publicColumns},${sellerRelation}`)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data ? mapListing(data as unknown as UsedListingRow) : null;
}

export async function getUsedListingBrands(): Promise<string[]> {
  const { data, error } = await client().from('used_listings').select('brand').eq('status', 'active');

  if (error) throw error;
  const rows = (data ?? []) as Array<{ brand: string }>;
  return [...new Set(rows.map((row) => row.brand))].sort((a, b) => a.localeCompare(b));
}

export async function getLatestUsedListings(limit = 8): Promise<UsedListing[]> {
  const { listings } = await getActiveUsedListings({
    search: '',
    brand: '',
    region: '',
    fuel: '',
    transmission: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    maxMileage: '',
    sort: 'recent',
  }, 1, limit);
  return listings;
}

export async function createUsedListing(draft: UsedListingDraft): Promise<void> {
  const validationErrors = validateUsedListingDraft(draft);
  if (Object.keys(validationErrors).length > 0) throw new Error('Revisa los datos del vehículo.');

  const database = client();
  const { data: sessionData, error: sessionError } = await database.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session?.user) throw new Error('Inicia sesión para publicar.');

  const sellerId = sessionData.session.user.id;
  const listingId = crypto.randomUUID();
  const slug = buildUsedListingSlug(draft.brand, draft.model, draft.year, listingId.slice(0, 8));
  const photoFolder = `${sellerId}/${listingId}`;
  const uploadedPaths: string[] = [];

  try {
    for (const photo of draft.photos) {
      const extension = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${photoFolder}/${crypto.randomUUID()}.${extension}`;
      const { error } = await database.storage.from('listing-photos').upload(path, photo, {
        cacheControl: '31536000',
        contentType: photo.type,
        upsert: false,
      });
      if (error) throw error;
      uploadedPaths.push(path);
    }

    const { error } = await database
      .from('used_listings')
      .insert({
        id: listingId,
        seller_id: sellerId,
        slug,
        brand: draft.brand.trim(),
        model: draft.model.trim(),
        year: draft.year,
        price_clp: draft.price,
        mileage_km: draft.mileage,
        fuel: draft.fuel,
        transmission: draft.transmission,
        color: draft.color.trim() || null,
        region: draft.region,
        commune: draft.commune.trim() || null,
        description: draft.description.trim(),
        contact_name: draft.contactName.trim(),
        contact_phone: normalizeUsedListingPhone(draft.contactPhone),
        contact_email: draft.contactEmail.trim() || null,
        terms_accepted_version: USED_LISTING_TERMS_VERSION,
        photo_paths: uploadedPaths,
        status: 'pending',
      });

    if (error) throw error;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await database.storage.from('listing-photos').remove(uploadedPaths);
    }
    throw error;
  }
}

export async function getMyUsedListings(): Promise<UsedListing[]> {
  const database = client();
  const { data: sessionData } = await database.auth.getSession();
  if (!sessionData.session?.user) throw new Error('Inicia sesión para ver tus avisos.');

  const { data, error } = await database
    .from('used_listings')
    .select(`${publicColumns},${privateColumns},${sellerRelation}`)
    .eq('seller_id', sessionData.session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as UsedListingRow[]).map(mapListing);
}

export async function markUsedListingAsSold(listingId: string): Promise<void> {
  const { error } = await client().rpc('mark_used_listing_sold', { listing_id: listingId });
  if (error) throw error;
}

export async function reportUsedListing(listingId: string, reason: string): Promise<void> {
  const database = client();
  const { data: sessionData } = await database.auth.getSession();
  if (!sessionData.session?.user) throw new Error('Inicia sesión para reportar un aviso.');
  if (reason.trim().length < 10) throw new Error('Cuéntanos brevemente por qué reportas el aviso.');

  const { error } = await database.from('listing_reports').insert({
    listing_id: listingId,
    reporter_id: sessionData.session.user.id,
    reason: reason.trim(),
  });

  if (error) throw error;
}

export async function isCurrentUserModerator(): Promise<boolean> {
  const { data, error } = await client().rpc('is_moderator');
  if (error) throw error;
  return data === true;
}

export async function getModerationQueue(): Promise<UsedListing[]> {
  const { data, error } = await client()
    .from('used_listings')
    .select(`${publicColumns},${privateColumns},${sellerRelation}`)
    .in('status', ['pending', 'rejected'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as UsedListingRow[]).map(mapListing);
}

export async function moderateUsedListing(
  listingId: string,
  status: Extract<UsedListingStatus, 'active' | 'rejected'>,
  moderationNote: string,
): Promise<void> {
  const database = client();
  const now = new Date();
  const expiresAt = status === 'active'
    ? new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await database.from('used_listings').update({
    status,
    moderation_note: moderationNote.trim() || null,
    published_at: status === 'active' ? now.toISOString() : null,
    expires_at: expiresAt,
  }).eq('id', listingId);

  if (error) throw error;
}

export async function getOpenListingReports(): Promise<Array<{
  id: string;
  listingId: string;
  reason: string;
  createdAt: string;
  listing: UsedListing | null;
}>> {
  const { data, error } = await client()
    .from('listing_reports')
    .select(`id,listing_id,reporter_id,reason,status,created_at,listing:used_listings(${publicColumns},${privateColumns},${sellerRelation})`)
    .in('status', ['open', 'reviewing'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as unknown as UsedListingReportRow[];

  return rows.map((row) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    return {
      id: row.id,
      listingId: row.listing_id,
      reason: row.reason,
      createdAt: row.created_at,
      listing: listing ? mapListing(listing as unknown as UsedListingRow) : null,
    };
  });
}

export async function resolveListingReport(reportId: string): Promise<void> {
  const { error } = await client().from('listing_reports').update({
    status: 'resolved',
    resolved_at: new Date().toISOString(),
  }).eq('id', reportId);
  if (error) throw error;
}
