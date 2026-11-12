import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '../../types';
import { readAlertCount } from '../../lib/savedSearches';
import { useBackendStatus } from '../../lib/backendStatus';
import {
  ShieldCheckIcon,
  CubeIcon,
  FireIcon,
  BoltIcon,
  BanknotesIcon,
  Battery100Icon,
  SparklesIcon,
  ScaleIcon,
  CalculatorIcon,
  BookOpenIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Props {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isCloudAuthAvailable: boolean;
}

export function Navbar({ user, signInWithGoogle, signOut, isCloudAuthAvailable }: Props) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchAlerts, setSearchAlerts] = useState(() => readAlertCount());

  useEffect(() => {
    setSearchAlerts(readAlertCount());
  }, [location]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileOpen);
    return () => document.body.classList.remove('menu-open');
  }, [mobileOpen]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  const isActive = (to: string) => {
    const [path, query] = to.split('?');
    if (location.pathname !== path) return false;
    if (!query) return location.search === '';
    return location.search.includes(query);
  };

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const top10Categories = [
    { id: 'seguridad', label: 'Seguridad', icon: ShieldCheckIcon },
    { id: 'espacio', label: 'Más Espaciosos', icon: CubeIcon },
    { id: 'consumo', label: 'Mejor Consumo', icon: FireIcon },
    { id: 'potencia', label: 'Mayor Potencia', icon: BoltIcon },
    { id: 'economico', label: 'Más Económicos', icon: BanknotesIcon },
    { id: 'autonomia', label: 'Mayor Autonomía EV', icon: Battery100Icon },
    { id: 'nuevos', label: 'Los Más Nuevos', icon: SparklesIcon },
  ];

  const backendStatus = useBackendStatus();
  const loginUnavailable = !isCloudAuthAvailable || backendStatus === 'down';
  const loginTitle = backendStatus === 'down' ? 'El servicio de cuentas no está disponible en este momento' : undefined;

  const navLinks = [
    { to: '/autos', label: 'Autos nuevos' },
    { to: '/usados', label: 'Usados' },
    { to: '/autos?combustible=electrico', label: 'Eléctricos' },
  ];

  const tools = [
    { to: '/compare', label: 'Comparar autos', icon: ScaleIcon },
    { to: '/tasar-auto', label: '¿Cuánto vale mi auto?', icon: CalculatorIcon },
    { to: '/blog', label: 'Guías de compra', icon: BookOpenIcon },
    { to: '/estadisticas-mercado', label: 'Estadísticas del mercado', icon: ChartBarIcon },
    { to: '/faq', label: 'Compra segura y preguntas', icon: QuestionMarkCircleIcon },
  ];

  const menus = [
    { id: 'top10', label: 'Top 10', to: '/top10', items: top10Categories.map(cat => ({ to: `/top10?cat=${cat.id}`, label: cat.label, icon: cat.icon })) },
    { id: 'tools', label: 'Herramientas', to: '/compare', items: tools },
  ];

  return (
    <nav aria-label="Principal" className="bg-slate-900/95 dark:bg-gray-950/95 backdrop-blur text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MagnifyingGlassIcon className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold">
              Auto<span className="text-sky-400">Lupa</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-white/15 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
                {link.to === '/usados' && searchAlerts > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full align-middle">
                    {searchAlerts}
                  </span>
                )}
              </Link>
            ))}

            {menus.map(menu => (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => setOpenMenu(menu.id)}
                onMouseLeave={() => setOpenMenu(null)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpenMenu(null); }}
                onKeyDown={(e) => { if (e.key === 'Escape') setOpenMenu(null); }}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === menu.id}
                  onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                  className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    menu.items.some(item => location.pathname === item.to.split('?')[0])
                      ? 'bg-white/15 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {menu.label} <span aria-hidden="true">▾</span>
                </button>
                {openMenu === menu.id && (
                  <div className="absolute top-full left-0 pt-1 w-64 z-50">
                    <div className="bg-gray-800 dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-700 dark:border-gray-600 py-2">
                      {menu.items.map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/favorites"
              aria-label="Favoritos"
              title="Favoritos"
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isActive('/favorites') ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            <button
              onClick={toggleDark}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link
              to="/publicar-auto"
              className="ml-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-500 transition-all"
            >
              Publicar gratis
            </Link>

            <div className="w-px h-6 bg-gray-700 dark:bg-gray-600 mx-2" />

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ''}
                      className="w-8 h-8 rounded-full ring-2 ring-blue-500"
                    />
                  )}
                  <span className="text-sm text-gray-300">{user.displayName ?? 'Invitado'}</span>
                </div>
                <Link to="/mis-anuncios" className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  Mi cuenta
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={loginUnavailable}
                title={loginTitle}
                className="whitespace-nowrap px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Ingresar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/publicar-auto"
            className="hidden sm:inline-flex whitespace-nowrap px-3 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-500"
          >
            Publicar gratis
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-800 dark:border-gray-700">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/publicar-auto"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-bold bg-green-600 text-white text-center hover:bg-green-500 transition-colors"
            >
              Publicar mi auto gratis
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-white/15 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
                {link.to === '/usados' && searchAlerts > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full align-middle">
                    {searchAlerts}
                  </span>
                )}
              </Link>
            ))}
            <Link
              to="/favorites"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/favorites') ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            >
              Favoritos
            </Link>
            <div className="border-t border-gray-800 dark:border-gray-700 my-1" />
            <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Top 10
            </div>
            {top10Categories.map(cat => (
              <Link
                key={cat.id}
                to={`/top10?cat=${cat.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
              >
                <cat.icon className="w-5 h-5" />
                <span>{cat.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-800 dark:border-gray-700 my-1" />
            <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Herramientas
            </div>
            {tools.map(tool => (
              <Link
                key={tool.to}
                to={tool.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
              >
                <tool.icon className="w-5 h-5" />
                <span>{tool.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-800 dark:border-gray-700 my-1" />
            <button
              onClick={toggleDark}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            <div className="border-t border-gray-800 dark:border-gray-700 my-2" />
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-sm text-gray-300">{user.displayName ?? 'Invitado'}</span>
                </div>
                <Link to="/mis-anuncios" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg">Mi cuenta</Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => { if (!loginUnavailable) { signInWithGoogle(); setMobileOpen(false); } }}
                disabled={loginUnavailable}
                title={loginTitle}
                className="w-full text-left px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {backendStatus === 'down' ? 'Ingresar (servicio no disponible)' : 'Ingresar'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
