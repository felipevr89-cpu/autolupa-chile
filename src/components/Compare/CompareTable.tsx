import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Car } from '../../types';
import { formatPrice, getTypeLabel, getFuelLabel } from '../../data/brands';
import { getChargingCost, getCombustionCostPer100 } from '../../data/energyCosts';
import { TermTip } from '../Glossary/TermTip';

interface Props {
  cars: Car[];
  onRemove: (id: number) => void;
}

type SpecRow = {
  label: string;
  key?: keyof Car;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (v: any, car: Car) => string;
  highlight?: 'low' | 'high';
  glossary?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueGlossary?: (v: any, car: Car) => string;
};

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <tr>
    <td colSpan={4} className="px-4 pt-6 pb-2 text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-50/80 dark:bg-gray-800/80">
      <span className="mr-2">{icon}</span>{title}
    </td>
  </tr>
);

const isRowEmpty = (cars: Car[], spec: SpecRow) => {
  return cars.every((car) => {
    let display = '';
    if (spec.format) {
      display = spec.format(spec.key ? car[spec.key] : undefined, car);
    } else if (spec.key) {
      display = String(car[spec.key] ?? '');
    }
    return display === '' || display === '—' || display === 'N/A' || display === 'Sin evaluar' || display === 'Básico' || display === 'Sin ADAS';
  });
};

