import { useEffect, useMemo, useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import { Car } from '../types';
import { CarCard } from '../components/Cars/CarCard';
import { SavedSearches } from '../components/Used/SavedSearches';
import { formatPrice } from '../data/brands';
import type { UsedListing, UsedListingFilters } from '../data/usedListings';
import { acknowledgePriceAlert, syncPriceWatch, type PriceAlert } from '../lib/priceWatch';
import {
  removeSavedListing,
  updateSavedPrice,
  useSavedListings,
  type SavedListing,
} from '../lib/savedListings';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSavedUsedListings } from '../lib/usedListings';

interface Props {
  allCars: Car[];
  favorites: number[];
  compareList: Car[];
  onToggleFavorite: (id: number) => void;
  onAddToCompare: (car: Car) => void;
  onRemoveFromCompare: (id: number) => void;
}

type LiveState = 'idle' | 'loading' | 'ready' | 'unavailable';

export function Favorites({
  allCars,
  favorites,
  compareList,
  onToggleFavorite,
  onAddToCompare,
  onRemoveFromCompare,
}: Props) {
  const favoriteCars = useMemo(
    () => allCars.filter((car) => favorites.includes(car.id)),
    [allCars, favorites],
  );
  const navigate = useNavigate();
  const applySearch = (next: UsedListingFilters) => {
    const params = new URLSearchParams();
    if (next.search) params.set('q', next.search);
    if (next.brand) params.set('brand', next.brand);
    if (next.region) params.set('region', next.region);
    const query = params.toString();
    navigate(query ? `/usados?${query}` : '/usados');
  };
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(syncPriceWatch(favoriteCars));
  }, [favoriteCars]);

  const savedMap = useSavedListings();
  const savedListings = useMemo(() => Object.values(savedMap), [savedMap]);
  const [liveState, setLiveState] = useState<LiveState>('idle');
  const [liveById, setLiveById] = useState<Record<string, UsedListing>>({});

  useEffect(() => {
    if (savedListings.length === 0) {
      setLiveState('idle');
      setLiveById({});
      return;
    }
    if (!isSupabaseConfigured) {
      setLiveState('unavailable');
      return;
    }

    let cancelled = false;
    setLiveState('loading');
    getSavedUsedListings(savedListings.map((saved) => saved.id))
      .then((rows) => {
        if (cancelled) return;
        setLiveById(Object.fromEntries(rows.map((row) => [row.id, row])));
        setLiveState('ready');
      })
      .catch(() => {
        if (!cancelled) setLiveState('unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, [savedListings]);

  const carById = useMemo(() => new Map(allCars.map((car) => [car.id, car])), [allCars]);

  const dismissAlert = (alert: PriceAlert) => {
    acknowledgePriceAlert(alert.carId, alert.current);
    setAlerts((prev) => prev.filter((item) => item.carId !== alert.carId));
  };

  const dismissAllAlerts = () => {
    alerts.forEach((alert) => acknowledgePriceAlert(alert.carId, alert.current));
    setAlerts([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Favoritos</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {favoriteCars.length} vehículo{favoriteCars.length !== 1 ? 's' : ''} guardado{favoriteCars.length !== 1 ? 's' : ''}
        </p>
      </div>

      {alerts.length > 0 && (
        <section
          aria-label="Bajas de precio"
          className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white">⬇️ Bajas de precio en tus favoritos</h2>
            <button
              type="button"
              onClick={dismissAllAlerts}
              className="text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline"
            >
              Entendido con todo
            </button>
          </div>
          <ul className="space-y-2">
            {alerts.map((alert) => {
              const car = carById.get(alert.carId);
              const name = car ? `${car.brand} ${car.model} ${car.year}` : `Vehículo #${alert.carId}`;
              const difference = alert.previous - alert.current;
              return (
                <li
                  key={alert.carId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white dark:bg-gray-800 px-4 py-3"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    <strong>{name}</strong> bajó de{' '}
                    <span className="line-through text-gray-400 dark:text-gray-500">{formatPrice(alert.previous)}</span>{' '}
                    a <span className="font-bold text-blue-600 dark:text-blue-400">{formatPrice(alert.current)}</span>
                    <span className="ml-2 text-green-700 dark:text-green-400 font-semibold">
                      −{formatPrice(difference)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => dismissAlert(alert)}
                    className="text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                  >
                    Entendido
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {favoriteCars.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="w-16 h-16 mx-auto text-red-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sin favoritos aún</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Guarda vehículos que te gusten haciendo clic en el corazón</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Explorar vehículos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favoriteCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isFavorite={true}
              isComparing={compareList.some((c) => c.id === car.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToCompare={onAddToCompare}
              onRemoveFromCompare={onRemoveFromCompare}
            />
          ))}
        </div>
      )}

      {savedListings.length > 0 && (
        <section aria-label="Avisos guardados" className="mt-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⭐ Avisos guardados</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {liveState === 'loading'
                ? 'Verificando precio y disponibilidad…'
                : 'Te avisamos si el precio baja o si el aviso deja de estar publicado.'}
            </p>
          </div>

          {liveState === 'unavailable' && (
            <p className="mb-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              No pudimos verificar el estado en línea. Guardamos tu precio de referencia para compararlo en la próxima visita.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedListings.map((saved) => (
              <SavedListingRow
                key={saved.id}
                saved={saved}
                live={liveById[saved.id]}
                liveState={liveState}
              />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Búsquedas guardadas" className="mt-12">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔔 Búsquedas guardadas</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Tus filtros guardados y los avisos nuevos que calzan con ellos.
          </p>
        </div>
        <SavedSearches compact onApply={applySearch} />
      </section>
    </div>
  );
}

function SavedListingRow({
  saved,
  live,
  liveState,
}: {
  saved: SavedListing;
  live?: UsedListing;
  liveState: LiveState;
}) {
  const checked = liveState === 'ready';
  const dropped = !!live && live.price < saved.price;
  const difference = live ? saved.price - live.price : 0;

  return (
    <article className="rounded-2xl bg-white dark:bg-gray-800 p-4 card-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{saved.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {saved.savedAt ? `Guardado el ${new Date(saved.savedAt).toLocaleDateString('es-CL')}` : 'Guardado'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => removeSavedListing(saved.id)}
          aria-label={`Quitar ${saved.title} de guardados`}
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
        >
          Quitar
        </button>
      </div>

      {checked && !live ? (
        <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
          Este aviso ya no está publicado: vendido, retirado o en revisión.
        </p>
      ) : (
        <div className="mt-3">
          {dropped ? (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <span className="line-through text-gray-400 dark:text-gray-500">{formatPrice(saved.price)}</span>{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatPrice(live!.price)}</span>
                <span className="ml-2 font-semibold text-green-700 dark:text-green-400">−{formatPrice(difference)}</span>
              </p>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mt-1">⬇️ Bajó de precio</p>
              <button
                type="button"
                onClick={() => updateSavedPrice(saved.id, live!.price)}
                className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Entendido
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Precio guardado:{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {live ? formatPrice(live.price) : formatPrice(saved.price)}
              </span>
            </p>
          )}
        </div>
      )}

      {live && (
        <Link
          to={`/usados/${live.slug}`}
          className="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ver aviso →
        </Link>
      )}
    </article>
  );
}
