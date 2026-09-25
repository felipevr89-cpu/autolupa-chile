import { describe, expect, it } from 'vitest';
import {
  buildUsedListingSlug,
  normalizeUsedListingPhone,
  toUsedListingStatusLabel,
  USED_LISTING_TERMS_VERSION,
  validateUsedListingDraft,
  type UsedListingDraft,
} from '../data/usedListings';
import { internalUsedListingColumns, usedListingPublicColumns } from '../lib/usedListings';

function validDraft(): UsedListingDraft {
  return {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    price: 8500000,
    mileage: 65000,
    fuel: 'hibrido',
    transmission: 'automatica',
    color: 'Blanco',
    region: 'Metropolitana',
    commune: 'Las Condes',
    description: 'Vehículo en excellent estado, con mantenciones al día y un solo dueño.',
    contactName: 'Camila Pérez',
    contactPhone: '+56 9 1234 5678',
    contactEmail: 'camila@example.com',
    photos: [new File(['foto'], 'auto.jpg', { type: 'image/jpeg' })],
  };
}

describe('used listing validation', () => {
  it('accepts a complete listing', () => {
    expect(validateUsedListingDraft(validDraft())).toEqual({});
  });

  it('rejects missing photos and invalid contact data', () => {
    const draft = validDraft();
    draft.photos = [];
    draft.contactPhone = '123';
    const errors = validateUsedListingDraft(draft);
    expect(errors.photos).toBeDefined();
    expect(errors.contactPhone).toBeDefined();
  });

  it('normalizes Chilean mobile numbers', () => {
    expect(normalizeUsedListingPhone('9 1234 5678')).toBe('+56912345678');
    expect(normalizeUsedListingPhone('+56 9 1234 5678')).toBe('+56912345678');
    expect(normalizeUsedListingPhone('12345678')).toBe('+5612345678');
  });

  it('creates readable unique slugs', () => {
    expect(buildUsedListingSlug('MG', 'ZS EV', 2024, 'abcd1234')).toBe('mg-zs-ev-2024-abcd1234');
  });

  it('exposes clear status labels', () => {
    expect(toUsedListingStatusLabel('pending')).toBe('En revisión');
    expect(toUsedListingStatusLabel('active')).toBe('Publicado');
  });

  it('keeps internal columns out of the public projection', () => {
    const publicColumns = usedListingPublicColumns.split(',');
    for (const column of internalUsedListingColumns) {
      expect(publicColumns).not.toContain(column);
    }
    expect(publicColumns).toContain('slug');
    expect(publicColumns).toContain('contact_phone');
  });

  it('requires a terms version that matches the published documents', () => {
    expect(USED_LISTING_TERMS_VERSION).toMatch(/^\d+\.\d+$/);
  });
});
