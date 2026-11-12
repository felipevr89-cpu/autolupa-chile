import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AdjustmentsHorizontalIcon, ChatBubbleLeftRightIcon, ListBulletIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CarSilhouette } from '../Cars/carSilhouettes';
import { brands, carsData, catalogYears, formatPrice, getFuelLabel } from '../../data/brands';
import { CHILE_REGIONS } from '../../data/chileRegions';
import { isNaturalLanguageQuery } from '../../data/recommender';
import { defaultYearRange } from '../../hooks/useCars';
import { track } from '../../lib/analytics';
import type { Filters } from '../../types';

interface Props {
  filters: Filters;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allCarsCount: number;
  onAsk: (query: string) => void;
  onOpenWizard: () => void;
}

const MAX_PRICE = 500000000;
const BUDGETS = [10, 15, 20, 25, 30, 40, 60, 100].map(m => m * 1000000);
const TYPES: [string, string][] = [
  ['suv', 'SUV'],
  ['sedan', 'Sedán'],
  ['hatchback', 'Hatchback'],
  ['pickup', 'Pickup'],
  ['minivan', 'Minivan'],
  ['wagon', 'Station wagon'],
  ['coupe', 'Coupé'],
];
const FUELS = ['gasolina', 'diesel', 'hibrido', 'hibrido_enchufable', 'electrico'];
const SHORTCUTS: { label: string; to: string; silhouette: string }[] = [
  { label: 'SUV', to: '/autos?tipo=suv', silhouette: 'suv' },
  { label: 'Sedán', to: '/autos?tipo=sedan', silhouette: 'sedan' },
  { label: 'Hatchback', to: '/autos?tipo=hatchback', silhouette: 'hatchback' },
  { label: 'Pickup', to: '/autos?tipo=pickup', silhouette: 'pickup' },
  { label: 'Eléctricos', to: '/autos?combustible=electrico', silhouette: 'hatchback' },
  { label: 'Híbridos', to: '/autos?combustible=hibrido,hibrido_enchufable', silhouette: 'suv' },
  { label: '7 plazas', to: '/autos?asientos=7', silhouette: 'minivan' },
  { label: 'Hasta $15M', to: '/autos?precio_min=0&precio_max=15000000', silhouette: 'hatchback' },
];

