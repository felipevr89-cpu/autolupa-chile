import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { articles, Article } from '../data/articles';

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow hover:shadow-xl transition-all group h-full">
      <Link to={`/blog/${article.slug}`} className="block h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {article.readTime} lectura
            </span>
          </div>
          <span className="text-4xl block mb-3">{article.icon}</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
            {article.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-gray-400 dark:text-gray-500">{article.date} · revisado {article.reviewed}</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              Leer más →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function Blog() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Blog — Guías y Consejos de Autos en Chile"
        description="Guías de compra, comparaciones, análisis de costos y consejos para elegir tu próximo auto en Chile."
      />

      <Breadcrumbs items={[{ label: 'Blog' }]} />

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">📚 Blog de AutoLupa</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl">
          Guías, comparaciones y consejos para tomar la mejor decisión al comprar tu auto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div className="text-center mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">¿Tienes una pregunta?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-lg mx-auto">
          Usa nuestro comparador para encontrar el auto perfecto según tus necesidades.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          🔍 Comparar autos ahora
        </Link>
      </div>
    </div>
  );
}
