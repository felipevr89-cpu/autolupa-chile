import { Link } from 'react-router-dom';

const LINKS: { to?: string; href?: string; label: string }[] = [
  { href: 'https://www.registrocivil.cl/', label: 'Certificado de anotaciones vigentes (Registro Civil)' },
  { to: '/blog/transferencia-vehiculo-chile', label: 'Guía de transferencia paso a paso' },
  { to: '/blog/revision-auto-usado-checklist', label: 'Checklist de revisión del usado' },
];

export function DocumentLinks() {
  return (
    <section
      aria-label="Historial y transferencia"
      className="rounded-2xl bg-white dark:bg-gray-800 p-5 card-shadow"
    >
      <h2 className="font-bold text-gray-900 dark:text-white">Historial y transferencia</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Antes de comprar, revisa el historial del vehículo y ten a mano los pasos de la transferencia.
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {LINKS.map((link) =>
          link.to ? (
            <li key={link.to}>
              <Link
                to={link.to}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {link.label} →
              </Link>
            </li>
          ) : (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {link.label} ↗
              </a>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
