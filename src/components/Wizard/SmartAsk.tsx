import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Car } from '../../types';
import { recommend, RecommendResult, QueryIntent } from '../../data/recommender';
import { formatPrice, getTypeLabel, getFuelLabel } from '../../data/brands';
import { recordGap } from '../../lib/gaps';
import { CarImage } from '../Cars/CarImage';

interface Props {
  initialQuery?: string;
  onClose: () => void;
  onSelectCar: (car: Car, resultCars: Car[]) => void;
  onAddToCompare?: (car: Car) => void;
  compareList?: Car[];
}

const EXAMPLES = [
  'SUV familiar 7 asientos hasta 25 millones',
  'Eléctrico con más de 400 km de autonomía',
  'Algo parecido al RAV4 pero más barato',
  'Camioneta 4x4 diésel bajo 30 palos',
  'Híbrido que no sea chino',
  'Mazda CX-5 vs Hyundai Tucson',
];

const FALLBACK_SUGGESTIONS = [
  'Toyota Corolla',
  'Suzuki Swift',
  'Hyundai Tucson',
  'Ford Ranger',
  'Kia Sportage',
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
  compact: 'Fácil de estacionar',
};

function intentChips(intent: QueryIntent): string[] {
  const chips: string[] = [];
  if (intent.budget && !intent.cheaperThanRef) {
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
  if (intent.minRangeKm) chips.push(`Autonomía ${intent.minRangeKm}+ km`);
  if (intent.minHp) chips.push(`${intent.minHp}+ HP`);
  if (intent.minBatteryKwh) chips.push(`Batería ${intent.minBatteryKwh}+ kWh`);
  if (intent.minTrunkLiters) chips.push(`Maletero ${intent.minTrunkLiters}+ L`);
  if (intent.minKmL) chips.push(`${intent.minKmL}+ km/L`);
  if (intent.includeOrigins?.length) chips.push(`Origen: ${[...new Set(intent.includeOrigins.map(o => (o === 'USA' ? 'Estados Unidos' : o)))].slice(0, 2).join(', ')}${intent.includeOrigins.length > 2 ? '…' : ''}`);
  if (intent.excludeOrigins?.length) chips.push(`Sin origen ${[...new Set(intent.excludeOrigins.map(o => (o === 'USA' ? 'Estados Unidos' : o)))].slice(0, 2).join(', ')}${intent.excludeOrigins.length > 2 ? '…' : ''}`);
  for (const f of intent.excludeFuels ?? []) chips.push(`Sin ${getFuelLabel(f).toLowerCase()}`);
  for (const b of intent.excludeBrands ?? []) chips.push(`Sin ${b}`);
  for (const b of intent.excludeBodies ?? []) chips.push(`Sin ${getTypeLabel(b)}`);
  if (intent.mode === 'compare') chips.push('Comparación');
  if (intent.mode === 'similar') chips.push(intent.cheaperThanRef ? 'Alternativas más baratas' : 'Alternativas similares');
  if (intent.mode === 'model') for (const m of intent.models ?? []) chips.push(m.replace('|', ' '));
  return chips;
}

export function SmartAsk({ initialQuery = '', onClose, onSelectCar, onAddToCompare, compareList }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<RecommendResult | null>(() => (initialQuery.trim() ? recommend(initialQuery) : null));
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const ask = (text: string) => {
    const r = recommend(text);
    if (r.unclear || r.list.length === 0) recordGap(text);
    setResult(r);
    setShowAll(false);
  };

  useEffect(() => {
    if (!initialQuery.trim()) inputRef.current?.focus();
  }, [initialQuery]);

  const chips = result ? intentChips(result.intent) : [];
  const matches = result ? result.list.filter(r => r.role === 'match') : [];
  const usedQuery = result?.intent.used
    ? [...(result.intent.brands ?? []), ...(result.intent.models ?? []).map(m => m.split('|')[1])].join(' ')
    : '';
  const compareMatches = () => {
    for (const r of matches.slice(0, 3)) {
      if (!compareList?.some(c => c.id === r.car.id)) onAddToCompare?.(r.car);
    }
    onClose();
    navigate('/compare');
  };
  const list = result ? (showAll ? result.list : result.list.slice(0, 10)) : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: SUV híbrida de menos de 25 millones"
              aria-label="Describe el auto que buscas"
              className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="flex-shrink-0 px-4 sm:px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">Ningún auto del catálogo coincide con lo que buscas. Quizás buscabas:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {FALLBACK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => { setQuery(suggestion); ask(suggestion); }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result?.intent.used && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-sm text-amber-900 dark:text-amber-200">
              <p className="font-semibold">¿Buscas un auto usado?</p>
              <p className="mt-1">Estas recomendaciones son del catálogo de autos nuevos. Los avisos de usados están en el marketplace.</p>
              <Link
                to={usedQuery ? `/usados?q=${encodeURIComponent(usedQuery)}` : '/usados'}
                onClick={onClose}
                className="inline-block mt-2 font-semibold text-amber-800 dark:text-amber-300 hover:underline"
              >
                Ver autos usados →
              </Link>
            </div>
          )}

          {result?.intent.mode === 'compare' && matches.length >= 2 && onAddToCompare && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                Encontré {matches.slice(0, 3).map(m => `${m.car.brand} ${m.car.model}`).join(' y ')}.
              </p>
              <button
                type="button"
                onClick={compareMatches}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Compararlos lado a lado
              </button>
            </div>
          )}

          {result && !result.unclear && list.length > 0 && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {result.intent.mode === 'similar' && result.reference
                  ? `Alternativas al ${result.reference.brand} ${result.reference.model} (${formatPrice(result.reference.price)}), ordenadas por parecido`
                  : showAll ? `${result.list.length} autos ordenados por afinidad` : 'Top 10 ordenados por afinidad con tu consulta'}
              </p>
              <div className="space-y-3">
                {list.map((rec, index) => (
                  <div key={`wrap-${rec.car.id}`}>
                  {rec.role === 'alternative' && list[index - 1]?.role !== 'alternative' && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-2 mb-2">Alternativas similares</p>
                  )}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver ficha de ${rec.car.brand} ${rec.car.model}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCar(rec.car, list.map(r => r.car)); } }}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600"
                    onClick={() => onSelectCar(rec.car, list.map(r => r.car))}
                  >
                    <div className="hidden sm:flex w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full items-center justify-center font-bold flex-shrink-0 text-sm">
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
                        {rec.discontinued && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded">Fuera de parrilla 2026</span>
                        )}
                      </div>
                      {rec.reasons.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                          {rec.reasons.join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:w-auto flex sm:block items-center justify-between gap-3 sm:text-right flex-shrink-0">
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