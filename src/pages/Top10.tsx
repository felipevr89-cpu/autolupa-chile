import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Car } from '../types';
import { CarCard } from '../components/Cars/CarCard';
import { CarDetail } from '../components/Cars/CarDetail';
import { carsData, formatPrice } from '../data/brands';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  ShieldCheckIcon,
  CubeIcon,
  FireIcon,
  BoltIcon,
  BanknotesIcon,
  Battery100Icon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const categories = [
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: ShieldCheckIcon,
    description: 'Los vehículos mejor calificados en pruebas de seguridad con 5 estrellas Latin NCAP.',
  },
  {
    id: 'espacio',
    label: 'Más Espaciosos',
    icon: CubeIcon,
    description: 'Los autos con mayor capacidad de maletero para llevar todo lo que necesitas.',
  },
  {
    id: 'consumo',
    label: 'Mejor Consumo',
    icon: FireIcon,
    description: 'Los vehículos más eficientes en consumo mixto de combustible.',
  },
  {
    id: 'potencia',
    label: 'Mayor Potencia',
    icon: BoltIcon,
    description: 'Los motores más potentes del mercado chileno.',
  },
  {
    id: 'economico',
    label: 'Más Económicos',
    icon: BanknotesIcon,
    description: 'Los vehículos nuevos más accesibles del mercado.',
  },
  {
    id: 'autonomia',
    label: 'Mayor Autonomía EV',
    icon: Battery100Icon,
    description: 'Los eléctricos con mayor autonomía por carga.',
  },
  {
    id: 'nuevos',
    label: 'Los Más Nuevos',
    icon: SparklesIcon,
    description: 'Los modelos más recientes del año 2026.',
  },
];

function safetyScore(c: Car): number {
  const stars = c.latin_ncap_stars ?? c.safety_ratings?.find(r => r.program === 'Latin NCAP')?.stars ?? 0;
  const adasCount = c.adas?.length ?? 0;
  return (c.airbags ?? 0) + stars * 3 + adasCount;
}

function espacioScore(c: Car): number {
  return (c.seats ?? 0) + (c.trunk_liters ?? 0) / 50 + (c.length_mm ?? 0) / 200;
}

function getTopCars(category: string): Car[] {
  const data = [...carsData];

  switch (category) {
    case 'seguridad': {
      return [...data]
        .sort((a, b) => safetyScore(b) - safetyScore(a))
        .slice(0, 10);
    }
    case 'espacio':
      return data
        .filter(c => (c.trunk_liters ?? 0) > 0)
        .sort((a, b) => espacioScore(b) - espacioScore(a))
        .slice(0, 10);
    case 'consumo':
      return data
        .filter(c => (c.fuel_consumption_mixed_km_l ?? 0) > 0)
        .sort((a, b) => (b.fuel_consumption_mixed_km_l ?? 0) - (a.fuel_consumption_mixed_km_l ?? 0))
        .slice(0, 10);
    case 'potencia':
      return data
        .filter(c => (c.hp ?? 0) > 0)
        .sort((a, b) => (b.hp ?? 0) - (a.hp ?? 0))
        .slice(0, 10);
    case 'economico':
      return data
        .filter(c => c.price > 0)
        .sort((a, b) => a.price - b.price)
        .slice(0, 10);
    case 'autonomia':
      return data
        .filter(c => c.fuel === 'electrico' && (c.electric_range_km ?? 0) > 0)
        .sort((a, b) => (b.electric_range_km ?? 0) - (a.electric_range_km ?? 0))
        .slice(0, 10);
    case 'nuevos':
      return data
        .filter(c => c.year >= 2026)
        .sort((a, b) => b.year - a.year || a.price - b.price)
        .slice(0, 10);
    default:
      return data.slice(0, 10);
  }
}

const categoryStats: Record<string, (car: Car) => string> = {
  seguridad: c => (c.latin_ncap_stars ? `${'★'.repeat(c.latin_ncap_stars)}` : `${c.airbags ?? 0} airbags`),
  espacio: c => `${c.trunk_liters ?? '-'} L`,
  consumo: c => `${c.fuel_consumption_mixed_km_l ?? '-'} km/L`,
  potencia: c => `${c.hp ?? '-'} HP`,
  economico: c => formatPrice(c.price),
  autonomia: c => `${c.electric_range_km ?? '-'} km`,
  nuevos: c => `${c.year}`,
};

const categoryStatLabels: Record<string, string> = {
  seguridad: 'Seguridad',
  espacio: 'Maletero',
  consumo: 'Rendimiento',
  potencia: 'Potencia',
  economico: 'Precio desde',
  autonomia: 'Autonomía',
  nuevos: 'Año',
};

export function Top10() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat') || categories[0].id;
  const validCat = categories.some(c => c.id === catParam) ? catParam : categories[0].id;
  const [activeCategory, setActiveCategory] = useState(validCat);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    setActiveCategory(validCat);
  }, [validCat]);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setSearchParams({ cat: id }, { replace: true });
  };

  const topCars = useMemo(() => getTopCars(activeCategory), [activeCategory]);
  const currentCategory = categories.find(c => c.id === activeCategory)!;

  return (
    <>
      <SEO
        title={`Top 10 - ${currentCategory.label}`}
        description={currentCategory.description}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Top 10', href: '/top10' },
            { label: currentCategory.label },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Top 10</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Descubre los mejores vehículos en cada categoría según datos del mercado chileno.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <cat.icon className="w-5 h-5 inline" /> {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <currentCategory.icon className="w-5 h-5 inline" /> {currentCategory.label}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentCategory.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topCars.map((car, index) => (
            <div key={car.id} className="relative">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                {index + 1}
              </div>
              <CarCard
                car={car}
                isFavorite={false}
                isComparing={false}
                onToggleFavorite={() => {}}
                onAddToCompare={() => {}}
                onRemoveFromCompare={() => {}}
                onClick={setSelectedCar}
              />
              <div className="mt-2 px-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{categoryStatLabels[activeCategory]}: </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{categoryStats[activeCategory](car)}</span>
              </div>
            </div>
          ))}
        </div>

        {topCars.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay suficientes datos para esta categoría.</p>
          </div>
        )}

        <p className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-400">
          Precios y datos del catálogo de AutoLupa (auditoría de datos de septiembre de 2026): son referencias de catálogo, no ofertas. Confirma el precio vigente con el fabricante o el concesionario.
        </p>

        {selectedCar && (
          <CarDetail
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
            isFavorite={false}
            onToggleFavorite={() => {}}
          />
        )}
      </div>
    </>
  );
}

export default Top10;
