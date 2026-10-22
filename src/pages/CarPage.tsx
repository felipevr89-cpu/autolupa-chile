import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { carsData, formatPrice, getFuelLabel, getTypeLabel } from '../data/brands';
import { carIdFromSlug, carPath, carSlug } from '../lib/carSlug';
import { CarDetail } from '../components/Cars/CarDetail';
import { CreditCalc } from '../components/Calculator/CreditCalc';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev';

interface Props {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onAddRecent: (id: number) => void;
}

export function CarPage({ favorites, onToggleFavorite, onAddRecent }: Props) {
  const { carSlug: slug = '' } = useParams<{ carSlug: string }>();
  const id = carIdFromSlug(slug);
  const car = id ? carsData.find(c => c.id === id) : undefined;

  useEffect(() => {
    if (car) onAddRecent(car.id);
  }, [car, onAddRecent]);

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <SEO title="Auto no encontrado" noIndex />
        <p className="text-7xl mb-4">🔍</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Auto no encontrado</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">El enlace puede estar vencido o el modelo ya no está en el catálogo.</p>
        <Link to="/" className="text-blue-600 hover:underline">← Volver al catálogo</Link>
      </div>
    );
  }

  if (slug !== carSlug(car)) {
    return <Navigate to={carPath(car)} replace />;
  }

  const brandHref = `/marca/${car.brand.toLowerCase().replace(/\s+/g, '-')}`;
  const canonical = `${siteUrl}${carPath(car)}`;
  const description = `${car.brand} ${car.model} ${car.year}: precio desde ${formatPrice(car.price)}. Ficha técnica, versiones, consumo, seguridad y costo total de propiedad.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${car.brand} ${car.model} ${car.year}`,
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    bodyType: getTypeLabel(car.type),
    fuelType: getFuelLabel(car.fuel),
    vehicleTransmission: car.transmission === 'automatica' ? 'Automática' : 'Manual',
    seatingCapacity: car.seats,
    url: canonical,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
      url: canonical,
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title={`${car.brand} ${car.model} ${car.year} — Precio y ficha técnica`} description={description} jsonLd={jsonLd} />
      <Breadcrumbs items={[{ label: car.brand, href: brandHref }, { label: `${car.model} ${car.year}` }]} />
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Volver al catálogo</Link>
      </div>
      <CarDetail
        car={car}
        inline
        isFavorite={favorites.includes(car.id)}
        onToggleFavorite={onToggleFavorite}
      >
        <CreditCalc car={car} />
      </CarDetail>
    </div>
  );
}
