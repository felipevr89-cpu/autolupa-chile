import { Link } from 'react-router-dom';
import { Car } from '../types';
import { CompareTable } from '../components/Compare/CompareTable';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEO } from '../components/SEO';

interface Props {
  compareList: Car[];
  onRemoveFromCompare: (id: number) => void;
  onClearCompare: () => void;
}

export function Compare({ compareList, onRemoveFromCompare, onClearCompare }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title="Comparar Vehículos" description="Compara hasta 3 vehículos lado a lado con todas sus especificaciones." noIndex />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Comparar Vehículos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {compareList.length} de 3 vehículos seleccionados
          </p>
        </div>
        {compareList.length > 0 && (
          <button
            onClick={onClearCompare}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
          >
            Limpiar comparación
          </button>
        )}
      </div>

      <Breadcrumbs items={[{ label: 'Comparar Vehículos' }]} />

      <CompareTable cars={compareList} onRemove={onRemoveFromCompare} />

      {compareList.length > 0 && compareList.length < 3 && (
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <span>+</span>
            Agregar más vehículos
          </Link>
        </div>
      )}
    </div>
  );
}
