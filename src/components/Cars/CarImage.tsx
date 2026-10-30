import { useState } from 'react';
import { getCarImage } from '../../data/carImages';
import { CarSilhouette } from './carSilhouettes';

const brandGradients: Record<string, string> = {
  'BMW': 'from-blue-600 to-blue-900',
  'Mercedes-Benz': 'from-slate-700 to-slate-900',
  'Audi': 'from-zinc-600 to-zinc-900',
  'Toyota': 'from-red-500 to-red-800',
  'Ford': 'from-blue-700 to-blue-950',
  'Chevrolet': 'from-amber-500 to-amber-700',
  'Hyundai': 'from-sky-600 to-sky-800',
  'Kia': 'from-red-600 to-red-900',
  'Volkswagen': 'from-blue-600 to-blue-900',
  'Nissan': 'from-red-500 to-red-800',
  'Honda': 'from-red-600 to-red-900',
  'Mazda': 'from-red-500 to-red-800',
  'Tesla': 'from-slate-700 to-slate-900',
  'Porsche': 'from-stone-700 to-stone-900',
  'BYD': 'from-sky-500 to-sky-800',
  'Renault': 'from-amber-400 to-amber-600',
  'Peugeot': 'from-blue-500 to-blue-800',
  'Citroën': 'from-red-500 to-red-700',
  'Fiat': 'from-red-500 to-red-700',
  'Jeep': 'from-green-700 to-green-900',
  'Volvo': 'from-blue-500 to-blue-800',
  'Lexus': 'from-zinc-700 to-zinc-900',
  'Subaru': 'from-blue-600 to-blue-900',
  'Suzuki': 'from-blue-500 to-blue-800',
  'Mitsubishi': 'from-red-500 to-red-800',
  'GWM': 'from-slate-700 to-slate-900',
  'MG': 'from-red-500 to-red-800',
  'Chery': 'from-sky-600 to-sky-900',
  'Changan': 'from-blue-600 to-blue-900',
  'Maserati': 'from-blue-800 to-indigo-950',
  'Ferrari': 'from-red-600 to-red-900',
  'Lamborghini': 'from-amber-400 to-amber-600',
  'Land Rover': 'from-green-700 to-green-950',
  'Jaguar': 'from-slate-700 to-slate-900',
};

const defaultGradient = 'from-slate-600 to-slate-800';

interface Props {
  carId: number;
  brand: string;
  model: string;
  type: string;
  className?: string;
  showLabel?: boolean;
  eager?: boolean;
}

export function CarImage({
  carId,
  brand,
  model,
  type,
  className = '',
  showLabel = true,
  eager = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const entry = getCarImage(carId);
  const imageUrl = entry?.file || '';
  const gradient = brandGradients[brand] || defaultGradient;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      {!imageUrl || failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 select-none">
          <CarSilhouette type={type} className="w-2/5 max-w-[140px] opacity-90 drop-shadow" />
        </div>
      ) : null}

      {imageUrl && !failed && (
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {showLabel && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pt-8 pb-3">
          <div className="text-sm font-bold text-white drop-shadow-md leading-tight">{brand}</div>
          <div className="text-xs text-white/80 drop-shadow-md leading-tight">{model}</div>
        </div>
      )}
    </div>
  );
}
