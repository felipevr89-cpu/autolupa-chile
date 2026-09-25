import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { formatPrice } from '../data/brands';
import { toUsedListingStatusLabel, type UsedListing, usedListingWhatsappUrl } from '../data/usedListings';
import { getMyUsedListings, markUsedListingAsSold } from '../lib/usedListings';
import type { User } from '../types';

interface Props {
  user: User | null;
  isCloudAuthAvailable: boolean;
  onSignIn: () => Promise<void>;
}

export function MisAnuncios({ user, isCloudAuthAvailable, onSignIn }: Props) {
  const [listings, setListings] = useState<UsedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError('');
    getMyUsedListings()
      .then(setListings)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'No pudimos cargar tus avisos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  if (!isCloudAuthAvailable) {
    return <div className="max-w-3xl mx-auto px-4 py-16"><SEO title="Mis avisos" description="Gestiona tus autos publicados en AutoLupa." noIndex /><div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-8 text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Gestión de avisos en preparación</h1><p className="text-gray-600 dark:text-gray-300">Conectaremos el marketplace con Supabase antes de habilitar cuentas de vendedores.</p></div></div>;
  }

  if (!user) {
    return <div className="max-w-2xl mx-auto px-4 py-16"><SEO title="Mis avisos" description="Gestiona tus autos publicados en AutoLupa." noIndex /><div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center card-shadow"><p className="text-5xl mb-4">🔑</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Inicia sesión para ver tus avisos</h1><button type="button" onClick={() => onSignIn().catch(() => setError('No pudimos iniciar sesión.'))} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Continuar con Google</button>{error && <p className="text-sm text-red-600 dark:text-red-400 mt-4">{error}</p>}</div></div>;
  }

  const markSold = async (listing: UsedListing) => {
    if (!window.confirm(`¿Marcar ${listing.brand} ${listing.model} como vendido?`)) return;
    setActionId(listing.id);
    setError('');
    try {
      await markUsedListingAsSold(listing.id);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos actualizar el aviso.');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title="Mis avisos" description="Gestiona tus autos publicados en AutoLupa." noIndex />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div><p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Hola, {user.displayName || user.email || 'vendedor'}</p><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis avisos</h1></div>
        <Link to="/publicar-auto" className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Publicar otro auto</Link>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200 mb-5">{error}</p>}
      {loading ? <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}</div> : listings.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 p-10 text-center"><p className="text-5xl mb-4">🚗</p><h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Todavía no tienes avisos</h2><p className="text-gray-600 dark:text-gray-300 mb-6">Publica tu primer auto gratis y llega a compradores en todo Chile.</p><Link to="/publicar-auto" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Publicar mi auto</Link></div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <article key={listing.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 card-shadow flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">{listing.photoUrls[0] ? <img src={listing.photoUrls[0]} alt={`${listing.brand} ${listing.model}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>}</div>
              <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-gray-900 dark:text-white">{listing.brand} {listing.model} {listing.year}</h2><Status status={listing.status} /></div><p className="text-blue-600 dark:text-blue-400 font-bold mt-1">{formatPrice(listing.price)}</p><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listing.mileage.toLocaleString('es-CL')} km · {listing.region}</p>{listing.moderationNote && <p className="text-sm text-red-600 dark:text-red-400 mt-2">Nota: {listing.moderationNote}</p>}</div>
              <div className="flex sm:flex-col gap-2 sm:justify-center"><a href={usedListingWhatsappUrl(listing)} target="_blank" rel="noopener noreferrer" className="text-center px-3 py-2 rounded-lg border border-green-500 text-green-600 dark:text-green-400 text-sm font-semibold">WhatsApp</a>{listing.status === 'active' && <button type="button" onClick={() => markSold(listing)} disabled={actionId === listing.id} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50">Marcar vendido</button>}</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Status({ status }: { status: UsedListing['status'] }) {
  const color = status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>{toUsedListingStatusLabel(status)}</span>;
}
