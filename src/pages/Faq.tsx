import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

const FAQ: { q: string; a: string }[] = [
  {
    q: '¿AutoLupa cobra comisión por vender mi auto?',
    a: 'No. Publicar, buscar y contactar es gratis: no hay comisión, ni gestiones, ni arriendo de carpetas. Si alguien te dice que AutoLupa le debe pagar un trámite, es una estafa: aquí nadie te pedirá dinero.',
  },
  {
    q: '¿Cómo sé si un aviso es legítimo?',
    a: 'Todos los avisos nuevos pasan por moderación humana antes de publicarse y la ficha muestra el Sello AutoLupa, el estado del correo del vendedor y el botón para reportar. Aun así, revisa fotos, pide los documentos y ve el auto en persona antes de pagar.',
  },
  {
    q: '¿Qué hago si me piden plata por adelantado?',
    a: 'No pagues. Pedir reservas, "gestiones", arriendo de carpetas o una transferencia antes de que hayas visto el auto son las señales más comunes de estafa. El contacto en AutoLupa es directo con el vendedor, por WhatsApp.',
  },
  {
    q: '¿Qué significa el badge "correo verificado" del vendedor?',
    a: 'Indica que el dueño del perfil confirmó el correo con el que publicó, haciendo clic en el enlace de confirmación. Reduce las cuentas anónimas, pero no reemplaza verificar el auto y sus documentos en persona.',
  },
  {
    q: '¿Quién revisa los avisos publicados?',
    a: 'El equipo de moderación de AutoLupa. Todo aviso entra como "En revisión" y sólo aparece en el mercado cuando se aprueba; los avisos reportados se revisan y pueden retirarse de la publicación.',
  },
  {
    q: '¿Cómo denuncio un aviso sospechoso?',
    a: 'Usa el botón "Reportar este aviso" en la ficha (requiere iniciar sesión) o el formulario de reclamos y sugerencias. Publicamos la respuesta del equipo en esa misma página, para que sirva a otras personas.',
  },
  {
    q: '¿Dónde reviso el historial del vehículo?',
    a: 'Pide el certificado de anotaciones vigentes en Registro Civil (multas, embargos y si el auto está prendado), revisa la hoja de vida de la revisión técnica (PRT) y compara el VIN y el motor con el permiso de circulación. Si quieres un informe completo, existen servicios externos como Autofact o KMcheck; AutoLupa aún no integra informes de historial.',
  },
  {
    q: '¿Cómo se transfiere el auto a mi nombre?',
    a: 'Sigue nuestra guía de transferencia: qué documentos firmar, dónde pagar el impuesto, el certificado de anotaciones vigentes y el permiso de circulación. También tienes el checklist de revisión del usado para mirar el auto antes de comprar.',
  },
  {
    q: '¿Cómo contacto con AutoLupa?',
    a: 'Por el formulario de reclamos y sugerencias (respondemos públicamente en la misma página) o por el correo info@autolupa.cl. La FAQ y la guía de seguridad de cada ficha resuelven la mayoría de las dudas.',
  },
];

export function Faq() {
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
        title="Preguntas Frecuentes y Seguridad"
        description="FAQ de AutoLupa: cómo evitar estafas al comprar un auto usado, qué significa el correo verificado, cómo reportar avisos, ver historial y transferir el vehículo."
        jsonLd={jsonLd}
      />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Ruta de navegación">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 dark:text-gray-300">Preguntas frecuentes</span>
      </nav>

      <header className="mb-8">
        <span className="text-5xl block mb-4">🛡️</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Preguntas Frecuentes y Seguridad
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Comprar o vender un auto sin sorpresas empieza con información clara. Aquí respondemos lo que más nos
          preguntan sobre estafas, verificación de vendedores, reportes e historial del vehículo.
        </p>
      </header>

      <div className="space-y-3">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-2xl bg-white dark:bg-gray-800 p-5 card-shadow">
            <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">{item.q}</summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5">
        <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">Guías relacionadas</p>
        <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
          <li>
            <Link to="/blog/transferencia-vehiculo-chile" className="font-semibold underline hover:no-underline">
              Cómo transferir un vehículo en Chile →
            </Link>
          </li>
          <li>
            <Link to="/blog/revision-auto-usado-checklist" className="font-semibold underline hover:no-underline">
              Checklist de revisión del auto usado →
            </Link>
          </li>
          <li>
            <Link to="/reclamos" className="font-semibold underline hover:no-underline">
              Reclamos y sugerencias (respuesta pública) →
            </Link>
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
        AutoLupa no cobra comisión ni ofrece créditos ni transferencias: el trato es directo entre comprador y vendedor.
        Nunca envíes dinero sin haber visto el auto y sus documentos.
      </p>
    </div>
  );
}
