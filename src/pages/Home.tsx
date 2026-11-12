import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Car } from '../types';
import { FilterPanel } from '../components/Filters/FilterPanel';
import { CarGrid } from '../components/Cars/CarGrid';
import { CarRail } from '../components/Cars/CarRail';
import { CarDetail } from '../components/Cars/CarDetail';
import { CreditCalc } from '../components/Calculator/CreditCalc';
import { AutoWizard } from '../components/Wizard/AutoWizard';
import { SmartAsk } from '../components/Wizard/SmartAsk';
import { RecentUsedListings } from '../components/Used/RecentUsedListings';
import { BrandGrid } from '../components/Brands/BrandGrid';
import { HomeSearch } from '../components/Home/HomeSearch';
import { carsData } from '../data/brands';
import { carPath } from '../lib/carSlug';
import { defaultYearRange } from '../hooks/useCars';
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
  const [showCatalog, setShowCatalog] = useState(location.pathname === '/autos');
  useEffect(() => {
    if (!legacyId) return;
    const car = carsData.find(c => c.id === Number(legacyId));
    if (car) navigate(carPath(car), { replace: true });
  }, [legacyId, navigate]);

  useEffect(() => {
    setShowCatalog(location.pathname === '/autos');
  }, [location.pathname]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, [setSearchQuery, setCurrentPage]);

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
        <HomeSearch
          filters={filters}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          allCarsCount={allCarsCount}
          onAsk={(query) => { setAskQuery(query); setShowAsk(true); }}
          onOpenWizard={() => setShowWizard(true)}
        />
      )}

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
        <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin">
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

      {!isCatalogPage && !isFiltering && (
        <div className="mt-12">
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

      {!isCatalogPage && <BrandGrid />}

      {!isCatalogPage && <RecentUsedListings />}

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