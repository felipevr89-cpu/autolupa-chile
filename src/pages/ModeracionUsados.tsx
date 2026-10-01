import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { formatPrice } from '../data/brands';
import { toUsedListingStatusLabel, type UsedListing } from '../data/usedListings';
import { getModerationQueue, getOpenListingReports, isCurrentUserModerator, moderateUsedListing, resolveListingReport } from '../lib/usedListings';
import { answerSuggestion, getOpenSuggestions, type SuggestionDraft } from '../lib/suggestions';
import type { User } from '../types';

interface Props {
  user: User | null;
  isCloudAuthAvailable: boolean;
  onSignIn: () => Promise<void>;
}

interface ReportItem {
  id: string;
  listingId: string;
  reason: string;
  createdAt: string;
  listing: UsedListing | null;
}

export function ModeracionUsados({ user, isCloudAuthAvailable, onSignIn }: Props) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [queue, setQueue] = useState<UsedListing[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionDraft[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  const load = useCallback(async () => {
    const [nextQueue, nextReports, nextSuggestions] = await Promise.all([
      getModerationQueue(),
      getOpenListingReports(),
      getOpenSuggestions().catch(() => [] as SuggestionDraft[]),
    ]);
    setQueue(nextQueue);
    setReports(nextReports);
    setSuggestions(nextSuggestions);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!isCloudAuthAvailable || !user) {
      setChecking(false);
      return;
    }
    setChecking(true);
    isCurrentUserModerator()
      .then((result) => {
        if (cancelled) return;
        setAuthorized(result);
        if (result) return load();
        return undefined;
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'No pudimos verificar el acceso.');
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCloudAuthAvailable, load, user]);

  if (!isCloudAuthAvailable || !user) {
    return <div className="max-w-3xl mx-auto px-4 py-16"><SEO title="Moderación de avisos" description="Panel privado de moderación de AutoLupa." noIndex /><div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center card-shadow"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Panel privado</h1>{isCloudAuthAvailable ? <button type="button" onClick={() => onSignIn().catch(() => setError('No pudimos iniciar sesión.'))} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Iniciar sesión</button> : <p className="text-gray-600 dark:text-gray-300">El panel se habilitará junto con el marketplace.</p>}{error && <p className="text-sm text-red-600 dark:text-red-400 mt-4">{error}</p>}</div></div>;
  }

  if (checking) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Verificando permisos…</div>;
  if (!authorized) return <div className="max-w-3xl mx-auto px-4 py-16"><SEO title="Acceso restringido" description="Panel privado de moderación de AutoLupa." noIndex /><div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-8 text-center"><p className="text-4xl mb-4">🔒</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Acceso restringido</h1><p className="text-gray-600 dark:text-gray-300">Esta cuenta no tiene permisos de moderación.</p></div></div>;

  const moderate = async (listing: UsedListing, status: 'active' | 'rejected') => {
    setActionId(listing.id);
    setError('');
    try {
      await moderateUsedListing(listing.id, status, notes[listing.id] || '');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos actualizar el aviso.');
    } finally {
      setActionId('');
    }
  };

  const resolveReport = async (reportId: string) => {
    setActionId(reportId);
    try {
      await resolveListingReport(reportId);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos resolver el reporte.');
    } finally {
      setActionId('');
    }
  };

  const reply = async (item: SuggestionDraft, status: 'answered' | 'closed') => {
    setActionId(item.id);
    setError('');
    try {
      await answerSuggestion(item.id, answers[item.id] || '', status);
      setAnswers((current) => ({ ...current, [item.id]: '' }));
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos responder el mensaje.');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title="Moderación de avisos" description="Panel privado de moderación de AutoLupa." noIndex />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Panel interno</p><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moderación de usados</h1></div><Link to="/usados" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Ver marketplace →</Link></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200 mb-5">{error}</p>}
      <section className="mb-10"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Avisos por revisar</h2><span className="text-sm text-gray-500 dark:text-gray-400">{queue.length} pendientes</span></div>{queue.length === 0 ? <p className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-5 text-sm text-green-700 dark:text-green-300">No hay avisos pendientes.</p> : <div className="space-y-4">{queue.map((listing) => <article key={listing.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow"><div className="flex flex-col md:flex-row gap-5"><div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">{listing.photoUrls[0] ? <img src={listing.photoUrls[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>}</div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{listing.brand} {listing.model} {listing.year}</h3><span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 px-2 py-1 rounded">{toUsedListingStatusLabel(listing.status)}</span></div><p className="text-blue-600 dark:text-blue-400 font-bold mt-1">{formatPrice(listing.price)} · {listing.mileage.toLocaleString('es-CL')} km · {listing.region}</p><p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">{listing.description}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Vendedor: {listing.contactName} · {listing.contactPhone}</p></div></div><div className="flex flex-col sm:flex-row gap-2 mt-4"><input value={notes[listing.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [listing.id]: event.target.value }))} placeholder="Nota para el vendedor (opcional)" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm" /><div className="flex gap-2"><button type="button" onClick={() => moderate(listing, 'rejected')} disabled={actionId === listing.id} className="px-4 py-2 rounded-lg border border-red-300 text-red-600 dark:text-red-400 text-sm font-semibold disabled:opacity-50">Rechazar</button><button type="button" onClick={() => moderate(listing, 'active')} disabled={actionId === listing.id} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">Aprobar</button></div></div></article>)}</div>}</section>
      <section><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Reportes abiertos</h2><span className="text-sm text-gray-500 dark:text-gray-400">{reports.length} sin resolver</span></div>{reports.length === 0 ? <p className="rounded-2xl bg-white dark:bg-gray-800 p-5 text-sm text-gray-500 dark:text-gray-400">No hay reportes abiertos.</p> : <div className="space-y-3">{reports.map((report) => <article key={report.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row sm:items-center gap-4"><div className="flex-1"><p className="font-semibold text-gray-900 dark:text-white">{report.listing ? `${report.listing.brand} ${report.listing.model} ${report.listing.year}` : 'Aviso eliminado'}</p><p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{report.reason}</p><p className="text-xs text-gray-400 mt-1">{new Date(report.createdAt).toLocaleString('es-CL')}</p></div><button type="button" onClick={() => resolveReport(report.id)} disabled={actionId === report.id} className="px-4 py-2 rounded-lg border border-blue-300 text-blue-600 dark:text-blue-400 text-sm font-semibold disabled:opacity-50">Marcar resuelto</button></article>)}</div>}</section>
      <section className="mt-10"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Reclamos y sugerencias</h2><span className="text-sm text-gray-500 dark:text-gray-400">{suggestions.length} sin responder</span></div>{suggestions.length === 0 ? <p className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-5 text-sm text-green-700 dark:text-green-300">No hay mensajes pendientes.</p> : <div className="space-y-4">{suggestions.map((item) => <article key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow"><div className="flex flex-wrap items-center gap-2 mb-2"><span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${item.kind === 'reclamo' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}`}>{item.kind}</span><span className="text-xs text-gray-400 dark:text-gray-500">{new Date(item.createdAt).toLocaleString('es-CL')}</span>{item.email && <span className="text-xs text-gray-500 dark:text-gray-400">{item.email}</span>}</div><h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3><p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{item.body}</p><div className="flex flex-col sm:flex-row gap-2 mt-4"><input value={answers[item.id] || ''} onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Respuesta pública (se publicará en /reclamos)" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm" /><div className="flex gap-2"><button type="button" onClick={() => reply(item, 'closed')} disabled={actionId === item.id} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold disabled:opacity-50">Cerrar</button><button type="button" onClick={() => reply(item, 'answered')} disabled={actionId === item.id} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">Publicar respuesta</button></div></div></article>)}</div>}</section>
    </div>
  );
}
