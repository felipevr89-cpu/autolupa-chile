import { useState } from 'react';
import { Car } from '../../types';
import { formatPrice } from '../../data/brands';
import { calculateTCO, TCOResult } from '../../data/tco';
import { formatRatePercent } from '../../data/credit';

interface Props {
  car: Car;
}

export function TCOCalculator({ car }: Props) {
  const [loanMonths, setLoanMonths] = useState(48);
  const [kmPerMonth, setKmPerMonth] = useState(1000);

  const result: TCOResult = calculateTCO(car, loanMonths, kmPerMonth);
  const electrified = car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable';
  const noChargeData = electrified && (!car.battery_kwh || !car.electric_range_km);

  return (
    <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-indigo-100 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Costo Total de Propiedad (TCO)</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Plazo crédito</label>
          <select
            value={loanMonths}
            onChange={(e) => setLoanMonths(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value={12}>12 meses</option>
            <option value={24}>24 meses</option>
            <option value={36}>36 meses</option>
            <option value={48}>48 meses</option>
            <option value={60}>60 meses</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Km/mes</label>
          <select
            value={kmPerMonth}
            onChange={(e) => setKmPerMonth(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value={500}>500 km (poco uso)</option>
            <option value={800}>800 km (urbano)</option>
            <option value={1000}>1.000 km (uso normal)</option>
            <option value={1500}>1.500 km (uso intensivo)</option>
            <option value={2000}>2.000 km (muy intensivo)</option>
          </select>
        </div>
      </div>

      <div className="text-center mb-4 p-4 bg-white dark:bg-gray-600 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Costo mensual total estimado</p>
        <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatPrice(result.totalMonthly)}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
          Incluye cuota + SOAP + permiso + seguro + mantención + depreciación +{' '}
          {car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable' || car.fuel === 'hibrido'
            ? 'carga eléctrica'
            : 'combustible'}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {result.breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-600 rounded-lg">
            <div className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.monthly > 0 ? formatPrice(item.monthly) : '—'}
            </span>
          </div>
        ))}
      </div>

      {noChargeData && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center mb-3">
          Sin datos de autonomía/batería para este eléctrico: la carga se muestra como '—'.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 bg-white dark:bg-gray-600 rounded-lg text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Anual</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(result.totalAnnual)}</p>
        </div>
        <div className="p-2.5 bg-white dark:bg-gray-600 rounded-lg text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">5 años</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(result.total5Years)}</p>
        </div>
        <div className="p-2.5 bg-white dark:bg-gray-600 rounded-lg text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">CAE ref.</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatePercent(result.loanRate)}</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">
        Estimaciones con tasas de mercado Chile 2026 (crédito automotriz 0,7% a 1,5% mensual según banco y perfil;
        CAE ref. calculado sólo con el interés, sin seguros ni gastos; carga 80% hogar / 20% rápida;
        depreciación según antigüedad). Valores referenciales, no constituyen oferta de crédito.
      </p>
    </div>
  );
}
