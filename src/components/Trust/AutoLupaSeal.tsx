import { Link } from 'react-router-dom';

interface Props {
  emailVerified?: boolean;
}

const SEAL_POINTS = [
  'Publicación revisada por moderación antes de aparecer en el mercado.',
  'Contacto directo por WhatsApp: sin comisión, sin intermediarios ni arriendo de carpetas.',
  'Precio, kilometraje y fotos declarados por el vendedor y visibles en esta ficha.',
];

export function AutoLupaSeal({ emailVerified = false }: Props) {
  const points = emailVerified ? ['Correo del vendedor verificado.', ...SEAL_POINTS] : SEAL_POINTS;

  return (
    <aside
      aria-label="Sello AutoLupa"
      className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-5"
    >
      <p className="text-sm font-bold text-green-900 dark:text-green-100 mb-2">✅ Sello AutoLupa</p>
      <ul className="list-disc list-inside space-y-1.5 text-xs leading-relaxed text-green-900 dark:text-green-100">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <Link
        to="/faq"
        className="mt-3 inline-block text-xs font-semibold text-green-900 dark:text-green-100 underline hover:no-underline"
      >
        Cómo evitar estafas: preguntas frecuentes →
      </Link>
    </aside>
  );
}
