import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { carsData, brands, formatPrice, getTypeLabel, getFuelLabel, getBrandUrl } from '../data/brands';
import { CarImage } from '../components/Cars/CarImage';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function BrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const brandName = brands.find(b => b.toLowerCase().replace(/\s+/g, '-') === brandSlug);

  const brandCars = useMemo(
    () => brandName ? carsData.filter(c => c.brand === brandName).sort((a, b) => b.year - a.year) : [],
    [brandName]
  );

  if (!brandName) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-7xl mb-4">🔍</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Marca no encontrada</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={`${brandName} — Autos nuevos en Chile ${new Date().getFullYear()}`}
        description={`Catálogo completo de ${brandName} en Chile. ${brandCars.length} modelos con precios, especificaciones y comparación.`}
      />

      <Breadcrumbs items={[{ label: brandName }]} />

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{brandName}</h1>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
          {brandCars.length} modelo{brandCars.length !== 1 ? 's' : ''}
        </span>
      </div>

      <a
        href={getBrandUrl(brandName)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mb-8"
      >
        🌐 Sitio oficial de {brandName}
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brandCars.map(car => (
          <Link
            key={car.id}
            to={`/?id=${car.id}`}
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
