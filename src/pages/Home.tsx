import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CpuChipIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Car } from '../types';
import { FilterPanel } from '../components/Filters/FilterPanel';
import { CarGrid } from '../components/Cars/CarGrid';
import { CarRail } from '../components/Cars/CarRail';
import { CarDetail } from '../components/Cars/CarDetail';
import { CreditCalc } from '../components/Calculator/CreditCalc';
import { AutoWizard } from '../components/Wizard/AutoWizard';
import { SmartAsk } from '../components/Wizard/SmartAsk';
import { isNaturalLanguageQuery } from '../data/recommender';
import { RecentUsedListings } from '../components/Used/RecentUsedListings';
import { BrandGrid } from '../components/Brands/BrandGrid';
import { carsData, brands, formatPrice, catalogYears } from '../data/brands';
import { CHILE_REGIONS } from '../data/chileRegions';
import { carPath } from '../lib/carSlug';
import { defaultYearRange } from '../hooks/useCars';
import { track } from '../lib/analytics';
import { Filters } from '../types';

interface Props {
  cars: Car[];
  allCarsCount: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  favorites: number[];
  compareList: Car[];
  onToggleFavorite: (id: number) => void;
  onAddToCompare: (car: Car) => void;
  onRemoveFromCompare: (id: number) => void;
  recentCars?: Car[];
  onAddRecent?: (id: number) => void;
}

/** Lanzamientos notables de 2026 (curados, no todos los autos del año) */
const NOVEDADES_2026: { brand: string; model: string }[] = [
  { brand: 'BYD', model: 'Sealion 7' },
  { brand: 'BYD', model: 'Dolphin Mini' },
  { brand: 'BYD', model: 'Shark' },
  { brand: 'BYD', model: 'Atto 8' },
  { brand: 'Chevrolet', model: 'Blazer EV' },
  { brand: 'GWM', model: 'Tank 300' },
  { brand: 'KGM', model: 'Torres EVX' },
  { brand: 'Jetour', model: 'X90 Plus' },
  { brand: 'Kia', model: 'EV6' },
  { brand: 'Zeekr', model: 'X' },
  { brand: 'Volvo', model: 'EX30' },
  { brand: 'Changan', model: 'Lumin' },
];

/** Selección corta de la portada: modelos de alta rotación en Chile */
const DESTACADOS: { brand: string; model: string }[] = [
  { brand: 'Toyota', model: 'Corolla' },
  { brand: 'Hyundai', model: 'Tucson' },
  { brand: 'Kia', model: 'Sportage' },
  { brand: 'Suzuki', model: 'Swift' },
  { brand: 'Mazda', model: 'CX-5' },
  { brand: 'Toyota', model: 'Hilux' },
];

