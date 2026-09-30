import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { GLOSSARY, GLOSSARY_CATEGORIES, searchGlossary, type GlossaryEntry } from '../data/glossary';

const CATEGORY_ICONS: Record<string, string> = {
  propulsion: '⛽',
  transmission: '⚙️',
  battery: '🔋',
  specs: '📐',
  buying: '🧾',
};

function EntryCard({ entry }: { entry: GlossaryEntry }) {
  return (
    <article
      id={entry.id}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 card-shadow scroll-mt-24 border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{entry.term}</h3>
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{entry.short}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{entry.definition}</p>
      {entry.aliases.length > 1 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          También: {entry.aliases.join(' · ')}
        </p>
      )}
    </article>
  );
}

export function Glosario() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchGlossary(query), [query]);
  const grouped = useMemo(
    () =>
      GLOSSARY_CATEGORIES.map((cat) => ({
        category: cat,
        entries: results.filter((entry) => entry.category === cat.id),
      })).filter((group) => group.entries.length > 0),
    [results],
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <SEO
        title="Glosario de autos: terminología técnica explicada"
        description="Qué significa CVT, PHEV, HEV, torque, kWh, CAE, SOAP o tracción integral. El glosario de terminología automotriz para comprar un auto en Chile."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'Glosario de terminología automotriz de AutoLupa',
          url: 'https://autolupa.pages.dev/glosario',
          hasDefinedTerm: GLOSSARY.map((entry) => ({
            '@type': 'DefinedTerm',
            name: entry.term,
            description: entry.short,
            termCode: entry.id,
          })),
        }}
      />
      <Breadcrumbs items={[{ label: 'Glosario' }]} />

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Glosario de terminología automotriz
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          En AutoLupa no escondemos la terminología: te la explicamos. Aquí encuentras qué significa cada sigla y
          cifra que ves en las fichas, para que compares con criterio y aprendas a leer un auto como un profesional.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Encontrarás un término subrayado con línea punteada en las fichas y comparativas: pasa el cursor y verás su
          definición.
        </p>
      </header>

      <div className="mb-8">
        <label htmlFor="glosario-buscar" className="sr-only">Buscar término</label>
        <input
          id="glosario-buscar"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar: CVT, PHEV, torque, permiso de circulación…"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {results.length} {results.length === 1 ? 'término' : 'términos'}
        </p>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-8 text-center text-gray-600 dark:text-gray-300">
          No encontramos ese término. Escríbenos a{' '}
          <a href="mailto:privacidad@autolupa.cl" className="text-blue-600 dark:text-blue-400 underline">
            privacidad@autolupa.cl
          </a>{' '}
          y lo agregamos.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ category, entries }) => (
            <section key={category.id}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category.id]}</span>
                {category.label}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{category.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          ¿Prefieres que te lo pregunte con tus palabras?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Nuestro buscador entiende lenguaje natural: escribe cosas como «SUV automático por menos de 15 palos» y te
          devolvemos los autos que calzan.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
            Ir al buscador
          </Link>
          <Link to="/usados" className="px-5 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-semibold border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700">
            Ver autos usados
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Glosario;
