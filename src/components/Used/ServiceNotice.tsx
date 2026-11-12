import { Link } from 'react-router-dom';
import { resetBackendStatus } from '../../lib/backendStatus';

interface Props {
  context?: 'listings' | 'publish' | 'listing';
}

const COPY: Record<NonNullable<Props['context']>, { title: string; body: string }> = {
  listings: {
    title: 'Los avisos de usados no están disponibles en este momento',
    body: 'Estamos restableciendo el servicio del marketplace. Mientras tanto puedes usar el catálogo de autos nuevos, el comparador, el tasador y los simuladores.',
  },
  publish: {
    title: 'La publicación de avisos está pausada temporalmente',
    body: 'No pudimos conectar con el servicio que guarda los avisos. Vuelve a intentarlo en unos minutos; no perderás nada porque todavía no has empezado el formulario.',
  },
  listing: {
    title: 'No pudimos cargar este aviso',
    body: 'El servicio del marketplace no responde en este momento. Intenta de nuevo en unos minutos.',
  },
};

export function ServiceNotice({ context = 'listings' }: Props) {
  const copy = COPY[context];
  return (
    <div role="status" className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-6">
      <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">{copy.title}</h2>
      <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-200">{copy.body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => { resetBackendStatus(); window.location.reload(); }}
          className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700"
        >
          Reintentar
        </button>
        <Link to="/autos" className="px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-sm font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40">
          Ver autos nuevos
        </Link>
        <Link to="/tasar-auto" className="px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-sm font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40">
          Tasar mi auto
        </Link>
      </div>
    </div>
  );
}
