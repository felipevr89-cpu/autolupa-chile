import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { brands, carsData } from '../../data/brands';
import { brandSlug } from '../../lib/brandSlug';

const TOP_BRANDS = [
  'Toyota',
  'Suzuki',
  'Hyundai',
  'Kia',
  'Chevrolet',
  'Ford',
  'GWM',
  'Changan',
  'Peugeot',
  'MG',
  'Mitsubishi',
  'Mazda',
  'Chery',
  'Jetour',
  'Maxus',
  'Foton',
  'Volkswagen',
  'Subaru',
  'JAC',
  'Omoda',
  'Geely',
  'Citroën',
  'RAM',
  'Tesla',
  'BYD',
  'Nissan',
  'Honda',
  'Renault',
  'Jeep',
  'Fiat',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Lexus',
];

const COLLAPSED = 16;

export function BrandGrid() {
  const [expanded, setExpanded] = useState(false);
  const ordered = useMemo(() => {
    const top = TOP_BRANDS.filter(brand => brands.includes(brand));
    const rest = brands.filter(brand => !TOP_BRANDS.includes(brand)).sort((a, b) => a.localeCompare(b, 'es'));
    return [...top, ...rest];
  }, []);

  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const car of carsData) result.set(car.brand, (result.get(car.brand) ?? 0) + 1);
    return result;
  }, []);

  return (
    <section className="mb-10" aria-labelledby="brand-grid-title">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 id="brand-grid-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100">Explora por marca</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ordenadas por ventas en Chile (ANAC, enero–octubre 2026).</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{ordered.length} marcas</span>
      </div>

      <div id="brand-grid-list" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {(expanded ? ordered : ordered.slice(0, COLLAPSED)).map((brand) => {
          const count = counts.get(brand) ?? 0;
          return (
            <Link
              key={brand}
              to={`/marcas/${brandSlug(brand)}`}
              data-brand={brand}
              className="group flex flex-col justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
            >
              <span className="block truncate text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{brand}</span>
              <span className="block text-[10px] text-gray-400 dark:text-gray-500">{count > 0 ? `${count} modelo${count === 1 ? '' : 's'}` : 'Próximamente'}</span>
            </Link>
          );
        })}
      </div>
      {ordered.length > COLLAPSED && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            aria-controls="brand-grid-list"
            className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {expanded ? 'Mostrar menos marcas' : `Ver las ${ordered.length} marcas`}
          </button>
        </div>
      )}
    </section>
  );
}
