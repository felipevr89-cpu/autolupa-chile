import { Link } from 'react-router-dom';
import { carsData, brands } from '../data/brands';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">AutoLupa</h3>
            <p className="text-sm leading-relaxed">
              Marketplace y comparador de vehículos para Chile. Compra autos usados, publica tu auto gratis o compara modelos nuevos.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Herramientas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/usados" className="hover:text-white transition-colors">Autos usados</Link></li>
              <li><Link to="/publicar-auto" className="hover:text-white transition-colors">Publicar auto gratis</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Comparador de autos</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Comparar seleccionados</Link></li>
              <li><Link to="/favorites" className="hover:text-white transition-colors">Mis favoritos</Link></li>
              <li><Link to="/top10" className="hover:text-white transition-colors">Top 10</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
              <li><Link to="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link></li>
              <li><Link to="/tus-datos" className="hover:text-white transition-colors">Tus datos (derechos Ley 21.719)</Link></li>
              <li><a href="mailto:info@autolupa.cl" className="hover:text-white transition-colors">Contacto: info@autolupa.cl</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Marcas {year}</h4>
            <p className="text-sm leading-relaxed">
              Más de {brands.length} marcas y {carsData.length} modelos disponibles en el mercado chileno. Actualizado constantemente.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© {year} AutoLupa. Todos los derechos reservados.</p>
          <p className="mt-1 text-xs">Los precios son referenciales y pueden variar según concesionario.</p>
        </div>
      </div>
    </footer>
  );
}