export function Home({
  cars,
  allCarsCount,
  totalPages,
  currentPage,
  setCurrentPage,
  filters,
  updateFilter,
  resetFilters,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  favorites,
  compareList,
  onToggleFavorite,
  onAddToCompare,
  onRemoveFromCompare,
  recentCars,
  onAddRecent,
}: Props) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [askQuery, setAskQuery] = useState('');
  const [compareToast, setCompareToast] = useState(false);
  const [wizardCars, setWizardCars] = useState<Car[] | null>(null);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string> | null>(null);
  const [askCars, setAskCars] = useState<Car[] | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const legacyId = searchParams.get('id');
  const [searchTab, setSearchTab] = useState<'nuevos' | 'usados'>('nuevos');
  const [showCatalog, setShowCatalog] = useState(location.pathname === '/autos');
  const [usedQuery, setUsedQuery] = useState('');
  const currentYear = new Date().getFullYear();
  const [heroBrand, setHeroBrand] = useState(filters.brand[0] ?? '');
  const [heroPriceMin, setHeroPriceMin] = useState(filters.priceRange[0] > 0 ? String(filters.priceRange[0]) : '');
  const [heroPriceMax, setHeroPriceMax] = useState(filters.priceRange[1] < 500000000 ? String(filters.priceRange[1]) : '');
  const [heroYear, setHeroYear] = useState(
    filters.yearRange[0] === filters.yearRange[1] && filters.yearRange[0] !== defaultYearRange[0]
      ? String(filters.yearRange[0])
      : '',
  );
  const [heroType, setHeroType] = useState(
    filters.type[0] ?? (filters.fuel.includes('electrico') ? 'electrico' : ''),
  );
  const [heroRegion, setHeroRegion] = useState(searchParams.get('region') ?? '');

  useEffect(() => {
    if (!legacyId) return;
    const car = carsData.find(c => c.id === Number(legacyId));
    if (car) navigate(carPath(car), { replace: true });
  }, [legacyId, navigate]);

  useEffect(() => {
    setShowCatalog(location.pathname === '/autos');
  }, [location.pathname]);

  useEffect(() => {
    setHeroBrand(filters.brand[0] ?? '');
    setHeroPriceMin(filters.priceRange[0] > 0 ? String(filters.priceRange[0]) : '');
    setHeroPriceMax(filters.priceRange[1] < 500000000 ? String(filters.priceRange[1]) : '');
    setHeroYear(
      filters.yearRange[0] === filters.yearRange[1] && filters.yearRange[0] !== defaultYearRange[0]
        ? String(filters.yearRange[0])
        : '',
    );
    setHeroType(filters.type[0] ?? (filters.fuel.includes('electrico') ? 'electrico' : ''));
    setHeroRegion(searchParams.get('region') ?? '');
  }, [filters, searchParams]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, [setSearchQuery, setCurrentPage]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchTab === 'usados') {
      if (usedQuery.trim()) params.set('q', usedQuery.trim());
      if (heroBrand) params.set('brand', heroBrand);
      if (heroRegion) params.set('region', heroRegion);
      track('search_submitted', { tab: 'usados', marca: heroBrand || 'todas', region: heroRegion || 'todas' });
      navigate(params.toString() ? `/usados?${params.toString()}` : '/usados');
      return;
    }

    const heroFilters = heroBrand || heroPriceMin || heroPriceMax || heroYear || heroType;
    if (searchQuery.trim() && !heroFilters && isNaturalLanguageQuery(searchQuery)) {
      track('search_submitted', { tab: 'nuevos', modo: 'lenguaje_natural' });
      setAskQuery(searchQuery.trim());
      setShowAsk(true);
      return;
    }

    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (heroBrand) params.set('marca', heroBrand);
    if (heroPriceMin) params.set('precio_min', heroPriceMin);
    if (heroPriceMax) params.set('precio_max', heroPriceMax);
    if (heroYear) params.set('year', heroYear);
    if (heroType === 'electrico') params.set('combustible', 'electrico');
    else if (heroType) params.set('tipo', heroType);
    track('search_submitted', {
      tab: 'nuevos',
      marca: heroBrand || 'todas',
      tipo: heroType || 'todos',
    });
    navigate(params.toString() ? `/autos?${params.toString()}` : '/autos');
  };

  const isFiltering = useMemo(() => (
    searchQuery.trim() !== '' ||
    filters.brand.length > 0 || filters.type.length > 0 || filters.fuel.length > 0 ||
    filters.seats.length > 0 || filters.transmission.length > 0 || filters.traction.length > 0 ||
    filters.origin_country.length > 0 || filters.model.length > 0 ||
    filters.minAirbags > 0 ||
    filters.priceRange[0] > 0 || filters.priceRange[1] < 500000000 ||
    filters.yearRange[0] > defaultYearRange[0] || filters.yearRange[1] < defaultYearRange[1]
  ), [searchQuery, filters]);

  const rails = useMemo(() => {
    const nuevos = NOVEDADES_2026
      .map(({ brand, model }) => carsData
        .filter(c => c.brand === brand && c.model === model)
        .sort((a, b) => b.year - a.year)[0])
      .filter((c): c is Car => !!c);
    return { nuevos };
  }, []);

  const destacados = useMemo(() => DESTACADOS
    .map(({ brand, model }) => carsData
      .filter(c => c.brand === brand && c.model === model)
      .sort((a, b) => b.year - a.year)[0])
    .filter((c): c is Car => !!c), []);

  const catalogOpen = showCatalog || isFiltering;
  const isCatalogPage = location.pathname === '/autos';
  const CatalogHeading = isCatalogPage ? 'h1' : 'h2';

  const openCar = useCallback((car: Car) => {
    setSelectedCar(car);
    setWizardCars(null);
    setAskCars(null);
    onAddRecent?.(car.id);
  }, [onAddRecent]);

  const handleAddToCompare = useCallback((car: Car) => {
    if (compareList.length >= 3) {
      setCompareToast(true);
      setTimeout(() => setCompareToast(false), 3000);
      return;
    }
    onAddToCompare(car);
  }, [compareList.length, onAddToCompare]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedCar && askCars) {
        setSelectedCar(null);
        setShowAsk(true);
      } else if (selectedCar && wizardCars) {
        setSelectedCar(null);
        setShowWizard(true);
      } else if (showWizard) {
        setShowWizard(false);
        setWizardAnswers(null);
      } else if (showAsk) {
        setShowAsk(false);
      } else if (selectedCar) {
        setSelectedCar(null);
      }
    }
  }, [showWizard, showAsk, selectedCar, wizardCars, askCars]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    const hasModal = showWizard || showAsk || selectedCar;
    document.body.style.overflow = hasModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showWizard, showAsk, selectedCar]);

  const visibleRange = `${(currentPage - 1) * 15 + 1}-${Math.min(currentPage * 15, allCarsCount)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!isCatalogPage && (
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          Encuentra tu <span className="text-blue-600 dark:text-blue-400">auto ideal</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Compara {carsData.length} autos nuevos con precios de referencia en Chile, revisa usados y publica el tuyo sin comisión. <span className="font-semibold text-blue-700 dark:text-blue-300">Sin letra chica.</span>
        </p>

        <form onSubmit={submitSearch} className="max-w-4xl mx-auto mb-5 text-left">
          <div role="tablist" aria-label="Buscar en" className="flex justify-center gap-2 mb-3">
            {([['nuevos', 'Autos nuevos'], ['usados', 'Autos usados']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={searchTab === key}
                onClick={() => setSearchTab(key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${searchTab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              value={searchTab === 'nuevos' ? searchQuery : usedQuery}
              onChange={(event) => (searchTab === 'nuevos' ? handleSearchChange(event.target.value) : setUsedQuery(event.target.value))}
              onFocus={() => track('search_initiated', { tab: searchTab })}
              aria-label={searchTab === 'nuevos' ? 'Buscar autos nuevos' : 'Buscar autos usados'}
              placeholder={searchTab === 'nuevos'
                ? 'Ej: SUV híbrido 7 plazas bajo $30M o Toyota Corolla 2023'
                : 'Ej: Toyota Corolla 2019, automático, menos de 80.000 km'}
              className="w-full px-4 py-4 pr-28 border-2 border-blue-200 dark:border-blue-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Buscar
            </button>
          </div>

          <div className={`mt-3 grid grid-cols-2 sm:grid-cols-3 ${searchTab === 'usados' ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-2`}>
            <select value={heroBrand} onChange={(event) => setHeroBrand(event.target.value)} aria-label="Marca" className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
              <option value="">Marca</option>
              {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
            <input type="number" inputMode="numeric" value={heroPriceMin} onChange={(event) => setHeroPriceMin(event.target.value)} placeholder="Precio mín." aria-label="Precio mínimo" className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300" />
            <input type="number" inputMode="numeric" value={heroPriceMax} onChange={(event) => setHeroPriceMax(event.target.value)} placeholder="Precio máx." aria-label="Precio máximo" className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300" />
            <select value={heroYear} onChange={(event) => setHeroYear(event.target.value)} aria-label="Año" className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
              <option value="">Año</option>
              {(searchTab === 'nuevos'
                ? Array.from({ length: catalogYears[1] - catalogYears[0] + 1 }, (_, index) => catalogYears[1] - index)
                : Array.from({ length: 15 }, (_, index) => currentYear - index)
              ).map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
            <select value={heroType} onChange={(event) => setHeroType(event.target.value)} aria-label="Tipo de vehículo" className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
              <option value="">Tipo</option>
              <option value="suv">SUV</option>
              <option value="sedan">Sedán</option>
              <option value="pickup">Pickup</option>
              <option value="hatchback">Hatchback</option>
              <option value="electrico">Eléctrico</option>
            </select>
            {searchTab === 'usados' && (
              <select value={heroRegion} onChange={(event) => setHeroRegion(event.target.value)} aria-label="Región" className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                <option value="">Región</option>
                {CHILE_REGIONS.map((region) => <option key={region.slug} value={region.name}>{region.name}</option>)}
              </select>
            )}
          </div>

          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            <Link to="/autos" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Ver catálogo completo ({allCarsCount} vehículos)
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compara {allCarsCount} fichas de catálogo. Búsqueda local y gratuita.</p>
          </div>
        </form>

        {(heroBrand || heroPriceMin || heroPriceMax || heroYear || heroType || (searchTab === 'usados' && heroRegion)) && (
          <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Filtros:</span>
            {heroBrand && <button type="button" onClick={() => setHeroBrand('')} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40">{heroBrand} ×</button>}
            {(heroPriceMin || heroPriceMax) && (
              <button type="button" onClick={() => { setHeroPriceMin(''); setHeroPriceMax(''); }} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40">
                {heroPriceMin ? formatPrice(Number(heroPriceMin)) : 'Desde $0'} – {heroPriceMax ? formatPrice(Number(heroPriceMax)) : 'Sin tope'} ×
              </button>
            )}
            {heroYear && <button type="button" onClick={() => setHeroYear('')} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40">{heroYear} ×</button>}
            {heroType && <button type="button" onClick={() => setHeroType('')} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40">{heroType === 'electrico' ? 'Eléctrico' : heroType.toUpperCase()} ×</button>}
            {searchTab === 'usados' && heroRegion && <button type="button" onClick={() => setHeroRegion('')} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40">{heroRegion} ×</button>}
          </div>
        )}

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <button
            type="button"
            onClick={() => { setAskQuery(''); setShowAsk(true); }}
            className="group text-left flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <SparklesIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <span>
              <span className="block font-bold">Pregunta con tus palabras</span>
              <span className="block text-sm text-white/85">«Algo parecido al RAV4 pero más barato», «eléctrico con 400 km de autonomía»…</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="group text-left flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
          >
            <CpuChipIcon className="w-6 h-6 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              <span className="block font-bold text-gray-900 dark:text-white">Responde 8 preguntas</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Presupuesto, uso, combustible y plazas: te mostramos los autos más afines.</span>
            </span>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Recomendaciones 100% locales: tu consulta no sale del dispositivo.</p>
        <p className="mt-4 text-sm">
          <Link to="/usados" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">¿Buscas un usado?</Link>
          <span className="text-gray-400 mx-2">·</span>
          <Link to="/publicar-auto" className="font-semibold text-green-700 dark:text-green-400 hover:underline">Publica tu auto gratis →</Link>
        </p>
      </div>
      )}

      {!isCatalogPage && <BrandGrid />}

      {!isCatalogPage && <RecentUsedListings />}

      {compareList.length > 0 && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            <strong>{compareList.length}</strong> vehículo{compareList.length !== 1 ? 's' : ''} seleccionado{compareList.length !== 1 ? 's' : ''} para comparar
          </span>
          <Link
            to="/compare"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Comparar ahora →
          </Link>
        </div>
      )}

      {compareToast && (
        <div className="fixed bottom-4 right-4 bg-red-600 dark:bg-red-800 text-white px-4 py-3 rounded-xl shadow-lg z-50 text-sm font-medium">
          Solo puedes comparar hasta 3 vehículos
        </div>
      )}

      {!isCatalogPage && !isFiltering && (
        <div className="mb-10">
          {recentCars && recentCars.length > 0 && (
            <CarRail
              title="Vistos recientemente"
              icon={<ClockIcon className="w-6 h-6" />}
              cars={recentCars}
              favorites={favorites}
              compareList={compareList}
              onToggleFavorite={onToggleFavorite}
              onAddToCompare={handleAddToCompare}
              onRemoveFromCompare={onRemoveFromCompare}
              onCarClick={openCar}
            />
          )}
          <CarRail
            title="Novedades 2026"
            icon={<SparklesIcon className="w-6 h-6" />}
            subtitle="Los lanzamientos más destacados del año"
            cars={rails.nuevos}
            favorites={favorites}
            compareList={compareList}
            onToggleFavorite={onToggleFavorite}
            onAddToCompare={handleAddToCompare}
            onRemoveFromCompare={onRemoveFromCompare}
            onCarClick={openCar}
          />
        </div>
      )}

      <div id="catalogo" className="scroll-mt-20">
        <CatalogHeading className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {isCatalogPage ? 'Catálogo de autos nuevos' : catalogOpen ? 'Explorar todo el catálogo' : 'Autos destacados'}
        </CatalogHeading>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {catalogOpen
            ? `Filtra y ordena entre ${carsData.length} vehículos`
            : `Una selección de los ${carsData.length} vehículos disponibles`}
        </p>
      </div>

      {isCatalogPage && (
        <div className="mb-6 max-w-2xl">
          <label htmlFor="catalog-search" className="sr-only">Buscar autos nuevos</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Busca por marca, modelo o versión"
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-base text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Búsqueda local, sin registro y sin costo.</p>
        </div>
      )}

      {!catalogOpen && (
        <>
          <CarGrid
            cars={destacados}
            favorites={favorites}
            compareList={compareList}
            onToggleFavorite={onToggleFavorite}
            onAddToCompare={handleAddToCompare}
            onRemoveFromCompare={onRemoveFromCompare}
            onCarClick={openCar}
          />
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowCatalog(true)}
              className="px-7 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Ver catálogo completo ({allCarsCount} vehículos)
            </button>
          </div>
        </>
      )}

      {catalogOpen && (
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 flex-shrink-0">
          <FilterPanel
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            resultCount={allCarsCount}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            hideSearch={isCatalogPage}
          />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {allCarsCount === 0 ? 'Sin resultados para estos filtros' : `Mostrando ${visibleRange} de ${allCarsCount} vehículos`}
            </p>
          </div>

          <CarGrid
            cars={cars}
            favorites={favorites}
            compareList={compareList}
            onToggleFavorite={onToggleFavorite}
            onAddToCompare={handleAddToCompare}
            onRemoveFromCompare={onRemoveFromCompare}
            onCarClick={openCar}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {selectedCar && (
        <CarDetail
          car={selectedCar}
          onClose={() => {
            setSelectedCar(null);
            if (wizardCars) {
              setShowWizard(true);
            } else {
              setWizardAnswers(null);
            }
          }}
          isFavorite={favorites.includes(selectedCar.id)}
          onToggleFavorite={onToggleFavorite}
          onPrevCar={() => {
            const list = wizardCars ?? cars;
            const idx = list.findIndex(c => c.id === selectedCar.id);
            if (idx > 0) {
              setSelectedCar(list[idx - 1]);
              onAddRecent?.(list[idx - 1].id);
            }
          }}
          onNextCar={() => {
            const list = wizardCars ?? cars;
            const idx = list.findIndex(c => c.id === selectedCar.id);
            if (idx < list.length - 1) {
              setSelectedCar(list[idx + 1]);
              onAddRecent?.(list[idx + 1].id);
            }
          }}
        >
          <CreditCalc car={selectedCar} />
        </CarDetail>
      )}

      {showWizard && (
        <AutoWizard
          onClose={() => { setShowWizard(false); setWizardAnswers(null); setWizardCars(null); }}
          onSelectCar={(car, wCars, answers) => {
            setSelectedCar(car);
            setWizardCars(wCars);
            setWizardAnswers(answers);
            setAskCars(null);
            setShowWizard(false);
            onAddRecent?.(car.id);
          }}
          onAddToCompare={handleAddToCompare}
          compareList={compareList}
          initialAnswers={wizardAnswers ?? undefined}
          initialShowResults={!!wizardAnswers}
        />
      )}

      {showAsk && (
        <SmartAsk
          initialQuery={askQuery}
          onClose={() => setShowAsk(false)}
          onSelectCar={(car, resultCars) => {
            setSelectedCar(car);
            setAskCars(resultCars);
            setShowAsk(false);
            onAddRecent?.(car.id);
          }}
          onAddToCompare={handleAddToCompare}
          compareList={compareList}
        />
      )}
    </div>
  );
}