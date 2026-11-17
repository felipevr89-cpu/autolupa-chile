import { SITE_VISITS_MIN_DISPLAY, useSiteVisits } from '../../lib/visits';

interface Props {
  className?: string;
  template?: (formatted: string) => string;
}

const defaultTemplate = (formatted: string) => `${formatted} visitas en los últimos 30 días`;

export function VisitCounter({ className = '', template = defaultTemplate }: Props) {
  const visits = useSiteVisits();
  if (visits === null || visits < SITE_VISITS_MIN_DISPLAY) return null;
  return (
    <p className={className} data-testid="visit-counter">
      <span aria-hidden="true">👁 </span>{template(visits.toLocaleString('es-CL'))}
    </p>
  );
}
