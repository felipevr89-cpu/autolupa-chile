import { FormEvent, useEffect, useState } from 'react';
import { submitUsedListingLead } from '../../lib/usedListings';
import { track } from '../../lib/analytics';

interface Props {
  listingId: string;
  listingTitle: string;
  sellerName: string;
  onClose: () => void;
}

export function LeadForm({ listingId, listingTitle, sellerName, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(`Hola, me interesa el ${listingTitle}. ¿Sigue disponible?`);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Completa tu nombre, correo y mensaje.');
      return;
    }
    setError('');
    setState('sending');
    await submitUsedListingLead({
      listingId,
      listingTitle,
      sellerName,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });
    track('ContactSeller', { origen: 'formulario', listingId });
    setState('sent');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="lead-title" className="text-xl font-bold text-gray-900 dark:text-white">Contactar vendedor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listingTitle} · {sellerName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">×</button>
        </div>

        {state === 'sent' ? (
          <div role="status" className="mt-5 rounded-xl bg-green-50 dark:bg-green-950/40 p-4 text-sm text-green-800 dark:text-green-200">
            Mensaje enviado. El vendedor recibirá tus datos de contacto. No transfieras dinero antes de ver el auto.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block text-sm">
              <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Nombre</span>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Correo</span>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
              </label>
              <label className="block text-sm">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">WhatsApp (opcional)</span>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="+56 9 1234 5678" />
              </label>
            </div>
            <label className="block text-sm">
              <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Mensaje</span>
              <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </label>
            {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={state === 'sending'} className="w-full px-5 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 disabled:opacity-60 transition-colors">
              {state === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tus datos se comparten solo con el vendedor para responder tu consulta. No compartas claves ni códigos.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
