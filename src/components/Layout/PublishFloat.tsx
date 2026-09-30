import { Link, useLocation } from 'react-router-dom';

const HIDDEN_PATHS = ['/publicar-auto', '/mis-anuncios', '/moderacion', '/tus-datos'];

export function PublishFloat() {
  const { pathname } = useLocation();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <Link
      to="/publicar-auto"
      className="sm:hidden fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-2 px-5 py-3.5 bg-green-600 text-white rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-colors"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      📢 Publicar gratis
    </Link>
  );
}
