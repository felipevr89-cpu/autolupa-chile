import { Link } from 'react-router-dom';

interface Props {
  context?: 'used' | 'new';
}

const USED_POINTS = [
  'Nunca transfieras ni deposites antes de ver el auto y sus documentos en persona.',
  'Pide el certificado de anotaciones vigentes: ahí aparecen multas, embargos y si el vehículo está prendado.',
  'Comprueba que el VIN y el número de motor coincidan con el permiso de circulación.',
  'Desconfía de precios muy bajo del mercado y de quien pide pago por adelantado o urgencia.',
  'AutoLupa no cobra comisión por la venta: no existen gestiones ni arriendo de carpetas que pagar aquí.',
];

const NEW_POINTS = [
  'Pide la cotización por escrito y compárala con el precio de lista del sitio oficial de la marca.',
  'Pregunta por el precio final con impuestos, entrega y accesorios antes de firmar cualquier documento.',
  'Desconfía de quien cobre reservas, gestiones o arriendo de carpetas: aquí no hay comisión ni intermediarios.',
];

export function SafetyBanner({ context = 'used' }: Props) {
  const points = context === 'used' ? USED_POINTS : NEW_POINTS;

  return (
    <aside
      role="note"
      aria-label="Recomendaciones de seguridad"
      className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5"
    >
      <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">🛡️ Compra sin sorpresas</p>
      <ul className="list-disc list-inside space-y-1.5 text-xs leading-relaxed text-amber-900 dark:text-amber-100">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <Link
        to="/glosario"
        className="mt-3 inline-block text-xs font-semibold text-amber-900 dark:text-amber-100 underline hover:no-underline"
      >
        ¿Dudas con los términos? Revisa el glosario →
      </Link>
    </aside>
  );
}
