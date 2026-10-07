import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getPublishedSuggestions,
  sendSuggestion,
  SuggestionsUnavailableError,
  validateSuggestionInput,
  type Suggestion,
  type SuggestionKind,
} from '../lib/suggestions';

const FAQ: { q: string; a: string }[] = [
  {
    q: '¿Quién puede enviar un reclamo o una sugerencia?',
    a: 'Cualquier persona, sin cuenta ni registro. Basta con completar el formulario con el asunto y el mensaje; el correo es opcional y solo se usa si necesitamos responderte en privado.',
  },
  {
    q: '¿Qué pasa con mis datos al enviar un mensaje?',
    a: 'Se usan exclusivamente para atender tu consulta, según la política de privacidad y los derechos de la Ley 21.719. No los publicamos: la lista pública solo muestra el título, el mensaje y nuestra respuesta.',
  },
  {
    q: '¿Cómo responde AutoLupa?',
    a: 'El equipo de moderación revisa cada mensaje y publica la respuesta en esta misma página, para que sirva de referencia a otras personas con la misma duda.',
  },
  {
    q: '¿Puedo consultar el aviso que denuncié?',
    a: 'Si el reclamo está relacionado con un aviso del marketplace, la respuesta indica si el anuncio fue corregido, rechazado o retirado de la publicación.',
  },
];

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function Reclamos() {
  const [kind, setKind] = useState<SuggestionKind>('sugerencia');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [listNotice, setListNotice] = useState('');
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setListLoading(false);
      setListNotice('Las respuestas publicadas se mostrarán aquí cuando el formulario esté activo.');
      return;
    }
    let cancelled = false;
    getPublishedSuggestions()
      .then((rows) => {
        if (!cancelled) setSuggestions(rows);
      })
      .catch(() => {
        if (!cancelled) setListNotice('No pudimos cargar las respuestas publicadas en este momento.');
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    if (honeypot.trim()) {
      setSent(true);
      return;
    }
    const input = { kind, title, body, email };
    const found = validateSuggestionInput(input);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      await sendSuggestion(input, honeypot);
      setTitle('');
      setBody('');
      setEmail('');
      setSent(true);
    } catch (reason) {
      setSubmitError(
        reason instanceof SuggestionsUnavailableError
          ? reason.message
          : 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.',
      );
    } finally {
      setSending(false);
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Reclamos y Sugerencias"
        description="Envía tu reclamo o sugerencia a AutoLupa y consulta las respuestas publicadas de nuestro equipo."
        jsonLd={jsonLd}
      />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Ruta de navegación">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 dark:text-gray-300">Reclamos y sugerencias</span>
      </nav>

      <header className="mb-8">
        <span className="text-5xl block mb-4">📮</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Reclamos y Sugerencias</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          ¿Algo no te cuadra o tienes una idea para mejorar AutoLupa? Escríbenos aquí. Publicamos la respuesta
          de nuestro equipo en esta misma página, para que sirva a otras personas con la misma duda.
        </p>
      </header>

      <section className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Cómo tratamos tu mensaje</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2"><span className="text-blue-600 dark:text-blue-400 font-bold">›</span> Sin cuenta ni registro: puedes escribir de forma anónima.</li>
          <li className="flex gap-2"><span className="text-blue-600 dark:text-blue-400 font-bold">›</span> El correo es opcional y solo se usa para responderte en privado.</li>
          <li className="flex gap-2"><span className="text-blue-600 dark:text-blue-400 font-bold">›</span> No publicamos tu correo: solo el título, el mensaje y nuestra respuesta.</li>
          <li className="flex gap-2"><span className="text-blue-600 dark:text-blue-400 font-bold">›</span> Tus datos se tratan según la <Link to="/privacidad" className="underline hover:text-blue-600">política de privacidad</Link> (Ley 21.719).</li>
        </ul>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Envía tu mensaje</h2>
        {sent ? (
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-5" role="status">
            <p className="font-semibold text-green-800 dark:text-green-300 mb-1">Mensaje recibido.</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Revisaremos tu caso y publicaremos la respuesta en esta página.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-3 text-sm font-medium text-green-700 dark:text-green-300 underline"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <div>
              <label htmlFor="suggestion-kind" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de mensaje
              </label>
              <select
                id="suggestion-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as SuggestionKind)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="sugerencia">Sugerencia</option>
                <option value="reclamo">Reclamo</option>
              </select>
            </div>

            <div>
              <label htmlFor="suggestion-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asunto
              </label>
              <input
                id="suggestion-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: No puedo editar mi anuncio"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              {errors.title && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="suggestion-body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mensaje
              </label>
              <textarea
                id="suggestion-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={5}
                placeholder="Cuéntanos qué pasó o qué te gustaría que mejoráramos"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <div className="flex justify-between gap-3 mt-1">
                {errors.body ? <p className="text-xs text-red-600 dark:text-red-400">{errors.body}</p> : <span />}
                <span className="text-xs text-gray-400 dark:text-gray-500">{body.length}/2000</span>
              </div>
            </div>

            <div>
              <label htmlFor="suggestion-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo (opcional)
              </label>
              <input
                id="suggestion-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Si quieres que te respondamos directo"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="suggestion-website">No llenes este campo</label>
              <input
                id="suggestion-website"
                name="website"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {submitError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {sending ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Respuestas publicadas</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{listLoading ? '…' : suggestions.length} respuestas</span>
        </div>
        {listLoading ? (
          <div className="space-y-4" aria-label="Cargando">
            <div className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="rounded-2xl bg-white dark:bg-gray-800 p-5 text-sm text-gray-500 dark:text-gray-400 card-shadow">
            {listNotice || 'Todavía no hay respuestas publicadas. La primera aparecerá aquí.'}
          </p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((item) => (
              <article key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full capitalize">
                    {item.kind}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.answeredAt || item.createdAt)}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-line">{item.body}</p>
                {item.answer ? (
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">Respuesta de AutoLupa</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.answer}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Cerrado sin respuesta pública.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <article key={item.q} className="bg-white dark:bg-gray-800 rounded-2xl p-5 card-shadow">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.q}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Otras formas de contactarnos</h2>
        <div className="flex flex-wrap gap-3">
          <a href="mailto:info@autolupa.cl" className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-gray-700">
            ✉️ info@autolupa.cl
          </a>
          <Link to="/glosario" className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-gray-700">
            📖 Glosario automotriz
          </Link>
          <Link to="/privacidad" className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-gray-700">
            🔒 Tus datos
          </Link>
        </div>
      </aside>
    </div>
  );
}
