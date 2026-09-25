import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getLatestUsedListings } from '../../lib/usedListings';
import type { UsedListing } from '../../data/usedListings';
import { UsedListingCard } from './UsedListingCard';

export function RecentUsedListings() {
  const [listings, setListings] = useState<UsedListing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setLoading(true);
    getLatestUsedListings(4)
      .then((result) => {
        if (!cancelled) setListings(result);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured || (!loading && listings.length === 0)) return null;

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-1">Marketplace AutoLupa</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Últimos autos publicados</h2>
        </div>
        <Link to="/usados" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Ver todos →</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Cargando últimos usados">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {listings.map((listing) => <UsedListingCard key={listing.id} listing={listing} />)}
        </div>
      )}
      <div className="mt-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-blue-900 dark:text-blue-100">¿Tienes un auto para vender? Publícalo gratis y encuentra compradores en tu región.</p>
        <Link to="/publicar-auto" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Publicar gratis</Link>
      </div>
    </section>
  );
}
