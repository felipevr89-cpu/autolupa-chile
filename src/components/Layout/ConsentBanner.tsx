import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONSENT_OPEN_EVENT, readConsent, saveConsent } from '../../lib/consent';

export function ConsentBanner() {
  const [open, setOpen] = useState(() => readConsent() === null);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? true);
  const [ads, setAds] = useState(() => readConsent()?.ads ?? false);

  useEffect(() => {
    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? true);
      setAds(current?.ads ?? false);
      setConfiguring(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const decide = (choice: { analytics: boolean; ads: boolean }) => {
    saveConsent(choice);
    setOpen(false);
    setConfiguring(false);
  };

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md z-50 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5 text-sm text-gray-700 dark:text-gray-300"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <h2 id="consent-title" className="font-bold text-gray-900 dark:text-white text-base">Tu privacidad en AutoLupa</h2>
      <p className="mt-2 leading-relaxed">
        Usamos almacenamiento esencial para que el sitio funcione (favoritos, filtros y sesión). Con tu permiso, medimos visitas de forma agregada y sin cookies, y en el futuro podremos mostrar publicidad. Más detalles en la{' '}
        <Link to="/privacidad" className="text-blue-600 dark:text-blue-400 underline">política de privacidad</Link>.
      </p>

      {configuring && (
        <fieldset className="mt-4 space-y-3">
          <legend className="sr-only">Preferencias de privacidad</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1" />
            <span><span className="font-semibold text-gray-900 dark:text-white">Esenciales</span><br />Siempre activas. Guardan tus favoritos, filtros y sesión.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1" />
            <span><span className="font-semibold text-gray-900 dark:text-white">Medición</span><br />Conteo anónimo de visitas (Plausible y contador propio, sin cookies).</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={ads} onChange={(event) => setAds(event.target.checked)} className="mt-1" />
            <span><span className="font-semibold text-gray-900 dark:text-white">Publicidad</span><br />Anuncios de terceros que pueden usar cookies para personalizarse.</span>
          </label>
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {configuring ? (
          <button type="button" onClick={() => decide({ analytics, ads })} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Guardar preferencias
          </button>
        ) : (
          <>
            <button type="button" onClick={() => decide({ analytics: true, ads: true })} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Aceptar todo
            </button>
            <button type="button" onClick={() => decide({ analytics: false, ads: false })} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-semibold text-gray-800 dark:text-gray-200">
              Solo esenciales
            </button>
            <button type="button" onClick={() => setConfiguring(true)} className="w-full text-center text-blue-600 dark:text-blue-400 underline">
              Configurar
            </button>
          </>
        )}
      </div>
    </section>
  );
}
