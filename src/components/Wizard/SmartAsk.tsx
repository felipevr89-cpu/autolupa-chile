import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Car } from '../../types';
import { recommend, RecommendResult, QueryIntent } from '../../data/recommender';
import { formatPrice, getTypeLabel, getFuelLabel } from '../../data/brands';
import { CarImage } from '../Cars/CarImage';

interface Props {
  onClose: () => void;
  onSelectCar: (car: Car, resultCars: Car[]) => void;
  onAddToCompare?: (car: Car) => void;
  compareList?: Car[];
}

const EXAMPLES = [
  'SUV híbrida de menos de 25 millones',
  '7 plazas diésel para la familia',
  'Auto eléctrico económico de menos de 20 millones',
  'Pickup 4x4 diésel para trabajo',
  'Sedán automático con buena seguridad',
];

const USAGE_LABELS: Record<string, string> = {
  daily: 'Uso diario',
  family: 'Familiar',
  adventure: 'Aventura',
  highway: 'Ruta / carretera',
  work: 'Trabajo',
};

const PRIORITY_LABELS: Record<string, string> = {
  performance: 'Rendimiento',
  safety: 'Seguridad',
  space: 'Espacio',
  economy: 'Economía',
  technology: 'Tecnología',
};

function intentChips(intent: QueryIntent): string[] {
  const chips: string[] = [];
  if (intent.budget) {
    const { min, max } = intent.budget;
    if (min !== undefined && max !== undefined) chips.push(`Presupuesto: ${formatPrice(min)} - ${formatPrice(max)}`);
    else if (max !== undefined) chips.push(`Presupuesto: hasta ${formatPrice(max)}`);
    else chips.push(`Presupuesto: desde ${formatPrice(min!)}`);
  }
  if (intent.bodyType) chips.push(getTypeLabel(intent.bodyType));
  if (intent.fuel) chips.push(getFuelLabel(intent.fuel));
  if (intent.usage) chips.push(USAGE_LABELS[intent.usage]);
  if (intent.transmission) chips.push(intent.transmission === 'automatica' ? 'Automática' : 'Manual');
  if (intent.traction) chips.push(intent.traction === '4x2' ? '4x2' : '4x4/AWD');
  if (intent.minSeats) chips.push(`${intent.minSeats}+ plazas`);
  if (intent.minYear) chips.push(`Año ${intent.minYear}+`);
  for (const b of intent.brands) chips.push(b);
  for (const p of intent.priorities) chips.push(PRIORITY_LABELS[p] || p);
  return chips;
}

export function SmartAsk({ onClose, onSelectCar, onAddToCompare, compareList }: Props) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [showAll, setShowAll] = useState(false);

  const ask = (text: string) => {
    const r = recommend(text);
    setResult(r);
    setShowAll(false);
  };

  const chips = result ? intentChips(result.intent) : [];
  const list = result ? (showAll ? result.list : result.list.slice(0, 10)) : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pregunta con tus palabras</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Escribe qué buscas y te recomiendo opciones</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar buscador inteligente"
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); if (query.trim()) ask(query); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: SUV híbrida de menos de 25 millones"
              aria-label="Describe el auto que buscas"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Buscar
            </button>
          </form>

          {!result && (
            <div className="flex flex-wrap gap-2 mt-3">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setQuery(ex); ask(ex); }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {result && !result.unclear && chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-xs text-gray-400 self-center mr-1">Entendí:</span>
              {chips.map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full font-medium">{c}</span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {result && result.unclear && (
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No entendí la consulta</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Prueba mencionando presupuesto, tipo de auto, uso o combustible</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => { setQuery(ex); ask(ex); }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && !result.unclear && list.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sin resultados</h3>
              <p className="text-gray-500 dark:text-gray-400">Ningún auto del catálogo coincide con lo que buscas</p>
            </div>
          )}

          {result && !result.unclear && list.length > 0 && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {showAll ? `${result.list.length} autos ordenados por afinidad` : 'Top 10 ordenados por afinidad con tu consulta'}
              </p>
              <div className="space-y-3">
                {list.map((rec, index) => (
                  <div
                    key={rec.car.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600"
                    onClick={() => onSelectCar(rec.car, list.map(r => r.car))}
                  >
                    <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                      {index + 1}
                    </div>

                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <CarImage
                        carId={rec.car.id}
                        brand={rec.car.brand}
                        model={rec.car.model}
                        type={rec.car.type}
                        className="w-full h-full"
                        showLabel={false}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{rec.car.brand}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{rec.car.model}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">{getTypeLabel(rec.car.type)}</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded">{getFuelLabel(rec.car.fuel)}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">{rec.car.seats} plazas</span>
                      </div>
                      {rec.reasons.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 truncate">
                          {rec.reasons.join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Desde</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(rec.car.price)}</p>
                      <div
                        className="flex items-center gap-1 mt-1 justify-end group/affinity relative cursor-help"
                        title={`Afinidad ${rec.affinity}% con tu consulta.`}
                      >
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${rec.affinity >= 80 ? 'bg-green-500' : rec.affinity >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${rec.affinity}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{rec.affinity}%</span>
                      </div>
                    </div>

                    {onAddToCompare && (
                      <button
                        type="button"
                        aria-label={compareList?.some(c => c.id === rec.car.id) ? `Quitar ${rec.car.brand} ${rec.car.model} de la comparación` : `Agregar ${rec.car.brand} ${rec.car.model} a la comparación`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCompare(rec.car);
                        }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          compareList?.some(c => c.id === rec.car.id)
                            ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                            : 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        {compareList?.some(c => c.id === rec.car.id) ? '✓ Comparando' : '+ Comparar'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {result.list.length > 10 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                  <button
                    onClick={() => setShowAll(v => !v)}
                    className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    {showAll ? 'Ver solo top 10' : `Ver todos los resultados (${result.list.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Recomendación 100% local: tu consulta no sale del dispositivo.{' '}
            <Link to="/glosario" onClick={onClose} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              ¿Qué significa un término? Ver el glosario →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}