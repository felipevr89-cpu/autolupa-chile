import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { formatPrice } from '../data/brands';
import { resendVerificationEmail, verificationErrorMessage } from '../lib/authVerification';
import { supabase } from '../lib/supabase';
import {
  toListingEditDraft,
  toUsedListingStatusLabel,
  validateListingEdit,
  USED_REGIONS,
  type ListingEditDraft,
  type UsedListing,
  type UsedListingValidationErrors,
  usedListingWhatsappUrl,
} from '../data/usedListings';
import { getMyUsedListings, markUsedListingAsSold, updateUsedListing } from '../lib/usedListings';
import type { User } from '../types';

interface Props {
  user: User | null;
  isCloudAuthAvailable: boolean;
  onSignIn: () => Promise<void>;
}

export function MisAnuncios({ user, isCloudAuthAvailable, onSignIn }: Props) {
  const [listings, setListings] = useState<UsedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionId, setActionId] = useState('');
  const [editingId, setEditingId] = useState('');

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError('');
    getMyUsedListings()
      .then(setListings)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'No pudimos cargar tus avisos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  if (!isCloudAuthAvailable) {
    return <div className="max-w-3xl mx-auto px-4 py-16"><SEO title="Mis avisos" description="Gestiona tus autos publicados en AutoLupa." noIndex /><div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-8 text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Gestión de avisos en preparación</h1><p className="text-gray-600 dark:text-gray-300">Conectaremos el marketplace con Supabase antes de habilitar cuentas de vendedores.</p></div></div>;
  }

  if (!user) {
    return <div className="max-w-2xl mx-auto px-4 py-16"><SEO title="Mis avisos" description="Gestiona tus autos publicados en AutoLupa." noIndex /><div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center card-shadow"><p className="text-5xl mb-4">🔑</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Inicia sesión para ver tus avisos</h1><button type="button" onClick={() => onSignIn().catch(() => setError('No pudimos iniciar sesión.'))} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Continuar con Google</button>{error && <p className="text-sm text-red-600 dark:text-red-400 mt-4">{error}</p>}</div></div>;
  }

  const markSold = async (listing: UsedListing) => {
    if (!window.confirm(`¿Marcar ${listing.brand} ${listing.model} como vendido?`)) return;
    setActionId(listing.id);
    setError('');
    setNotice('');
    try {
      await markUsedListingAsSold(listing.id);
      setNotice('Aviso marcado como vendido.');
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos actualizar el aviso.');
    } finally {
      setActionId('');
    }
  };

  const onEdited = () => {
    setNotice('Aviso actualizado. Vuelve a «En revisión» y se republica cuando lo aprobemos.');
    setEditingId('');
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title="Mis avisos" description="Gestiona tus autos publicados en AutoLupa." noIndex />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div><p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Hola, {user.displayName || user.email || 'vendedor'}</p><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis avisos</h1><div className="mt-3"><VerificationStatus user={user} /></div></div>
        <Link to="/publicar-auto" className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Publicar otro auto</Link>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200 mb-5">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 dark:bg-green-950/40 p-4 text-sm text-green-800 dark:text-green-200 mb-5">{notice}</p>}
      {loading ? <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}</div> : listings.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 p-10 text-center"><p className="text-5xl mb-4">🚗</p><h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Todavía no tienes avisos</h2><p className="text-gray-600 dark:text-gray-300 mb-6">Publica tu primer auto gratis y llega a compradores en todo Chile.</p><Link to="/publicar-auto" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Publicar mi auto</Link></div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Fragment key={listing.id}>
              <article className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 card-shadow flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">{listing.photoUrls[0] ? <img src={listing.photoUrls[0]} alt={`${listing.brand} ${listing.model}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>}</div>
              <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-gray-900 dark:text-white">{listing.brand} {listing.model} {listing.year}</h2><Status status={listing.status} /></div><p className="text-blue-600 dark:text-blue-400 font-bold mt-1">{formatPrice(listing.price)}</p><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listing.mileage.toLocaleString('es-CL')} km · {listing.region}</p>{listing.moderationNote && <p className="text-sm text-red-600 dark:text-red-400 mt-2">Nota: {listing.moderationNote}</p>}</div>
              <div className="flex sm:flex-col gap-2 sm:justify-center"><a href={usedListingWhatsappUrl(listing)} target="_blank" rel="noopener noreferrer" className="text-center px-3 py-2 rounded-lg border border-green-500 text-green-600 dark:text-green-400 text-sm font-semibold">WhatsApp</a>{listing.status === 'active' && <button type="button" onClick={() => markSold(listing)} disabled={actionId === listing.id} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50">Marcar vendido</button>}{canEdit(listing) && <button type="button" onClick={() => { setEditingId(editingId === listing.id ? '' : listing.id); setNotice(''); setError(''); }} className="px-3 py-2 rounded-lg border border-blue-500 text-blue-600 dark:text-blue-400 text-sm font-semibold" aria-expanded={editingId === listing.id}>{editingId === listing.id ? 'Cerrar edición' : 'Editar'}</button>}</div>
              </article>
              {editingId === listing.id && (
                <EditListingPanel listing={listing} onCancel={() => setEditingId('')} onSaved={onEdited} />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function Status({ status }: { status: UsedListing['status'] }) {
  const color = status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>{toUsedListingStatusLabel(status)}</span>;
}

function canEdit(listing: UsedListing): boolean {
  return listing.status === 'active' || listing.status === 'pending' || listing.status === 'rejected';
}

function EditListingPanel({
  listing,
  onCancel,
  onSaved,
}: {
  listing: UsedListing;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<ListingEditDraft>(() => toListingEditDraft(listing));
  const [errors, setErrors] = useState<UsedListingValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const update = <K extends keyof ListingEditDraft>(key: K, value: ListingEditDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateListingEdit(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    setSaveError('');
    try {
      await updateUsedListing(listing.id, draft);
      onSaved();
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={`Editar ${listing.brand} ${listing.model} ${listing.year}`}
      className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-4"
    >
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Editar aviso</h3>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
          Todo cambio vuelve el aviso a revisión: deja de mostrarse en los resultados hasta que lo aprobemos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Precio (CLP)" error={errors.price}>
          <input
            type="number"
            min={100000}
            max={2000000000}
            step={10000}
            value={draft.price}
            onChange={(event) => update('price', Number(event.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
        <Field label="Kilómetros" error={errors.mileage}>
          <input
            type="number"
            min={0}
            max={2000000}
            step={1000}
            value={draft.mileage}
            onChange={(event) => update('mileage', Number(event.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
        <Field label="Color" error={errors.color}>
          <input
            type="text"
            maxLength={40}
            value={draft.color}
            onChange={(event) => update('color', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
        <Field label="Región" error={errors.region}>
          <select
            value={draft.region}
            onChange={(event) => update('region', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          >
            {USED_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Comuna" error={errors.commune}>
          <input
            type="text"
            maxLength={80}
            value={draft.commune}
            onChange={(event) => update('commune', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
        <Field label="Nombre de contacto" error={errors.contactName}>
          <input
            type="text"
            maxLength={80}
            value={draft.contactName}
            onChange={(event) => update('contactName', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
      </div>

      <Field label="Descripción" error={errors.description}>
        <textarea
          rows={4}
          value={draft.description}
          onChange={(event) => update('description', event.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="WhatsApp" error={errors.contactPhone}>
          <input
            type="tel"
            value={draft.contactPhone}
            onChange={(event) => update('contactPhone', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
        <Field label="Correo (opcional)" error={errors.contactEmail}>
          <input
            type="email"
            value={draft.contactEmail}
            onChange={(event) => update('contactEmail', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          />
        </Field>
      </div>

      {saveError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{error}</span>}
    </label>
  );
}

function VerificationStatus({ user }: { user: User }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const pending = user.pendingEmail ?? (user.emailVerified ? null : user.email);

  useEffect(() => {
    const client = supabase;
    if (user.emailVerified || !client) return undefined;
    const interval = window.setInterval(() => {
      client.auth.getUser().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [user.emailVerified, user.email, user.pendingEmail]);

  if (user.emailVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-950 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
        ✓ Correo verificado
      </span>
    );
  }

  const resend = async () => {
    if (!pending) return;
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(pending);
      setMessage(`Reenviamos el enlace de confirmación a ${pending}.`);
    } catch (reason) {
      setMessage(verificationErrorMessage(reason, 'No pudimos reenviar el enlace'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-2">
      <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
        {pending ? `Verificando ${pending}` : 'Sin correo por verificar'}
      </span>
      {pending ? (
        <button
          type="button"
          onClick={resend}
          disabled={sending}
          className="px-3 py-1.5 border border-amber-400 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          {sending ? 'Enviando…' : 'Reenviar enlace'}
        </button>
      ) : (
        <Link to="/publicar-auto" className="text-xs font-semibold text-blue-600 dark:text-blue-400 underline">
          Verificar correo al publicar
        </Link>
      )}
      {message && <p role="status" className="w-full text-xs text-amber-800 dark:text-amber-200">{message}</p>}
    </div>
  );
}
