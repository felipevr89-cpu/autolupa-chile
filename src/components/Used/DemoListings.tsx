import { Link } from 'react-router-dom';
import { formatPrice } from '../../data/brands';
import { DEMO_LISTINGS } from '../../data/demoListings';

const FUEL_LABEL: Record<string, string> = {
  bencina: 'Bencina',
  diesel: 'Diésel',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
};

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: 'Manual',
  automatica: 'Automática',
};

export function DemoListings({ reason = 'empty' }: { reason?: 'empty' | 'unavailable' }) {
  return (
    <section className="mt-8" aria-labelledby="demo-listings-title">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-5 mb-5">
        <h2 id="demo-listings-title" className="text-lg font-bold text-amber-900 dark:text-amber-100">Ejemplos de avisos</h2>
        <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
          {reason === 'unavailable'
            ? 'Mientras se restablece el servicio, estos ejemplos muestran cómo se ve un aviso; no son vehículos en venta.'
            : 'Aún no hay avisos reales publicados. Estos ejemplos muestran cómo se verá el marketplace; no son vehículos en venta.'}
        </p>
        {reason === 'empty' && (
          <Link to="/publicar-auto" className="inline-flex mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700">
            Publica tu auto gratis
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {DEMO_LISTINGS.map((listing) => (
          <article key={listing.id} className="rounded-2xl bg-white dark:bg-gray-800 p-5 card-shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Ejemplo</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{listing.brand} {listing.model}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{listing.year} · {listing.mileage.toLocaleString('es-CL')} km · {listing.region}</p>
              </div>
              <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">{listing.color}</span>
            </div>
            <p className="mt-3 text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(listing.price)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{FUEL_LABEL[listing.fuel]}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{TRANSMISSION_LABEL[listing.transmission]}</span>
            </div>
            {reason === 'empty' && (
              <Link to="/publicar-auto" className="mt-4 inline-flex w-full items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                Publica uno como este
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
