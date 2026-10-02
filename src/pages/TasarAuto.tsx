import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CarImage } from '../components/Cars/CarImage';
import { brands, carsData, formatPrice, getModelsByBrand } from '../data/brands';
import {
  ESTADOS_VEHICULO,
  EstadoVehiculo,
  estimarValor,
  KM_POR_ANIO,
  TasacionResultado,
} from '../data/tasador';
import { track } from '../lib/analytics';

const inputClassName = 'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, index) => currentYear - index);

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{error}</span>}
    </label>
  );
}

export function TasarAuto() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [year, setYear] = useState('');
  const [km, setKm] = useState('');
  const [estado, setEstado] = useState<EstadoVehiculo>('bueno');
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<TasacionResultado | null>(null);

  const modelOptions = brand ? getModelsByBrand(brand) : [];
  const selectedCar = useMemo(
    () => (brand && model ? carsData.find(car => car.brand === brand && car.model === model) : undefined),
    [brand, model],
  );

  const handleBrand = (value: string) => {
    setBrand(value);
    setModel('');
    setVersion('');
    setResultado(null);
  };

  const handleModel = (value: string) => {
    setModel(value);
    setVersion('');
    setResultado(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const yearValue = Number(year);
    const kmValue = Number(km);

    if (!brand || !model) {
      setError('Selecciona la marca y el modelo de tu auto.');
      return;
    }
    if (!yearValue || yearValue < currentYear - 30 || yearValue > currentYear) {
      setError('Selecciona el año de tu auto.');
      return;
    }
    if (km === '' || Number.isNaN(kmValue) || kmValue < 0 || kmValue > 1_500_000) {
      setError('Ingresa los kilómetros reales del auto (entre 0 y 1.500.000).');
      return;
    }

    const estimado = estimarValor({
      brand,
      model,
      version: version || undefined,
      year: yearValue,
      km: kmValue,
      estado,
    });

    if (!estimado) {
      setError('No encontramos ese modelo en el catálogo de AutoLupa.');
      return;
    }

    setError('');
    setResultado(estimado);
    track('Valuation', { marca: brand, anios: estimado.anios });
  };

  const estadoActual = ESTADOS_VEHICULO.find(option => option.id === estado);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="¿Cuánto vale tu auto? Tasador gratis en Chile"
        description="Calcula el valor de referencia de tu auto en Chile: depreciación por antigüedad, kilometraje y estado. Compara con modelos de precio parecido y publica gratis."
      />

      <Breadcrumbs items={[{ label: 'Tasar tu auto' }]} />

      <header className="mb-8">
        <span className="text-5xl block mb-4">🧮</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">¿Cuánto vale tu auto?</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Estima el valor de referencia de tu vehículo en Chile usando el catálogo de AutoLupa, la antigüedad,
          el kilometraje y el estado. Gratis y sin registro.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Datos de tu auto</h2>

          <Field label="Marca">
            <select value={brand} onChange={(event) => handleBrand(event.target.value)} className={inputClassName}>
              <option value="">Selecciona una marca</option>
              {brands.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>

          <Field label="Modelo">
            <select value={model} onChange={(event) => handleModel(event.target.value)} className={inputClassName} disabled={!brand}>
              <option value="">{brand ? 'Selecciona un modelo' : 'Primero elige la marca'}</option>
              {modelOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>

          <Field label="Versión (opcional)">
            <select value={version} onChange={(event) => setVersion(event.target.value)} className={inputClassName} disabled={!selectedCar || selectedCar.versions.length === 0}>
              <option value="">{selectedCar && selectedCar.versions.length > 0 ? 'Versión base del catálogo' : 'Sin versiones registradas'}</option>
              {selectedCar?.versions.map(option => (
                <option key={option.version} value={option.version}>{option.version} · {formatPrice(option.price)}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Año">
              <select value={year} onChange={(event) => setYear(event.target.value)} className={inputClassName}>
                <option value="">Año</option>
                {YEARS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </Field>
            <Field label="Kilómetros">
              <input type="number" inputMode="numeric" min={0} max={1500000} step={1000} value={km} onChange={(event) => setKm(event.target.value)} className={inputClassName} placeholder="Ej: 95000" />
            </Field>
          </div>

          <fieldset>
            <legend className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Estado general</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ESTADOS_VEHICULO.map(option => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => { setEstado(option.id); setResultado(null); }}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    estado === option.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                >
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">{option.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{option.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors">
            Calcular valor
          </button>

          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>

        <section aria-live="polite" className="space-y-5">
          {!resultado && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cómo lo calculamos</h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-xl">📉</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Depreciación por antigüedad</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">18% el primer año, 12% hasta los 3 años, 9% hasta los 6 y 7% después, sobre el precio de lista del catálogo.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">🛣️</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Kilometraje</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Comparamos tus kilómetros contra los {KM_POR_ANIO.toLocaleString('es-CL')} km anuales esperados: auto muy usado baja, auto recorrido menos sube hasta 1,5%.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">🛠️</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Estado general</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Excelente suma 3%, bueno mantiene y regular descuenta 6%.</p>
                  </div>
                </li>
              </ol>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                Es una estimación de referencia, no un peritaje ni una tasación oficial. El precio final lo fijas tú al publicar.
              </p>
            </div>
          )}

          {resultado && (
            <>
              <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 text-white">
                <p className="text-sm text-blue-100">
                  {resultado.car.brand} {resultado.car.model}{resultado.versionName ? ` ${resultado.versionName}` : ''} {currentYear - resultado.anios}
                </p>
                <p className="text-4xl font-extrabold mt-1">{formatPrice(resultado.valorEstimado)}</p>
                <p className="text-sm text-blue-100 mt-2">
                  Rango de venta sugerido: <strong>{formatPrice(resultado.min)}</strong> – <strong>{formatPrice(resultado.max)}</strong>
                </p>
                <p className="text-xs text-blue-200 mt-2">
                  Precio de lista {formatPrice(resultado.precioLista)} (auto nuevo en concesionario).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 card-shadow">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Antigüedad</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{resultado.anios} {resultado.anios === 1 ? 'año' : 'años'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{Math.round(resultado.factorDepreciacion * 100)}% del precio de lista</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 card-shadow">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kilometraje</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(km).toLocaleString('es-CL')} km</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Esperados: {(KM_POR_ANIO * Math.max(resultado.anios, 1)).toLocaleString('es-CL')} km</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 card-shadow">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{estadoActual?.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Factor {Math.round(resultado.factorEstado * 100)}%</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Modelos nuevos de precio parecido</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Así se ve tu presupuesto en el mercado actual.</p>
                <ul className="space-y-3">
                  {resultado.comparables.map(comparable => (
                    <li key={comparable.id}>
                      <Link
                        to={`/marca/${comparable.brand.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-blue-500 transition-colors"
                      >
                        <div className="w-16 h-12 shrink-0 overflow-hidden rounded-lg">
                          <CarImage carId={comparable.id} brand={comparable.brand} model={comparable.model} type={comparable.type} className="w-full h-full" showLabel={false} />
                        </div>
                        <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{comparable.brand} {comparable.model}</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(comparable.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">¿Es el precio que tenías en mente?</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Publica tu auto gratis y recibe ofertas directas por WhatsApp. Sin comisiones.</p>
                <Link to="/publicar-auto" className="inline-flex px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                  Publicar mi auto gratis
                </Link>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimación referencial del catálogo de AutoLupa: precio de lista depreciado por antigüedad, kilometraje y estado.
                No es un peritaje ni una tasación oficial: el precio final lo fijas tú al publicar. No incluye accesorios ni mantenciones hechas.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
