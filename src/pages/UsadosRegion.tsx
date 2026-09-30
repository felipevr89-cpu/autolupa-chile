import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { UsedListingCard } from '../components/Used/UsedListingCard';
import {
  CHILE_REGIONS,
  getRegionBySlug,
  getRegionDescription,
  getRegionIntro,
  getRegionTitle,
  regionPath,
} from '../data/chileRegions';
import { emptyUsedListingFilters, type UsedListing } from '../data/usedListings';
import { isSupabaseConfigured } from '../lib/supabase';
import { getActiveUsedListings } from '../lib/usedListings';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev';
const PAGE_SIZE = 12;

function RegionGrid({ activeSlug }: { activeSlug?: string }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Todos los avisos por región</h2>
      <div className="flex flex-wrap gap-2">
        {CHILE_REGIONS.map((region) => (
          <Link
            key={region.slug}
            to={regionPath(region)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${region.slug === activeSlug ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {region.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function UsadosRegion() {
  const { regionSlug } = useParams<{ regionSlug: string }>();
  const region = getRegionBySlug(regionSlug);
  const [listings, setListings] = useState<UsedListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!region || !isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    getActiveUsedListings({ ...emptyUsedListingFilters, region: region.name }, 1, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return;
        setListings(result.listings);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos cargar los avisos de la región. Intenta nuevamente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [region]);

  const jsonLd = useMemo(() => {
    if (!region) return undefined;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Autos usados', item: `${SITE_URL}/usados` },
            { '@type': 'ListItem', position: 3, name: `Autos usados en ${region.name}`, item: `${SITE_URL}${regionPath(region)}` },
          ],
        },
        {
          '@type': 'CollectionPage',
          name: getRegionTitle(region, total),
          description: getRegionDescription(region, total),
          url: `${SITE_URL}${regionPath(region)}`,
          isPartOf: { '@type': 'WebSite', name: 'AutoLupa', url: SITE_URL },
        },
        ...(listings.length > 0
          ? [{
              '@type': 'ItemList',
              name: `Autos usados en ${region.name}`,
              numberOfItems: listings.length,
              itemListElement: listings.map((listing, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${SITE_URL}/usados/${listing.slug}`,
                name: `${listing.brand} ${listing.model} ${listing.year}`,
              })),
            }]
          : []),
      ],
    };
  }, [region, listings, total]);

  if (!region) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <SEO title="Región no encontrada" description="Regiones de Chile con avisos de autos usados en AutoLupa." noIndex />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No encontramos esa región</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Elige una de las 16 regiones de Chile para ver sus avisos.</p>
        <RegionGrid />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={getRegionTitle(region, total)}
        description={getRegionDescription(region, total)}
        jsonLd={jsonLd}
      />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-5" aria-label="Ruta de navegación">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/usados" className="hover:text-blue-600 dark:hover:text-blue-400">Autos usados</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 dark:text-gray-300">{region.name}</span>
      </nav>

      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-white mb-8">
        <p className="text-blue-100 font-medium mb-3">{region.fullName}</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Autos usados en {region.name}</h1>
        <p className="text-blue-100 text-lg mb-6 max-w-3xl">{getRegionIntro(region, total)}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/publicar-auto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            📢 Publicar gratis en {region.name}
          </Link>
          <Link
            to="/usados"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            Ver todos los avisos
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 card-shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400">Capital regional</p>
          <p className="font-bold text-gray-900 dark:text-white">{region.capital}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 card-shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400">Comunas</p>
          <p className="font-bold text-gray-900 dark:text-white">{region.communes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 card-shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400">Provincias</p>
          <p className="font-bold text-gray-900 dark:text-white">{region.provinces}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 card-shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avisos activos</p>
          <p className="font-bold text-gray-900 dark:text-white">{loading ? '…' : total}</p>
        </div>
      </section>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Cargando avisos">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-6 text-amber-900 dark:text-amber-100">
          <h2 className="text-lg font-bold mb-2">El mercado está en preparación</h2>
          <p className="text-sm">Estamos habilitando la base de avisos y la verificación de vendedores. Puedes comparar autos nuevos o preparar tu publicación.</p>
        </div>
      )}

      {!loading && isSupabaseConfigured && error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>
      )}

      {!loading && isSupabaseConfigured && !error && total === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
          <p className="text-4xl mb-3">🚗</p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aún no hay avisos en {region.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
            Sé el primero en publicar tu auto en {region.capital} o en {region.cities[region.cities.length - 1]}. Es gratis y sin comisión.
          </p>
          <Link to="/publicar-auto" className="inline-flex px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
            Publicar mi auto gratis
          </Link>
        </div>
      )}

      {!loading && isSupabaseConfigured && !error && listings.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => <UsedListingCard key={listing.id} listing={listing} />)}
          </div>
          {total > listings.length && (
            <div className="mt-6 text-center">
              <Link
                to={`/usados?region=${encodeURIComponent(region.name)}`}
                className="inline-flex px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Ver los {total} avisos de {region.name}
              </Link>
            </div>
          )}
        </>
      )}

      <RegionGrid activeSlug={region.slug} />
    </div>
  );
}