const selectClass = 'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export function HomeSearch({ filters, searchQuery, onSearchChange, allCarsCount, onAsk, onOpenWizard }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'nuevos' | 'usados'>('nuevos');
  const [usedQuery, setUsedQuery] = useState('');
  const [brand, setBrand] = useState(filters.brand[0] ?? '');
  const [type, setType] = useState(filters.type[0] ?? '');
  const [fuel, setFuel] = useState(filters.fuel[0] ?? '');
  const [budget, setBudget] = useState(filters.priceRange[1] < MAX_PRICE ? String(filters.priceRange[1]) : '');
  const [year, setYear] = useState('');
  const [region, setRegion] = useState(searchParams.get('region') ?? '');

  useEffect(() => {
    setBrand(filters.brand[0] ?? '');
    setType(filters.type[0] ?? '');
    setFuel(filters.fuel[0] ?? '');
    setBudget(filters.priceRange[1] < MAX_PRICE ? String(filters.priceRange[1]) : '');
    setYear(
      filters.yearRange[0] === filters.yearRange[1] && filters.yearRange[0] !== defaultYearRange[0]
        ? String(filters.yearRange[0])
        : '',
    );
  }, [filters]);

  const isUsed = tab === 'usados';
  const hasFilters = Boolean(brand || type || fuel || budget || year);

  const matches = useMemo(() => carsData.filter(car => (
    (!brand || car.brand === brand) &&
    (!type || car.type === type) &&
    (!fuel || car.fuel === fuel) &&
    (!budget || car.price <= Number(budget)) &&
    (!year || car.year === Number(year))
  )).length, [brand, type, fuel, budget, year]);

  const clear = () => {
    setBrand('');
    setType('');
    setFuel('');
    setBudget('');
    setYear('');
    setRegion('');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (isUsed) {
      if (usedQuery.trim()) params.set('q', usedQuery.trim());
      if (brand) params.set('brand', brand);
      if (region) params.set('region', region);
      track('search_submitted', { tab: 'usados', marca: brand || 'todas', region: region || 'todas' });
      navigate(params.toString() ? `/usados?${params.toString()}` : '/usados');
      return;
    }

    const query = searchQuery.trim();
    if (query && !hasFilters && isNaturalLanguageQuery(query)) {
      track('search_submitted', { tab: 'nuevos', modo: 'lenguaje_natural' });
      onAsk(query);
      return;
    }

    if (query) params.set('q', query);
    if (brand) params.set('marca', brand);
    if (type) params.set('tipo', type);
    if (fuel) params.set('combustible', fuel);
    if (budget) {
      params.set('precio_min', '0');
      params.set('precio_max', budget);
    }
    if (year) params.set('year', year);
    track('search_submitted', { tab: 'nuevos', marca: brand || 'todas', tipo: type || 'todos' });
    navigate(params.toString() ? `/autos?${params.toString()}` : '/autos');
  };

  const years = Array.from({ length: catalogYears[1] - catalogYears[0] + 1 }, (_, index) => catalogYears[1] - index);

  return (
    <>
      <section className="-mx-4 sm:mx-0 -mt-8 sm:mt-0 mb-6 sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 px-4 sm:px-8 pt-8 pb-6 sm:py-10 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Encuentra tu <span className="text-sky-300">auto ideal</span>
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-blue-100">
            {carsData.length} autos nuevos de {brands.length} marcas con precios de referencia en Chile. Usados sin comisión y sin letra chica.
          </p>
        </div>

        <form onSubmit={submit} className="max-w-5xl mx-auto mt-6 rounded-2xl bg-white dark:bg-gray-800 p-3 sm:p-5 shadow-2xl text-left">
          <div role="tablist" aria-label="Buscar en" className="inline-flex p-1 mb-3 rounded-xl bg-gray-100 dark:bg-gray-900">
            {([['nuevos', 'Autos nuevos'], ['usados', 'Autos usados']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === key ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              value={isUsed ? usedQuery : searchQuery}
              onChange={(event) => (isUsed ? setUsedQuery(event.target.value) : onSearchChange(event.target.value))}
              onFocus={() => track('search_initiated', { tab })}
              aria-label={isUsed ? 'Buscar autos usados' : 'Buscar autos nuevos'}
              placeholder={isUsed ? 'Ej: Toyota Corolla 2019 automático' : 'Marca, modelo o «SUV híbrido 7 plazas bajo $30M»'}
              className="w-full pl-12 pr-28 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Buscar
            </button>
          </div>

          <div className={`mt-3 grid grid-cols-2 gap-2 ${isUsed ? 'sm:grid-cols-2' : 'sm:grid-cols-3 lg:grid-cols-5'}`}>
            <select value={brand} onChange={(event) => setBrand(event.target.value)} aria-label="Marca" className={selectClass}>
              <option value="">Todas las marcas</option>
              {brands.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            {isUsed ? (
              <select value={region} onChange={(event) => setRegion(event.target.value)} aria-label="Región" className={selectClass}>
                <option value="">Todo Chile</option>
                {CHILE_REGIONS.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}
              </select>
            ) : (
              <>
                <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Tipo de vehículo" className={selectClass}>
                  <option value="">Cualquier tipo</option>
                  {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select value={fuel} onChange={(event) => setFuel(event.target.value)} aria-label="Combustible" className={selectClass}>
                  <option value="">Cualquier combustible</option>
                  {FUELS.map((value) => <option key={value} value={value}>{getFuelLabel(value)}</option>)}
                </select>
                <select value={budget} onChange={(event) => setBudget(event.target.value)} aria-label="Presupuesto máximo" className={selectClass}>
                  <option value="">Sin tope de precio</option>
                  {BUDGETS.map((value) => <option key={value} value={value}>Hasta {formatPrice(value)}</option>)}
                </select>
                <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Año" className={`${selectClass} col-span-2 sm:col-span-1`}>
                  <option value="">Cualquier año</option>
                  {years.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-300" aria-live="polite">
              {isUsed
                ? 'Avisos con contacto directo con el vendedor.'
                : hasFilters
                  ? <><strong className="text-gray-900 dark:text-white">{matches}</strong> {matches === 1 ? 'auto coincide' : 'autos coinciden'} con tus filtros</>
                  : <>Compara {allCarsCount} fichas de catálogo. Búsqueda local y gratuita.</>}
            </p>
            <div className="flex items-center gap-4">
              {(hasFilters || (isUsed && region)) && (
                <button type="button" onClick={clear} className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                  Limpiar
                </button>
              )}
              <Link to={isUsed ? '/usados' : '/autos'} className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                <AdjustmentsHorizontalIcon className="w-4 h-4" aria-hidden="true" />
                {isUsed ? 'Ver todos los usados' : 'Todos los filtros'}
              </Link>
            </div>
          </div>
        </form>

        <nav aria-label="Búsquedas rápidas" className="max-w-6xl mx-auto mt-5 flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap sm:justify-center">
          {SHORTCUTS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-medium text-white transition-colors"
            >
              <CarSilhouette type={item.silhouette} className="w-7 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <button
          type="button"
          onClick={() => onAsk('')}
          className="text-left flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
        >
          <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold text-gray-900 dark:text-white">Pregunta con tus palabras</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400">«Algo parecido al RAV4 pero más barato»</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenWizard}
          className="text-left flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
        >
          <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ListBulletIcon className="w-6 h-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold text-gray-900 dark:text-white">Responde 8 preguntas</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400">Te mostramos los autos más afines a tu uso</span>
          </span>
        </button>
      </div>
    </>
  );
}
