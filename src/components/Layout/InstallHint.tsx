import { useEffect, useState } from 'react';
import { track } from '../../lib/analytics';

type InstallPromptEvent = Event & { prompt: () => Promise<void> };

const DISMISS_KEY = 'autolupa-install-hint';

function isStandalone(): boolean {
  if (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  if (/iP(hone|ad|od)/.test(ua)) return true;
  return window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
}

export function InstallHint() {
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    track('Install', { accion: 'descartar' });
    setDismissed(true);
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    track('Install', { accion: 'instalar' });
    setPromptEvent(null);
  };

  if (standalone || dismissed) return null;
  if (!ios && !promptEvent) return null;

  if (ios) {
    return (
      <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-4 mb-6" data-testid="install-hint">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Instala AutoLupa en tu iPhone</p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Toca el botón <span className="font-bold">Compartir</span> de Safari (el cuadrado con la flecha) y elige <span className="font-bold">«Añadir a pantalla de inicio»</span>.
        </p>
        <button type="button" onClick={dismiss} className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline">
          Entendido
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-4 mb-6 flex flex-wrap items-center justify-between gap-3" data-testid="install-hint">
      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Instala AutoLupa en tu dispositivo</p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={install} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Instalar
        </button>
        <button type="button" onClick={dismiss} className="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline">
          Ahora no
        </button>
      </div>
    </div>
  );
}
