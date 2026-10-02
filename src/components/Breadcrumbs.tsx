import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Inicio</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>/</span>
          {item.href ? (
            <Link to={item.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
