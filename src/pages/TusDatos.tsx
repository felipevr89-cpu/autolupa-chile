import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { deletePersonalAccount, downloadJson, exportPersonalData } from '../lib/privacy';
import type { User } from '../types';

interface Props {
  user: User | null;
  isCloudAuthAvailable: boolean;
  onSignIn: () => Promise<void>;
}

export function TusDatos({ user, isCloudAuthAvailable, onSignIn }: Props) {
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!isCloudAuthAvailable) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <SEO title="Tus datos" description="Descarga o elimina tus datos personales en AutoLupa." noIndex />
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Tus datos en preparación</h1>
          <p className="text-gray-600 dark:text-gray-300">Habilitaremos esta sección cuando el backend esté conectado.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <SEO title="Tus datos" description="Descarga o elimina tus datos personales en AutoLupa." noIndex />
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center card-shadow">
          <p className="text-5xl mb-4">🔐</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Inicia sesión para gestionar tus datos</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Los derechos de acceso, portabilidad y supresión se ejercen desde tu cuenta.</p>
          <button
            type="button"
            onClick={() => onSignIn().catch(() => setMessage({ kind: 'error', text: 'No pudimos iniciar sesión.' }))}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            Continuar con Google
          </button>
        </div>
      </div>
    );
  }

  const exportar = async () => {
    setBusy('export');
    setMessage(null);
    try {
      const data = await exportPersonalData(user.uid);
      downloadJson(data, `autolupa-datos-${new Date().toISOString().slice(0, 10)}.json`);
      setMessage({ kind: 'ok', text: 'Descargamos tus datos en un archivo JSON.' });
    } catch (reason) {
      setMessage({ kind: 'error', text: reason instanceof Error ? reason.message : 'No pudimos exportar tus datos.' });
    } finally {
      setBusy(null);
    }
  };

  const eliminar = async () => {
    setBusy('delete');
    setMessage(null);
    try {
      await deletePersonalAccount(user.uid);
      window.location.assign('/');
    } catch (reason) {
      setMessage({ kind: 'error', text: reason instanceof Error ? reason.message : 'No pudimos eliminar tu cuenta.' });
      setBusy(null);
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <SEO title="Tus datos" description="Descarga o elimina tus datos personales en AutoLupa." noIndex />
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tus datos</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Ejercemos aquí tus derechos de portabilidad y supresión (Arts. 7 y 9, Ley 21.719). También puedes pedir
          rectificación, oposición o bloqueo escribiendo a <a className="text-blue-600 dark:text-blue-400 underline" href="mailto:privacidad@autolupa.cl">privacidad@autolupa.cl</a>.
        </p>
      </div>

      {message && (
        <p
          role="alert"
          className={`rounded-xl p-4 text-sm mb-5 ${
            message.kind === 'ok'
              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-200'
          }`}
        >
          {message.text}
        </p>
      )}

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Descargar mis datos</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4">
          Recibes un archivo JSON con tu cuenta, tus avisos, tus favoritos, tus firmas y los reportes que enviaste.
          Formato electrónico estructurado y de uso común.
        </p>
        <button
          type="button"
          onClick={exportar}
          disabled={busy !== null}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {busy === 'export' ? 'Preparando…' : 'Descargar JSON'}
        </button>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-red-100 dark:border-red-950">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar mi cuenta</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4">
          Borra de forma definitiva tu cuenta, tus avisos, favoritos, preferencias, firmas y fotografías subidas.
          Si publicaste avisos, también desaparecen de la web junto con tu nombre de contacto.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Esta acción no se puede deshacer. No alcanza a copias que un comprador conservó de un aviso que ya contactó.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={busy !== null}
            className="px-5 py-3 border border-red-500 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
          >
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-3">
              ¿Seguro? Se borrará todo de forma permanente.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={eliminar}
                disabled={busy !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {busy === 'delete' ? 'Eliminando…' : 'Sí, eliminar todo'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy !== null}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        Ver también: <Link to="/privacidad" className="text-blue-600 dark:text-blue-400 underline">Política de privacidad</Link>
      </p>
    </div>
  );
}

export default TusDatos;
