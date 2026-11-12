import { Link } from 'react-router-dom';
import { Car } from '../../types';
import { CarCard } from './CarCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  cars: Car[];
  favorites: number[];
  compareList: Car[];
  onToggleFavorite: (id: number) => void;
  onAddToCompare: (car: Car) => void;
  onRemoveFromCompare: (id: number) => void;
  onCarClick?: (car: Car) => void;
}

export function CarGrid({
  cars,
  favorites,
  compareList,
  onToggleFavorite,
  onAddToCompare,
  onRemoveFromCompare,
  onCarClick,
}: Props) {
  if (cars.length === 0) {
    return (
      <div className="text-center py-16">
        <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No se encontraron resultados</h3>
        <p className="text-gray-500 dark:text-gray-400">Intenta ajustar los filtros para ver más opciones</p>
        <Link
          to="/autos"
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Ver todos los autos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          isFavorite={favorites.includes(car.id)}
          isComparing={compareList.some((c) => c.id === car.id)}
          onToggleFavorite={onToggleFavorite}
          onAddToCompare={onAddToCompare}
          onRemoveFromCompare={onRemoveFromCompare}
          onClick={onCarClick}
        />
      ))}
    </div>
  );
}
