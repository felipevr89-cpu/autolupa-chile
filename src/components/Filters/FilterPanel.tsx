import { useState } from 'react';
import { Filters } from '../../types';
import { brands, carTypes, fuelTypes, transmissions, tractions, originCountries, getModelsByBrand, getTypeLabel, getFuelLabel, BRANDS_NOT_SOLD_NEW_IN_CHILE } from '../../data/brands';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { RangeSlider } from './RangeSlider';

interface Props {
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  resultCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

export function FilterPanel({ filters, updateFilter, resetFilters, resultCount, searchQuery, onSearchChange, sortBy, onSortChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 16;
  const yearOptions = Array.from({ length: currentYear - minYear + 1 }, (_, i) => minYear + i).reverse();

  const brandOptions = brands.map(b => ({
    value: b,
    label: BRANDS_NOT_SOLD_NEW_IN_CHILE.includes(b) ? `${b} (no en Chile)` : b,
  }));
  const typeOptions = carTypes.map(t => ({ value: t, label: getTypeLabel(t) }));
  const fuelOptions = fuelTypes.map(f => ({ value: f, label: getFuelLabel(f) }));
  const transmissionOptions = transmissions.map(t => ({
    value: t,
    label: t === 'automatica' ? 'Automática' : 'Manual',
  }));
  const tractionOptions = tractions.map(t => ({ value: t, label: t }));
  const seatsOptions = [
    { value: '4', label: '4 plazas' },
    { value: '5', label: '5 plazas' },
    { value: '7', label: '7 plazas' },
  ];

  const selectedBrands = filters.brand;
  const modelOptions = selectedBrands.length === 1
    ? getModelsByBrand(selectedBrands[0]).map(m => ({ value: m, label: m }))
    : [];

  const originOptions = originCountries.map(c => ({ value: c, label: c }));

  const hasActiveFilters =
    filters.brand.length > 0 ||
    filters.model.length > 0 ||
    filters.type.length > 0 ||
    filters.fuel.length > 0 ||
    filters.transmission.length > 0 ||
    filters.traction.length > 0 ||
    filters.seats.length > 0 ||
    filters.origin_country.length > 0 ||
    filters.priceRange[0] > 5000000 ||
    filters.priceRange[1] < 500000000 ||
    filters.minAirbags > 0 ||
    filters.yearRange[0] > minYear ||
    filters.yearRange[1] < currentYear;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl card-shadow overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Filtros</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{resultCount} resultado{resultCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Buscar</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Marca, modelo..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            >
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="year-desc">Más reciente</option>
              <option value="brand">Marca</option>
            </select>
          </div>

          <MultiSelectDropdown
            label="Marca"
            options={brandOptions}
            selected={filters.brand}
            onChange={(v) => {
              updateFilter('brand', v);
              updateFilter('model', []);
            }}
            placeholder="Todas las marcas"
            searchable
          />

          {modelOptions.length > 0 && (
            <MultiSelectDropdown
              label="Modelo"
              options={modelOptions}
              selected={filters.model}
              onChange={(v) => updateFilter('model', v)}
              placeholder="Todos los modelos"
              searchable
            />
          )}

          <MultiSelectDropdown
            label="Tipo de vehículo"
            options={typeOptions}
            selected={filters.type}
            onChange={(v) => updateFilter('type', v)}
            placeholder="Todos los tipos"
          />

          <MultiSelectDropdown
            label="Combustible"
            options={fuelOptions}
            selected={filters.fuel}
            onChange={(v) => updateFilter('fuel', v)}
            placeholder="Todos los combustibles"
          />

          <RangeSlider
            label="Rango de precio"
            min={5000000}
            max={500000000}
            value={filters.priceRange}
            onChange={(v) => updateFilter('priceRange', v)}
          />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Año</label>
            <div className="flex items-center gap-2">
              <select
                value={filters.yearRange[0]}
                onChange={e => updateFilter('yearRange', [Number(e.target.value), filters.yearRange[1]])}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>Desde {y}</option>
                ))}
              </select>
              <span className="text-gray-400 dark:text-gray-500">—</span>
              <select
                value={filters.yearRange[1]}
                onChange={e => updateFilter('yearRange', [filters.yearRange[0], Number(e.target.value)])}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>Hasta {y}</option>
                ))}
              </select>
            </div>
          </div>

          <MultiSelectDropdown
            label="Transmisión"
            options={transmissionOptions}
            selected={filters.transmission}
            onChange={(v) => updateFilter('transmission', v)}
            placeholder="Todas"
          />

          <MultiSelectDropdown
            label="Tracción"
            options={tractionOptions}
            selected={filters.traction}
            onChange={(v) => updateFilter('traction', v)}
            placeholder="Todas"
          />

          <MultiSelectDropdown
            label="Plazas"
            options={seatsOptions}
            selected={filters.seats.map(String)}
            onChange={(v) => updateFilter('seats', v.map(Number))}
            placeholder="Cualquier cantidad"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mín. Airbags</label>
            <select
              value={filters.minAirbags}
              onChange={(e) => updateFilter('minAirbags', Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            >
              <option value={0}>Cualquier cantidad</option>
              <option value={2}>2+ airbags</option>
              <option value={4}>4+ airbags</option>
              <option value={6}>6+ airbags</option>
              <option value={8}>8+ airbags</option>
            </select>
          </div>

          <MultiSelectDropdown
            label="País de origen"
            options={originOptions}
            selected={filters.origin_country}
            onChange={(v) => updateFilter('origin_country', v)}
            placeholder="Todos los países"
          />
        </div>
      )}
    </div>
  );
}