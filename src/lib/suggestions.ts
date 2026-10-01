import { supabase } from './supabase';

export type SuggestionKind = 'reclamo' | 'sugerencia';
export type SuggestionStatus = 'open' | 'answered' | 'closed';

export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  title: string;
  body: string;
  status: SuggestionStatus;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface SuggestionDraft extends Suggestion {
  email: string;
}

export interface SuggestionInput {
  kind: SuggestionKind;
  title: string;
  body: string;
  email: string;
}

export class SuggestionsUnavailableError extends Error {
  constructor() {
    super('El formulario de reclamos aún no está disponible.');
    this.name = 'SuggestionsUnavailableError';
  }
}

function client() {
  if (!supabase) throw new SuggestionsUnavailableError();
  return supabase;
}

const publicColumns = 'id, kind, title, body, status, answer, answered_at, created_at';
const moderatorColumns = `${publicColumns}, email`;

interface SuggestionRow {
  id: string;
  kind: SuggestionKind;
  title: string;
  body: string;
  email?: string;
  status: SuggestionStatus;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
}

function toSuggestion(row: SuggestionRow): SuggestionDraft {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    email: row.email || '',
    status: row.status,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
  };
}

export function validateSuggestionInput(input: SuggestionInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const body = input.body.trim();
  const email = input.email.trim();

  if (title.length < 5) errors.title = 'Escribe un título de al menos 5 caracteres.';
  else if (title.length > 120) errors.title = 'El título no puede superar 120 caracteres.';

  if (body.length < 10) errors.body = 'Cuéntanos un poco más: el mensaje necesita al menos 10 caracteres.';
  else if (body.length > 2000) errors.body = 'El mensaje no puede superar 2.000 caracteres.';

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Revisa el correo: no parece una dirección válida.';
  }

  return errors;
}

const THROTTLE_KEY = 'autolupa_suggestion_last_sent';
const THROTTLE_MS = 30_000;

function lastSuggestionSentAt(): number {
  try {
    return Number(localStorage.getItem(THROTTLE_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function markSuggestionSent(): void {
  try {
    localStorage.setItem(THROTTLE_KEY, String(Date.now()));
  } catch {
    return;
  }
}

export async function sendSuggestion(input: SuggestionInput, honeypot: string): Promise<void> {
  if (honeypot.trim()) return;
  if (Date.now() - lastSuggestionSentAt() < THROTTLE_MS) {
    throw new Error('Espera unos segundos antes de enviar otro mensaje.');
  }
  const { error } = await client().from('suggestions').insert({
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    email: input.email.trim(),
  });
  if (error) throw error;
  markSuggestionSent();
}

export async function getPublishedSuggestions(limit = 50): Promise<Suggestion[]> {
  const { data, error } = await client().from('suggestions')
    .select(publicColumns)
    .in('status', ['answered', 'closed'])
    .order('answered_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as SuggestionRow[] | null) ?? []).map(toSuggestion);
}

export async function getOpenSuggestions(): Promise<SuggestionDraft[]> {
  const { data, error } = await client().from('suggestions')
    .select(moderatorColumns)
    .eq('status', 'open')
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) throw error;
  return ((data as SuggestionRow[] | null) ?? []).map(toSuggestion);
}

export async function answerSuggestion(id: string, answer: string, status: 'answered' | 'closed'): Promise<void> {
  const text = answer.trim();
  if (status === 'answered' && text.length < 5) {
    throw new Error('La respuesta necesita al menos 5 caracteres.');
  }
  const { error } = await client().from('suggestions').update({
    status,
    answer: status === 'answered' ? text : null,
    answered_at: status === 'answered' ? new Date().toISOString() : null,
  }).eq('id', id);
  if (error) throw error;
}
