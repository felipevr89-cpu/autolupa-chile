import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { articles } from '../data/articles';

interface UpcomingArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  icon: string;
}

const upcomingArticles: UpcomingArticle[] = [
  {
    slug: 'guia-comparar-autos-chile',
    title: 'Guía para Comparar Autos en Chile: Todo lo que Necesitas Saber',
    excerpt: 'Cómo elegir el auto perfecto según tu presupuesto, necesidades y estilo de vida. Comparación de marcas chinas vs europeas vs japonesas.',
    category: 'Guía de compra',
    date: '21 Sep 2026',
    readTime: '8 min',
    icon: '📖',
  },
  {
    slug: 'mejores-autos-familia-2026',
    title: 'Los 10 Mejores Autos Familiares en Chile 2026',
    excerpt: 'Desde el Hyundai Tucson hasta el BYD Song Plus: los autos más seguros y espaciosos para tu familia.',
    category: 'Rankings',
    date: '20 Sep 2026',
    readTime: '6 min',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    slug: 'autos-electricos-chile-2026',
    title: 'Guía de Autos Eléctricos en Chile: Precios, Carga y Autonomía',
    excerpt: 'Todo sobre el estado de los autos eléctricos en Chile, puntos de carga, costos de mantención y modelos disponibles.',
    category: 'Eléctricos',
    date: '19 Sep 2026',
    readTime: '10 min',
    icon: '⚡',
  },
  {
    slug: 'tcu-costo-vehiculo-propiedad',
    title: 'TCU: ¿Cuánto Realmente Cuesta tu Auto al Año?',
    excerpt: 'Análisis completo del Total Cost of Ownership incluyendo seguro, permiso de circulación, mantención, bencina y depreciación.',
    category: 'Finanzas',
    date: '18 Sep 2026',
    readTime: '7 min',
    icon: '💰',
  },
  {
    slug: 'seguros-auto-chile-comparar',
    title: 'Cómo Elegir el Mejor Seguro de Auto en Chile',
    excerpt: 'Comparación de aseguradoras, tipos de cobertura, deducibles y consejos para no pagar de más.',
    category: 'Finanzas',
    date: '17 Sep 2026',
    readTime: '6 min',
    icon: '🛡️',
  },
  {
    slug: 'autos-chinos-chile-opinion',
    title: 'Autos Chinos en Chile: ¿Son Buenos? Opinión y Análisis',
    excerpt: 'BYD, Chery, GWM, Changan, MG, Deepal... Analizamos la calidad, garantía y respaldo de las marcas chinas que llegaron a Chile.',
    category: 'Análisis',
    date: '16 Sep 2026',
    readTime: '9 min',
    icon: '🇨🇳',
  },
  {
    slug: 'hibridos-vs-electricos',
    title: 'Híbridos vs Eléctricos: ¿Cuál Conviene Más en Chile?',
    excerpt: 'Análisis de costos, autonomía y practicidad. ¿Un híbrido (HEV/PHEV) o un 100% eléctrico? Depende de tu caso.',
    category: 'Eléctricos',
    date: '15 Sep 2026',
    readTime: '7 min',
    icon: '🔋',
  },
  {
    slug: 'permiso-circulacion-2026',
    title: 'Permiso de Circulación 2026: Cuánto Pagarás por tu Auto',
    excerpt: 'Tabla de permisos de circulación por región, valor UF y cómo calcular el costo exacto de tu vehículo.',
    category: 'Finanzas',
    date: '14 Sep 2026',
    readTime: '5 min',
    icon: '📋',
  },
  {
    slug: 'autos-seguros-chile-latin-ncap',
    title: 'Los Autos Más Seguros de Chile: Ranking Latin NCAP 2025-2026',
    excerpt: '¿Cuántos airbags tiene tu auto? Ranking de autos por calificación de seguridad en Latin NCAP.',
    category: 'Rankings',
    date: '13 Sep 2026',
    readTime: '6 min',
    icon: '🛡️',
  },
];

function ArticleCard({
  article,
  href,
}: {
  article: UpcomingArticle;
  href?: string;
}) {
  const body = (
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
        <span className="text-xs text-gray-400 dark:text-gray-500">{article.date}</span>
        {href ? (
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
            Leer más →
          </span>
        ) : (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-full">
            En preparación
          </span>
        )}
      </div>
    </div>
  );

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow hover:shadow-xl transition-all group h-full">
      {href ? <Link to={href} className="block h-full">{body}</Link> : body}
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

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">📚 Blog de AutoLupa</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl">
          Guías, comparaciones y consejos para tomar la mejor decisión al comprar tu auto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard key={article.slug} article={article} href={`/blog/${article.slug}`} />
        ))}
        {upcomingArticles.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div className="text-center mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">¿Tienes una pregunta?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-lg mx-auto">
          Us nuestro comparador para encontrar el auto perfecto según tus necesidades.
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
