import { memo } from 'react';
import { Car } from '../../types';
import { formatPrice, getTypeLabel, getFuelLabel, isBrandSoldNewInChile } from '../../data/brands';
import { CarImage } from './CarImage';
import { TermTip } from '../Glossary/TermTip';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev';

interface Props {
  car: Car;
  isFavorite: boolean;
  isComparing: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCompare: (car: Car) => void;
  onRemoveFromCompare: (id: number) => void;
  onClick?: (car: Car) => void;
}

const fuelColors: Record<string, string> = {
  gasolina: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  diesel: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  electrico: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  hibrido: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  hibrido_enchufable: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
};

export const CarCard = memo(function CarCard({
  car,
  isFavorite,
  isComparing,
  onToggleFavorite,
  onAddToCompare,
  onRemoveFromCompare,
  onClick,
}: Props) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => onClick?.(car)}
    >
      <div className="relative h-48 overflow-hidden">
        <CarImage
          carId={car.id}
          brand={car.brand}
          model={car.model}
          type={car.type}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(car.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-md"
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-400'}`}
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isComparing) {
              onRemoveFromCompare(car.id);
            } else {
              onAddToCompare(car);
            }
          }}
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm transition-all shadow-md ${
            isComparing
              ? 'bg-blue-600 text-white'
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {isComparing ? '✓ Comparando' : '+ Comparar'}
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1.5">
              <a href={`/marca/${car.brand.toLowerCase().replace(/\s+/g, '-')}`} onClick={(e) => e.stopPropagation()} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">{car.brand}</a>
              {!isBrandSoldNewInChile(car.brand) && (
                <span
                  title="No se vende oficialmente como auto nuevo en Chile"
                  className="normal-case font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded"
                >
                  no en Chile
                </span>
              )}
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">{car.model}</h3>
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">{car.year}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
            {getTypeLabel(car.type)}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${fuelColors[car.fuel] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <TermTip term={car.fuel}>{getFuelLabel(car.fuel)}</TermTip>
          </span>
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
            {car.seats} plazas
          </span>
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
            <TermTip term={car.transmission === 'automatica' ? 'automatica' : 'manual'}>
              {car.transmission === 'automatica' ? 'Automática' : 'Manual'}
            </TermTip>
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">{car.description}</p>

        <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Precio desde</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(car.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{car.origin}</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Mira el ${car.brand} ${car.model} ${car.year} (${formatPrice(car.price)}) en AutoLupa — ${siteUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
              title="Compartir por WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});