import { useMemo } from 'react';
import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { carsData, brands, formatPrice, getTypeLabel, getFuelLabel, getBrandUrl } from '../data/brands';
import { carPath } from '../lib/carSlug';
import { CarImage } from '../components/Cars/CarImage';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { brandSlug as toBrandSlug, legacyBrandSlug } from '../lib/brandSlug';

export function BrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const location = useLocation();

  const decoded = (() => { try { return decodeURIComponent(brandSlug ?? ''); } catch { return brandSlug ?? ''; } })();
  const brandName = brands.find(b => toBrandSlug(b) === decoded) ?? brands.find(b => legacyBrandSlug(b) === decoded);
  const canonicalSlug = brandName ? toBrandSlug(brandName) : decoded;

  const brandCars = useMemo(
    () => brandName
      ? carsData
        .filter(c => c.brand === brandName)
        .sort((a, b) => {
          const lineupDiff = Number(a.lineup_2026 === false) - Number(b.lineup_2026 === false);
          if (lineupDiff !== 0) return lineupDiff;
          if (b.year !== a.year) return b.year - a.year;
          return a.model.localeCompare(b.model, 'es');
        })
      : [],
    [brandName]
  );

  if (location.pathname.startsWith('/marca/') || (brandName && canonicalSlug !== decoded)) {
    return <Navigate to={`/marcas/${canonicalSlug}`} replace />;
  }

  const outOfLineup = brandCars.filter(c => c.lineup_2026 === false).length;
  const minPrice = brandCars.reduce((min, car) => Math.min(min, car.price), Number.POSITIVE_INFINITY);
  const topModels = brandCars.slice(0, 5).map(car => car.model).join(', ');
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev';
  const brandJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        name: brandName,
        url: `${siteUrl}/marcas/${canonicalSlug}`,
        description: `Catálogo ${brandName} en Chile con ${brandCars.length} modelos, precios y fichas técnicas.`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: brandName, item: `${siteUrl}/marcas/${canonicalSlug}` },
        ],
      },
    ],
  };

  if (!brandName) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <SEO title="Marca no encontrada" noIndex />
        <p className="text-7xl mb-4">🔍</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Marca no encontrada</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={`${brandName} en Chile ${new Date().getFullYear()} — Modelos, precios y fichas técnicas`}
        description={`Catálogo ${brandName} en Chile: ${brandCars.length} modelos desde ${formatPrice(Number.isFinite(minPrice) ? minPrice : 0)}. Compara versiones, precios y especificaciones.`}
        jsonLd={brandJsonLd}
      />

      <Breadcrumbs items={[{ label: brandName }]} />

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{brandName}</h1>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
          {brandCars.length - outOfLineup} modelo{brandCars.length - outOfLineup !== 1 ? 's' : ''} en parrilla
        </span>
        {outOfLineup > 0 && (
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium">
            {outOfLineup} fuera de parrilla
          </span>
        )}
      </div>

      <a
        href={getBrandUrl(brandName)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mb-8"
      >
        🌐 Sitio oficial de {brandName}
      </a>

      <p className="max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-8">
        La gama {brandName} en Chile reúne {brandCars.length} modelos con precios desde {formatPrice(Number.isFinite(minPrice) ? minPrice : 0)}.
        Entre los modelos disponibles destacan {topModels || 'sus versiones de entrada'}. Compara versiones, combustible,
        transmisión, plazas y equipamiento antes de decidir. Los precios son referenciales y pueden variar según
        concesionario, bonos y financiamiento. AutoLupa no vende vehículos ni cobra comisión por la compra.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brandCars.map(car => (
          <Link
            key={car.id}
            to={carPath(car)}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow hover:shadow-xl transition-all group"
          >
            <div className="h-48 overflow-hidden">
              <CarImage
                carId={car.id}
                brand={car.brand}
                model={car.model}
                type={car.type}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                showLabel={false}
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{car.model}</h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{car.year}</span>
              </div>
              {car.lineup_2026 === false && (
                <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
                  No aparece en la parrilla 2026
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">{getTypeLabel(car.type)}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded">{getFuelLabel(car.fuel)}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">{car.seats} plazas</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{car.description}</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(car.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