export function CompareTable({ cars, onRemove }: Props) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [diffMode, setDiffMode] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (cars.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚖️</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sin vehículos para comparar</h3>
        <p className="text-gray-500 dark:text-gray-400">Selecciona hasta 3 vehículos desde la página principal</p>
      </div>
    );
  }

  const prices = cars.map((c) => c.price);
  const minPrice = Math.min(...prices);
  const hpValues = cars.map((c) => c.hp ?? 0);
  const maxHp = Math.max(...hpValues);
  const consumptionValues = cars.map((c) => c.fuel_consumption_mixed_km_l ?? 0).filter(v => v > 0);
  const maxConsumption = consumptionValues.length > 0 ? Math.max(...consumptionValues) : 0;
  const airbagsValues = cars.map((c) => c.airbags ?? 0);
  const maxAirbags = Math.max(...airbagsValues);
  const trunkValues = cars.map((c) => c.trunk_liters ?? 0);
  const maxTrunk = Math.max(...trunkValues);
  const seatsValues = cars.map((c) => c.seats ?? 0);
  const maxSeats = Math.max(...seatsValues);
  const ncapValues = cars.map((c) => c.latin_ncap_stars ?? 0);
  const maxNcap = Math.max(...ncapValues);

  const isWinner = (car: Car, field: string) => {
    if (field === 'price') return car.price === minPrice;
    if (field === 'hp') return car.hp === maxHp && maxHp > 0;
    if (field === 'consumption') return (car.fuel_consumption_mixed_km_l ?? 0) === maxConsumption && maxConsumption > 0;
    if (field === 'airbags') return (car.airbags ?? 0) === maxAirbags && maxAirbags > 0;
    if (field === 'trunk') return (car.trunk_liters ?? 0) === maxTrunk && maxTrunk > 0;
    if (field === 'seats') return (car.seats ?? 0) === maxSeats && maxSeats > 0;
    if (field === 'ncap') return (car.latin_ncap_stars ?? 0) === maxNcap && maxNcap > 0;
    return false;
  };

  const getWinnerClass = (car: Car, field: string) => {
    return isWinner(car, field) ? 'winner-cell bg-green-50 dark:bg-green-900/20 font-semibold' : '';
  };

  const scores = cars.map((car) => {
    let score = 0;
    if (isWinner(car, 'price')) score++;
    if (isWinner(car, 'hp')) score++;
    if (isWinner(car, 'consumption')) score++;
    if (isWinner(car, 'airbags')) score++;
    if (isWinner(car, 'trunk')) score++;
    if (isWinner(car, 'seats')) score++;
    if (isWinner(car, 'ncap')) score++;
    return score;
  });

  const maxScore = Math.max(...scores, 1);

  const basicSpecs: SpecRow[] = [
    { label: 'Marca', key: 'brand' },
    { label: 'Modelo', key: 'model' },
    { label: 'Año', key: 'year' },
    { label: 'Tipo', key: 'type', format: (v: string) => getTypeLabel(v) },
    { label: 'Combustible', key: 'fuel', format: (v: string) => getFuelLabel(v), valueGlossary: (_v, c) => c.fuel },
    { label: 'Plazas', key: 'seats', highlight: 'high' },
    { label: 'Transmisión', key: 'transmission', format: (v: string) => v === 'automatica' ? 'Automática' : 'Manual', valueGlossary: (_v, c) => c.transmission === 'automatica' ? 'automatica' : 'manual' },
    { label: 'Tracción', key: 'traction', glossary: 'traccion' },
    { label: 'Origen', key: 'origin' },
    { label: 'Garantía', format: (_, c) => c.warranty_years ? `${c.warranty_years} años / ${((c.warranty_km ?? 0) / 1000).toFixed(0)} mil km` : '—' },
    { label: 'Precio', key: 'price', format: (v: number) => formatPrice(v), highlight: 'low' },
  ];

  const perfSpecs: SpecRow[] = [
    { label: 'Potencia', key: 'hp', format: (v: number) => `${v} HP`, highlight: 'high', glossary: 'hp' },
    { label: 'Torque', key: 'torque_nm', format: (v: number) => `${v} Nm`, glossary: 'torque' },
    { label: 'Vel. máxima', key: 'top_speed_kmh', format: (v: number) => `${v} km/h` },
    { label: 'Autonomía eléctrica', key: 'electric_range_km', format: (v: number) => v > 0 ? `${v} km` : '—', highlight: 'high', glossary: 'autonomia' },
    { label: 'Batería', key: 'battery_kwh', format: (v: number) => v > 0 ? `${v} kWh` : '—', glossary: 'kwh' },
    { label: 'Consumo ciudad', key: 'fuel_consumption_city_km_l', format: (v: number) => v > 0 ? `${v} km/L` : '—', highlight: 'high' },
    { label: 'Consumo carretera', key: 'fuel_consumption_highway_km_l', format: (v: number) => v > 0 ? `${v} km/L` : '—', highlight: 'high' },
    { label: 'Consumo mixto', format: (_, c) => (c.fuel_consumption_mixed_km_l ?? 0) > 0 ? `${c.fuel_consumption_mixed_km_l} km/L` : '—', highlight: 'high', glossary: 'consumo_mixto' },
    { label: 'Tanque', key: 'fuel_tank_liters', format: (v: number) => v > 0 ? `${v} L` : '—' },
    { label: 'Costo energía / 100 km', format: (_, c) => {
      const ch = getChargingCost(c);
      if (ch?.homePer100 != null) return `${formatPrice(ch.homePer100)} (carga hogar)`;
      const ice = getCombustionCostPer100(c);
      if (ice != null) return `${formatPrice(ice)} (combustible)`;
      return '—';
    }, highlight: 'low' },
  ];

  const safetySpecs: SpecRow[] = [
    { label: 'Airbags', key: 'airbags', format: (v: number) => `${v}`, highlight: 'high' },
    { label: 'ISOFIX', key: 'isofix', format: (v: boolean) => v ? '✓' : '✗' },
    { label: 'Latin NCAP', key: 'latin_ncap_stars', format: (v: number) => v > 0 ? '⭐'.repeat(Math.min(v, 5)) : 'Sin evaluar' },
    { label: 'Crash tests', format: (_, c) => (c.safety_ratings ?? []).length > 0 ? (c.safety_ratings ?? []).map(r => `${r.program}: ${r.stars}★ (${r.year})`).join(' · ') : '—' },
    { label: 'ADAS', format: (_, c) => (c.adas ?? []).length > 0 ? (c.adas ?? []).join(', ') : 'Sin ADAS' },
  ];

  const dimSpecs: SpecRow[] = [
    { label: 'Largo', key: 'length_mm', format: (v: number) => `${v} mm` },
    { label: 'Ancho', key: 'width_mm', format: (v: number) => `${v} mm` },
    { label: 'Alto', key: 'height_mm', format: (v: number) => `${v} mm` },
    { label: 'Dist. entre ejes', key: 'wheelbase_mm', format: (v: number) => `${v} mm` },
    { label: 'Altura libre', key: 'ground_clearance_mm', format: (v: number) => `${v} mm` },
    { label: 'Baúl', key: 'trunk_liters', format: (v: number) => v > 0 ? `${v} L` : 'N/A', highlight: 'high' },
  ];

  const techSpecs: SpecRow[] = [
    { label: 'Infotainment', format: (_, c) => (c.infotainment ?? []).length > 0 ? (c.infotainment ?? []).join(', ') : 'Básico' },
  ];

  const renderSpecGroup = (specs: SpecRow[], groupKey: string) =>
    specs
      .filter((spec) => !isRowEmpty(cars, spec))
      .map((spec, i) => {
        const displays = cars.map((car) => {
          if (spec.format) return spec.format(spec.key ? car[spec.key] : undefined, car);
          if (spec.key) return String(car[spec.key] ?? '');
          return '';
        });
        const differs = diffMode && new Set(displays).size > 1;
        return (
          <tr key={`${groupKey}-${i}`} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
            <td className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {spec.glossary ? <TermTip term={spec.glossary}>{spec.label}</TermTip> : spec.label}
            </td>
            {cars.map((car, idx) => {
              const display = displays[idx];
              const highlightField = spec.highlight === 'low' ? 'price' :
                spec.highlight === 'high' ? (spec.key || groupKey) : '';
              const winnerClass = getWinnerClass(car, highlightField);
              const diffClass = differs ? 'bg-amber-100/70 dark:bg-amber-900/20' : '';
              const valueTerm = spec.valueGlossary?.(displays[idx], car);
              return (
                <td key={car.id} className={`p-3 text-center text-sm ${winnerClass} ${diffClass}`}>
                  {valueTerm ? <TermTip term={valueTerm}>{display}</TermTip> : display}
                </td>
              );
            })}
          </tr>
        );
      });

  const exportImage = async () => {
    if (!tableRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(tableRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `comparacion-autolupa-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          🖨️ Guardar PDF
        </button>
        <button
          type="button"
          onClick={exportImage}
          disabled={exporting}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {exporting ? 'Generando…' : '🖼️ Exportar imagen'}
        </button>
        <button
          type="button"
          onClick={() => setDiffMode(v => !v)}
          aria-pressed={diffMode}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            diffMode
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {diffMode ? '✓ Resaltando diferencias' : 'Resaltar diferencias'}
        </button>
      </div>
      <div ref={tableRef} id="compare-table" className="overflow-x-auto">
      <table className="w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left p-4 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-400 w-44">
              Característica
            </th>
            {cars.map((car) => (
              <th key={car.id} className="p-4 bg-gray-50 dark:bg-gray-900 text-center relative min-w-[200px]">
                <button
                  type="button"
                  onClick={() => onRemove(car.id)}
                  aria-label={`Quitar ${car.brand} ${car.model} de la comparación`}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 flex items-center justify-center text-xs transition-colors"
                >
                  ×
                </button>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{car.brand}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{car.model}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-yellow-50/50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800">
            <td className="p-3 text-sm font-bold text-gray-700 dark:text-gray-300">🏆 Puntaje</td>
            {cars.map((car, idx) => {
              const score = scores[idx];
              const stars = '⭐'.repeat(score) + '☆'.repeat(7 - score);
              return (
                <td key={car.id} className={`p-3 text-center text-sm font-bold ${score === maxScore ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="text-base">{stars}</span>
                  <br />
                  <span>{score}/7</span>
                </td>
              );
            })}
          </tr>

          <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <td className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Versiones</td>
            {cars.map((car) => (
              <td key={car.id} className="p-3 text-center text-xs text-gray-600 dark:text-gray-400">
                {(car.versions ?? []).slice(0, 2).map((v, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-medium">{v.version}</span>
                    <span className="text-gray-400 dark:text-gray-500"> — {formatPrice(v.price)}</span>
                  </div>
                ))}
                {(car.versions ?? []).length > 2 && (
                  <div className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">+{(car.versions ?? []).length - 2} más</div>
                )}
              </td>
            ))}
          </tr>

          <SectionHeader title="Información General" icon="📋" />
          {renderSpecGroup(basicSpecs, 'basic')}

          <SectionHeader title="Rendimiento y Eficiencia" icon="⚡" />
          {renderSpecGroup(perfSpecs, 'perf')}

          <SectionHeader title="Seguridad" icon="🛡️" />
          {renderSpecGroup(safetySpecs, 'safety')}

          <SectionHeader title="Dimensiones" icon="📐" />
          {renderSpecGroup(dimSpecs, 'dim')}

          <SectionHeader title="Tecnología" icon="📱" />
          {renderSpecGroup(techSpecs, 'tech')}

          <tr className="border-b border-gray-50 dark:border-gray-700">
            <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</td>
            {cars.map((car) => (
              <td key={car.id} className="p-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                {car.description}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}
