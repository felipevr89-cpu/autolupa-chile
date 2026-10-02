import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SavedSearches } from '../components/Used/SavedSearches';
import { emptyUsedListingFilters, UsedListingFilters } from '../data/usedListings';
import {
  addSearch,
  buildSearchName,
  getNewCount,
  getSearchId,
  hasActiveFilters,
  loadSavedSearches,
  markSearchSeen,
  MAX_SAVED_SEARCHES,
  readAlertCount,
  removeSearch,
  writeAlertCount,
} from '../lib/savedSearches';

const filters: UsedListingFilters = {
  ...emptyUsedListingFilters,
  brand: 'Toyota',
  region: 'Metropolitana',
  maxPrice: '15000000',
};

describe('búsquedas guardadas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('describe la búsqueda con lenguaje legible', () => {
    expect(buildSearchName(emptyUsedListingFilters)).toBe('Todos los avisos');
    expect(buildSearchName(filters)).toBe('Toyota · Metropolitana · hasta $15.000.000');
    expect(buildSearchName({ ...emptyUsedListingFilters, search: 'corolla' })).toBe('«corolla»');
    expect(hasActiveFilters(emptyUsedListingFilters)).toBe(false);
    expect(hasActiveFilters(filters)).toBe(true);
  });

  it('genera el mismo id para el mismo filtro y distinto para otro', () => {
    expect(getSearchId(filters)).toBe(getSearchId({ ...filters }));
    expect(getSearchId(filters)).not.toBe(getSearchId({ ...filters, brand: 'Kia' }));
    expect(getSearchId(filters)).toBe(getSearchId({ ...filters, sort: 'price-asc' }));
  });

  it('guarda, evita duplicados y respeta el límite', () => {
    expect(addSearch(filters, 7)).toBe('added');
    expect(loadSavedSearches()).toHaveLength(1);
    expect(loadSavedSearches()[0].lastCount).toBe(7);
    expect(addSearch(filters, 0)).toBe('duplicate');
    expect(addSearch(emptyUsedListingFilters, 0)).toBe('empty');

    for (let index = 1; index < MAX_SAVED_SEARCHES; index += 1) {
      expect(addSearch({ ...emptyUsedListingFilters, brand: `Marca ${index}` }, 0)).toBe('added');
    }
    expect(loadSavedSearches()).toHaveLength(MAX_SAVED_SEARCHES);
    expect(addSearch({ ...emptyUsedListingFilters, brand: 'Marca extra' }, 0)).toBe('limit');
  });

  it('calcula los avisos nuevos y marca la búsqueda como vista', () => {
    addSearch(filters, 4);
    const [search] = loadSavedSearches();
    expect(getNewCount(search, 6)).toBe(2);
    expect(getNewCount(search, 3)).toBe(0);

    const seen = markSearchSeen(search.id, 6);
    expect(seen[0].lastCount).toBe(6);
    expect(getNewCount(seen[0], 6)).toBe(0);

    removeSearch(search.id);
    expect(loadSavedSearches()).toHaveLength(0);
  });

  it('guarda y limpia el contador de alertas del navbar', () => {
    expect(readAlertCount()).toBe(0);
    writeAlertCount(5);
    expect(readAlertCount()).toBe(5);
    writeAlertCount(-3);
    expect(readAlertCount()).toBe(0);
  });
});

describe('panel de búsquedas guardadas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda la búsqueda actual con su total de avisos', async () => {
    const user = userEvent.setup();
    render(<SavedSearches filters={filters} currentTotal={7} onApply={vi.fn()} />);

    expect(screen.getByText(/guarda una búsqueda/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/Toyota · Metropolitana/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/búsqueda guardada/i);
    expect(loadSavedSearches()).toHaveLength(1);
    expect(loadSavedSearches()[0].lastCount).toBe(7);
  });

  it('aplica los filtros guardados al elegir la búsqueda', async () => {
    const user = userEvent.setup();
    addSearch(filters, 3);
    const onApply = vi.fn();
    render(<SavedSearches filters={filters} currentTotal={3} onApply={onApply} />);

    await user.click(screen.getByRole('button', { name: /^Toyota/ }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Toyota', region: 'Metropolitana' }));
  });

  it('elimina una búsqueda guardada', async () => {
    const user = userEvent.setup();
    addSearch(filters, 3);
    render(<SavedSearches filters={filters} currentTotal={3} onApply={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /eliminar búsqueda/i }));
    expect(screen.getByText(/guarda una búsqueda/i)).toBeInTheDocument();
    expect(loadSavedSearches()).toHaveLength(0);
  });

  it('en modo compacto no ofrece guardar pero lista las guardadas', () => {
    addSearch(filters, 3);
    render(<SavedSearches compact onApply={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /guardar/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Toyota · Metropolitana/)).toBeInTheDocument();
  });
});
