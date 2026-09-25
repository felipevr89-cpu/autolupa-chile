export const USED_REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const;

export const USED_FUEL_OPTIONS = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'hibrido_enchufable', label: 'Híbrido enchufable' },
] as const;

export const USED_TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatica', label: 'Automática' },
] as const;

export const USED_LISTING_TERMS_VERSION = '1.1';

export type UsedListingStatus = 'pending' | 'active' | 'rejected' | 'sold' | 'expired';
export type UsedListingFuel = (typeof USED_FUEL_OPTIONS)[number]['value'];
export type UsedListingTransmission = (typeof USED_TRANSMISSION_OPTIONS)[number]['value'];

export interface UsedListingFilters {
  search: string;
  brand: string;
  region: string;
  fuel: UsedListingFuel | '';
  transmission: UsedListingTransmission | '';
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  maxMileage: string;
  sort: 'recent' | 'price-asc' | 'price-desc' | 'mileage-asc';
}

export const emptyUsedListingFilters: UsedListingFilters = {
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
};

export interface UsedListingDraft {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: UsedListingFuel;
  transmission: UsedListingTransmission;
  color: string;
  region: string;
  commune: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  photos: File[];
}

export interface UsedListingValidationErrors {
  brand?: string;
  model?: string;
  year?: string;
  price?: string;
  mileage?: string;
  color?: string;
  region?: string;
  commune?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  photos?: string;
}

export interface UsedListingSeller {
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UsedListing {
  id: string;
  sellerId: string;
  status: UsedListingStatus;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: UsedListingFuel;
  transmission: UsedListingTransmission;
  color: string;
  region: string;
  commune: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  featuredUntil: string | null;
  moderationNote: string | null;
  seller: UsedListingSeller | null;
}

export interface UsedListingPage {
  listings: UsedListing[];
  total: number;
}

export const MAX_LISTING_PHOTOS = 8;
export const MAX_LISTING_PHOTO_BYTES = 5 * 1024 * 1024;
const CURRENT_YEAR = new Date().getFullYear();
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUsedListingPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 9 && digits.startsWith('9')) return `+56${digits}`;
  if (digits.length === 11 && digits.startsWith('569')) return `+${digits}`;
  if (digits.length === 12 && digits.startsWith('0569')) return `+${digits.slice(1)}`;
  if (digits.length === 8) return `+56${digits}`;

  return value.trim();
}

export function validateUsedListingDraft(draft: UsedListingDraft): UsedListingValidationErrors {
  const errors: UsedListingValidationErrors = {};

  if (draft.brand.trim().length < 1) errors.brand = 'Indica la marca.';
  if (draft.model.trim().length < 1) errors.model = 'Indica el modelo.';
  if (!Number.isInteger(draft.year) || draft.year < 1900 || draft.year > CURRENT_YEAR + 1) {
    errors.year = `Ingresa un año entre 1900 y ${CURRENT_YEAR + 1}.`;
  }
  if (!Number.isFinite(draft.price) || draft.price < 100000 || draft.price > 2000000000) {
    errors.price = 'Ingresa un precio válido.';
  }
  if (!Number.isInteger(draft.mileage) || draft.mileage < 0 || draft.mileage > 2000000) {
    errors.mileage = 'Ingresa un kilometraje válido.';
  }
  if (draft.color.trim().length > 40) errors.color = 'El color es demasiado largo.';
  if (!USED_REGIONS.includes(draft.region as (typeof USED_REGIONS)[number])) errors.region = 'Selecciona una región.';
  if (draft.commune.trim().length > 80) errors.commune = 'La comuna es demasiado larga.';
  if (draft.description.trim().length < 20 || draft.description.trim().length > 2000) {
    errors.description = 'Describe el vehículo entre 20 y 2.000 caracteres.';
  }
  if (draft.contactName.trim().length < 2) errors.contactName = 'Ingresa tu nombre.';
  if (!/^\+[1-9]\d{7,14}$/.test(normalizeUsedListingPhone(draft.contactPhone))) {
    errors.contactPhone = 'Ingresa un teléfono válido para WhatsApp.';
  }
  if (draft.contactEmail && !EMAIL_PATTERN.test(draft.contactEmail.trim())) {
    errors.contactEmail = 'Ingresa un correo válido o déjalo vacío.';
  }
  if (draft.photos.length < 1) {
    errors.photos = 'Sube al menos una foto.';
  } else if (draft.photos.length > MAX_LISTING_PHOTOS) {
    errors.photos = `Puedes subir hasta ${MAX_LISTING_PHOTOS} fotos.`;
  } else if (draft.photos.some((photo) => !PHOTO_TYPES.has(photo.type) || photo.size > MAX_LISTING_PHOTO_BYTES)) {
    errors.photos = 'Usa imágenes JPG, PNG o WebP de hasta 5 MB.';
  }

  return errors;
}

export function buildUsedListingSlug(brand: string, model: string, year: number, suffix: string): string {
  const normalize = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${normalize(brand)}-${normalize(model)}-${year}-${suffix}`.slice(0, 180);
}

export function toUsedListingStatusLabel(status: UsedListingStatus): string {
  const labels: Record<UsedListingStatus, string> = {
    pending: 'En revisión',
    active: 'Publicado',
    rejected: 'No aprobado',
    sold: 'Vendido',
    expired: 'Expirado',
  };

  return labels[status];
}

export function usedListingWhatsappUrl(listing: UsedListing): string {
  const text = encodeURIComponent(`Hola, vi tu ${listing.brand} ${listing.model} ${listing.year} en AutoLupa. ¿Sigue disponible?`);
  return `https://wa.me/${listing.contactPhone.replace(/\D/g, '')}?text=${text}`;
}
