import { Link, useParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getArticleBySlug } from '../data/articles';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev';

export function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <SEO title="Guía no encontrada" description="La guía que buscas no existe en el blog de AutoLupa." noIndex />
        <p className="text-6xl mb-4">📚</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Esta guía no existe</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Puede que se haya movido o que el enlace esté incompleto.</p>
        <Link to="/blog" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
          ← Volver al blog
        </Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.isoDate,
        dateModified: article.isoDate,
        inLanguage: 'es-CL',
        mainEntityOfPage: `${SITE_URL}/blog/${article.slug}`,
        author: { '@type': 'Organization', name: 'AutoLupa', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'AutoLupa', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/blog/${article.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title={article.title} description={article.excerpt} jsonLd={jsonLd} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Ruta de navegación">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 dark:text-gray-300">{article.category}</span>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
            {article.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{article.date} · {article.readTime} de lectura</span>
        </div>
        <span className="text-5xl block mb-4">{article.icon}</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">{article.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{article.excerpt}</p>
      </header>

      <article className="space-y-9">
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="space-y-2 mt-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">›</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <aside className="mt-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sigue en AutoLupa</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/usados" className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-gray-700">
            🔎 Buscar autos usados
          </Link>
          <Link to="/" className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-gray-700">
            📊 Comparar autos nuevos
          </Link>
          <Link to="/glosario" className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-gray-700">
            📖 Glosario automotriz
          </Link>
          <Link to="/publicar-auto" className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            📢 Publicar gratis
          </Link>
        </div>
      </aside>

      <div className="mt-8 text-center">
        <Link to="/blog" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          ← Ver todas las guías
        </Link>
      </div>
    </div>
  );
}
