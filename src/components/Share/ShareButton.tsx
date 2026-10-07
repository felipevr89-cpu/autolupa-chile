import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  label?: string;
  className?: string;
}

type ShareNavigator = Navigator & { share?: (data?: ShareData) => Promise<void> };

const baseClass = 'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors';

export function ShareButton({ title, text, url, label = 'Compartir', className = '' }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const share = async () => {
    const target = url || window.location.href;
    const nav = window.navigator as ShareNavigator;

    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text, url: target });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(target);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  };

  const message = status === 'copied' ? '¡Enlace copiado!' : status === 'error' ? 'No se pudo copiar el enlace' : label;

  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className={`${baseClass}${className ? ` ${className}` : ''}`}
    >
      <span aria-hidden="true">{status === 'copied' ? '✅' : '🔗'}</span>
      {message}
    </button>
  );
}
