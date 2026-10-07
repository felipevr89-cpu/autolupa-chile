import { useEffect, useState } from 'react';
import { UsedListingFilters } from '../../data/usedListings';
import {
  addSearch,
  AddSearchResult,
  getNewCount,
  loadSavedSearches,
  markSearchSeen,
  MAX_SAVED_SEARCHES,
  removeSearch,
  SavedSearch,
  writeAlertCount,
} from '../../lib/savedSearches';
import { isSupabaseConfigured } from '../../lib/supabase';
import { countActiveUsedListings } from '../../lib/usedListings';
import { track } from '../../lib/analytics';

const MESSAGES: Record<AddSearchResult, string> = {
  added: 'Búsqueda guardada. Te avisamos si entran avisos nuevos.',
  duplicate: 'Esa búsqueda ya está guardada.',
  limit: `Puedes guardar hasta ${MAX_SAVED_SEARCHES} búsquedas.`,
  empty: 'Aplica al menos un filtro antes de guardar la búsqueda.',
};

interface Props {
  onApply: (filters: UsedListingFilters) => void;
  filters?: UsedListingFilters;
  currentTotal?: number;
  compact?: boolean;
}

export function SavedSearches({ onApply, filters, currentTotal = 0, compact = false }: Props) {
  const [searches, setSearches] = useState<SavedSearch[]>(() => loadSavedSearches());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (searches.length === 0) {
      writeAlertCount(0);
      return;
    }
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    const refresh = async () => {
      const next: Record<string, number> = {};
      await Promise.all(
        searches.map(async (search) => {
          try {
            next[search.id] = await countActiveUsedListings(search.filters);
          } catch {
            next[search.id] = search.lastCount;
          }
        }),
      );
      if (cancelled) return;
      setCounts(next);
      writeAlertCount(
        searches.reduce((sum, search) => sum + getNewCount(search, next[search.id] ?? search.lastCount), 0),
      );
    };

    void refresh();
    return () => {
      cancelled = true;
    };
  }, [searches]);

  const handleSave = () => {
    if (!filters) return;
    const result = addSearch(filters, currentTotal);
    setMessage(MESSAGES[result]);
    if (result === 'added') {
      track('SavedSearch', { accion: 'guardar' });
      setSearches(loadSavedSearches());
    }
  };

  const handleApply = (search: SavedSearch) => {
    const count = counts[search.id] ?? search.lastCount;
    setSearches(markSearchSeen(search.id, count));
    onApply(search.filters);
  };

  const handleRemove = (id: string) => {
    setSearches(removeSearch(id));
    track('SavedSearch', { accion: 'quitar' });
    setMessage('Búsqueda eliminada.');
  };

  return (
    <section aria-label="Búsquedas guardadas" className={compact ? '' : 'bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow'}>
      {!compact && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Tus búsquedas</h2>
          <button
            type="button"
            onClick={handleSave}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            🔔 Guardar
          </button>
        </div>
      )}

      {message && <p role="status" className="text-xs text-gray-500 dark:text-gray-400 mb-2">{message}</p>}

      {searches.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {compact
            ? 'Todavía no guardas búsquedas. Puedes guardarlas desde la página de usados.'
            : 'Guarda una búsqueda y te avisamos cuando entren autos que calcen con tus filtros.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {searches.map((search) => {
            const count = counts[search.id];
            const nuevos = count === undefined ? 0 : getNewCount(search, count);
            return (
              <li key={search.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApply(search)}
                  className="flex-1 min-w-0 text-left rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 hover:border-blue-500 transition-colors"
                >
                  <span className="block text-xs font-semibold text-gray-900 dark:text-white truncate">{search.name}</span>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                    {count === undefined
                      ? (isSupabaseConfigured ? 'Consultando avisos…' : 'Avisos no disponibles')
                      : `${count} ${count === 1 ? 'aviso' : 'avisos'}`}
                    {nuevos > 0 && ` · ${nuevos} nuevo${nuevos === 1 ? '' : 's'}`}
                  </span>
                </button>
                {nuevos > 0 && (
                  <span className="shrink-0 text-[11px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">{nuevos}</span>
                )}
                <button
                  type="button"
                  aria-label={`Eliminar búsqueda ${search.name}`}
                  onClick={() => handleRemove(search.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
