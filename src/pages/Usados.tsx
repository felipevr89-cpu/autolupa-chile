import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { UsedListingCard } from '../components/Used/UsedListingCard';
import { isSupabaseConfigured } from '../lib/supabase';
import { track } from '../lib/analytics';
import { getActiveUsedListings, getUsedListingBrands } from '../lib/usedListings';
import { CHILE_REGIONS, regionPath } from '../data/chileRegions';
import {
  emptyUsedListingFilters,
  USED_FUEL_OPTIONS,
  USED_REGIONS,
  USED_TRANSMISSION_OPTIONS,
  type UsedListing,
  type UsedListingFilters,
} from '../data/usedListings';

const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 12;

function inputClassName() {
  return 'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300';
}

export function Usados() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<UsedListingFilters>(() => ({
    ...emptyUsedListingFilters,
    region: searchParams.get('region') ?? '',
    brand: searchParams.get('brand') ?? '',
    search: searchParams.get('q') ?? '',
  }));
  const [listings, setListings] = useState<UsedListing[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value !== '' && value !== 'recent'), [filters]);
  const listingJsonLd = listings.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Autos usados en Chile',
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev'}/usados/${listing.slug}`,
      name: `${listing.brand} ${listing.model} ${listing.year}`,
    })),
  } : undefined;

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    getActiveUsedListings(filters, page, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return;
        setListings(result.listings);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos cargar los avisos. Intenta nuevamente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getUsedListingBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  const updateFilter = <K extends keyof UsedListingFilters>(key: K, value: UsedListingFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
    track('Search', { filtro: String(key), valor: String(value) });
    if (key === 'region' || key === 'brand' || key === 'search') {
      const paramKey = key === 'search' ? 'q' : key;
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(paramKey, String(value));
        else next.delete(paramKey);
        return next;
      }, { replace: true });
    }
  };

  const resetFilters = () => {
    setFilters(emptyUsedListingFilters);
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Autos Usados en Chile: Compra y Publica Gratis"
        description="Compra autos usados en Chile o publica tu vehículo gratis en AutoLupa. Filtra por marca, precio, kilometraje, año y región. Contacta directo por WhatsApp."
        jsonLd={listingJsonLd}
      />

      <Breadcrumbs items={[{ label: 'Autos usados' }]} />

      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 rounded-3xl px-6 py-10 sm:px-10 sm:py-14 text-white mb-8">
        <div className="max-w-3xl">
          <p className="text-blue-100 font-medium mb-3">Marketplace de usados</p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Encuentra tu próximo auto usado</h1>
          <p className="text-blue-100 text-lg mb-7">Publica gratis, sin comisiones. Conversa directamente con el vendedor por WhatsApp.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/publicar-auto"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              📢 Publicar mi auto gratis
            </Link>
            <Link
              to="/tasar-auto"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold transition-colors"
            >
              🧮 ¿Cuánto vale tu auto?
            </Link>
          </div>
        </div>
      </section>

      {!isSupabaseConfigured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-6 text-amber-900 dark:text-amber-100">
          <h2 className="text-lg font-bold mb-2">El mercado está en preparación</h2>
          <p className="text-sm">Estamos habilitando la base de avisos y la verificación de vendedores. Mientras tanto, puedes comparar autos nuevos y preparar tu publicación.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
            <aside className="bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white">Filtros</h2>
                {hasFilters && <button onClick={resetFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Limpiar</button>}
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Buscar</span>
                  <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} className={inputClassName()} placeholder="Marca o modelo" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Marca</span>
                  <select value={filters.brand} onChange={(event) => updateFilter('brand', event.target.value)} className={inputClassName()}>
                    <option value="">Todas</option>
                    {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Región</span>
                  <select value={filters.region} onChange={(event) => updateFilter('region', event.target.value)} className={inputClassName()}>
                    <option value="">Todas</option>
                    {USED_REGIONS.map((region) => <option key={region}>{region}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Combustible</span>
                  <select value={filters.fuel} onChange={(event) => updateFilter('fuel', event.target.value as UsedListingFilters['fuel'])} className={inputClassName()}>
                    <option value="">Todos</option>
                    {USED_FUEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transmisión</span>
                  <select value={filters.transmission} onChange={(event) => updateFilter('transmission', event.target.value as UsedListingFilters['transmission'])} className={inputClassName()}>
                    <option value="">Todas</option>
                    {USED_TRANSMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Año mín.</span>
                    <input type="number" inputMode="numeric" value={filters.minYear} onChange={(event) => updateFilter('minYear', event.target.value)} className={inputClassName()} placeholder="2015" />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Año máx.</span>
                    <input type="number" inputMode="numeric" value={filters.maxYear} onChange={(event) => updateFilter('maxYear', event.target.value)} className={inputClassName()} placeholder={String(CURRENT_YEAR)} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Precio mín.</span>
                    <input type="number" inputMode="numeric" value={filters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} className={inputClassName()} placeholder="1.000.000" />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Precio máx.</span>
                    <input type="number" inputMode="numeric" value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} className={inputClassName()} placeholder="20.000.000" />
                  </label>
                </div>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Km máx.</span>
                  <input type="number" inputMode="numeric" value={filters.maxMileage} onChange={(event) => updateFilter('maxMileage', event.target.value)} className={inputClassName()} placeholder="100000" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ordenar por</span>
                  <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value as UsedListingFilters['sort'])} className={inputClassName()}>
                    <option value="recent">Más recientes</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                    <option value="mileage-asc">Menos kilómetros</option>
                  </select>
                </label>
              </div>
            </aside>

            <section>
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
                  {loading ? 'Cargando avisos…' : `${total} ${total === 1 ? 'aviso' : 'avisos'} disponible${total === 1 ? '' : 's'}`}
                </p>
              </div>

              {error && <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200 mb-4">{error}</p>}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" aria-label="Cargando">
                  {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 p-10 text-center">
                  <p className="text-5xl mb-4">🚙</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sé el primero en publicar</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">Crea tu aviso gratis. Nuestro equipo lo revisará antes de publicarlo.</p>
                  <Link to="/publicar-auto" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Publicar mi auto gratis</Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {listings.map((listing) => <UsedListingCard key={listing.id} listing={listing} />)}
                  </div>
                  {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Paginación de avisos">
                      <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40">Anterior</button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Página {page} de {totalPages}</span>
                      <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40">Siguiente</button>
                    </nav>
                  )}
                </>
              )}
            </section>
          </div>
        </>
      )}

      <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Autos usados por región</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Elige tu zona y revisa los avisos publicados en cada región de Chile.</p>
        <div className="flex flex-wrap gap-2">
          {CHILE_REGIONS.map((region) => (
            <Link
              key={region.slug}
              to={regionPath(region)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {region.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
