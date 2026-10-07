import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SafetyBanner } from '../components/Trust/SafetyBanner';
import { AutoLupaSeal } from '../components/Trust/AutoLupaSeal';
import { DocumentLinks } from '../components/Trust/DocumentLinks';
import { SaveListingButton } from '../components/Used/SaveListingButton';
import { formatPrice } from '../data/brands';
import { USED_FUEL_OPTIONS, USED_TRANSMISSION_OPTIONS, type UsedListing, usedListingWhatsappUrl } from '../data/usedListings';
import { toSavedListing } from '../lib/savedListings';
import { getUsedListingBySlug, reportUsedListing } from '../lib/usedListings';
import { isSupabaseConfigured } from '../lib/supabase';
import { track } from '../lib/analytics';
import type { User } from '../types';

interface Props {
  user: User | null;
  isCloudAuthAvailable: boolean;
  onSignIn: () => Promise<void>;
}

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev';

function fuelLabel(value: UsedListing['fuel']): string {
  return USED_FUEL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function transmissionLabel(value: UsedListing['transmission']): string {
  return USED_TRANSMISSION_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function UsedListingDetail({ user, isCloudAuthAvailable, onSignIn }: Props) {
  const { slug = '' } = useParams<{ slug: string }>();
  const [listing, setListing] = useState<UsedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [reportState, setReportState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured || !slug) {
      setLoading(false);
      setNotFound(!isSupabaseConfigured);
      return;
    }
    setLoading(true);
    setNotFound(false);
    getUsedListingBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        setListing(result);
        setSelectedPhoto(0);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submitReport = async () => {
    if (!listing || !user) return;
    setReportState('sending');
    setReportError('');
    try {
      await reportUsedListing(listing.id, reportReason);
      setReportState('sent');
      setReportReason('');
    } catch (error) {
      setReportState('idle');
      setReportError(error instanceof Error ? error.message : 'No pudimos enviar el reporte.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (!listing || notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SEO title="Aviso no encontrado" description="El aviso solicitado no está disponible." noIndex />
        <p className="text-6xl mb-5">🔎</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Aviso no disponible</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-7">El aviso pudo haber sido vendido, retirado o todavía no estar publicado.</p>
        <Link to="/usados" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Ver autos usados</Link>
      </div>
    );
  }

  const canonical = `${siteUrl}/usados/${listing.slug}`;
  const displayName = listing.seller?.display_name || listing.contactName;
  const vehicleJsonLd = {
    '@type': 'Vehicle',
    name: `${listing.brand} ${listing.model} ${listing.year}`,
    brand: { '@type': 'Brand', name: listing.brand },
    model: listing.model,
    vehicleModelDate: String(listing.year),
    vehicleTransmission: transmissionLabel(listing.transmission),
    fuelType: fuelLabel(listing.fuel),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: listing.mileage, unitCode: 'KMT' },
    image: listing.photoUrls,
    description: listing.description,
    url: canonical,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
      url: canonical,
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@type': 'Person', name: displayName },
    },
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      vehicleJsonLd,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Autos usados', item: `${siteUrl}/usados` },
          { '@type': 'ListItem', position: 3, name: `${listing.brand} ${listing.model} ${listing.year}`, item: canonical },
        ],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={`${listing.brand} ${listing.model} ${listing.year} Usado`}
        description={`${listing.brand} ${listing.model} ${listing.year} usado en ${listing.region}. Precio ${formatPrice(listing.price)}. Contacta al vendedor por WhatsApp.`}
        jsonLd={jsonLd}
      />
      <Breadcrumbs items={[
        { label: 'Autos usados', href: '/usados' },
        { label: `${listing.brand} ${listing.model} ${listing.year}` },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-8 mt-5">
        <section>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
            {listing.photoUrls[selectedPhoto] ? (
              <img src={listing.photoUrls[selectedPhoto]} alt={`${listing.brand} ${listing.model} ${listing.year}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🚗</div>
            )}
          </div>
          {listing.photoUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {listing.photoUrls.map((photo, index) => (
                <button key={photo} type="button" onClick={() => setSelectedPhoto(index)} className={`aspect-square overflow-hidden rounded-xl border-2 ${selectedPhoto === index ? 'border-blue-600' : 'border-transparent'}`} aria-label={`Ver foto ${index + 1}`}>
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-8 rounded-2xl bg-white dark:bg-gray-800 p-6 card-shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Descripción</h2>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">{listing.description}</p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Detail label="Año" value={String(listing.year)} />
              <Detail label="Kilometraje" value={`${listing.mileage.toLocaleString('es-CL')} km`} />
              <Detail label="Combustible" value={fuelLabel(listing.fuel)} />
              <Detail label="Transmisión" value={transmissionLabel(listing.transmission)} />
            </dl>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 card-shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">{listing.brand}</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{listing.model}</h1>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-4">{formatPrice(listing.price)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listing.year} · {listing.mileage.toLocaleString('es-CL')} km</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">📍 {listing.commune ? `${listing.commune}, ` : ''}{listing.region}</p>
            <div className="mt-4">
              <SaveListingButton listing={toSavedListing(listing)} />
            </div>
            <a href={usedListingWhatsappUrl(listing)} target="_blank" rel="noopener noreferrer" onClick={() => track('ContactSeller', { region: listing.region })} className="mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold">Contactar por WhatsApp</a>
            {listing.contactEmail && <a href={`mailto:${listing.contactEmail}`} className="mt-3 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">Enviar correo</a>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">La publicación es gratuita. AutoLupa no cobra comisión por este aviso.</p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 card-shadow">
            <h2 className="font-bold text-gray-900 dark:text-white">Vendedor</h2>
            <div className="flex items-center gap-3 mt-3">
              {listing.seller?.avatar_url ? <img src={listing.seller.avatar_url} alt="" className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">{displayName.charAt(0).toUpperCase()}</div>}
              <div><p className="font-semibold text-gray-900 dark:text-white">{displayName}</p><p className="text-xs text-gray-500 dark:text-gray-400">Perfil de AutoLupa</p></div>
            </div>
            {listing.seller?.email_verified && (
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2.5 py-1 rounded-full">
                ✓ Correo verificado
              </span>
            )}
          </div>

          <AutoLupaSeal emailVerified={!!listing.seller?.email_verified} />

          <SafetyBanner />

          <DocumentLinks />

          <details className="rounded-2xl bg-white dark:bg-gray-800 p-5 card-shadow">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">Reportar este aviso</summary>
            {reportState === 'sent' ? (
              <p className="text-sm text-green-600 dark:text-green-400 mt-3">Recibimos tu reporte. Gracias por ayudar a mantener segura la comunidad.</p>
            ) : user ? (
              <div className="mt-3">
                <textarea value={reportReason} onChange={(event) => setReportReason(event.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm" placeholder="Cuéntanos qué problema detectaste" />
                {reportError && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{reportError}</p>}
                <button type="button" onClick={submitReport} disabled={reportState === 'sending'} className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-semibold disabled:opacity-50">Enviar reporte</button>
              </div>
            ) : isCloudAuthAvailable ? (
              <div className="mt-3"><p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Inicia sesión para enviar un reporte.</p><button type="button" onClick={() => onSignIn().catch(() => setReportError('No pudimos iniciar sesión.'))} className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Iniciar sesión</button>{reportError && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{reportError}</p>}</div>
            ) : <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">El sistema de reportes estará disponible cuando se habilite el mercado.</p>}
          </details>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt><dd className="font-semibold text-gray-900 dark:text-white">{value}</dd></div>;
}
