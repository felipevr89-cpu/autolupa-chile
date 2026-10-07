import { useState } from 'react';
import { Car } from '../../types';
import { formatPrice } from '../../data/brands';
import {
  BANK_DOWN_PAYMENT_MAX,
  BANK_DOWN_PAYMENT_MIN,
  MAX_DOWN_PAYMENT_PERCENT,
  MIN_DOWN_PAYMENT_PERCENT,
  PLAZOS,
  RATE_SCENARIOS,
  formatRatePercent,
  simulateCredit,
} from '../../data/credit';

interface Props {
  car: Car;
}

export function CreditCalc({ car }: Props) {
  const [piePercent, setPiePercent] = useState(20);
  const [plazo, setPlazo] = useState(36);
  const [scenarioId, setScenarioId] = useState('tipica');

  const scenario = RATE_SCENARIOS.find((s) => s.id === scenarioId) ?? RATE_SCENARIOS[1];
  const sim = simulateCredit(car.price, piePercent, plazo, scenario.monthlyRate);

  const pieHint =
    sim.downPaymentPercent < BANK_DOWN_PAYMENT_MIN
      ? 'Bajo: sólo financieras o automotoras (los bancos piden 20–25% de pie)'
      : sim.downPaymentPercent <= BANK_DOWN_PAYMENT_MAX
        ? 'Rango típico de banco (20–25% de pie)'
        : 'Sobre el mínimo bancario: baja la cuota y el interés total';

  const quoteText = `Hola, quiero cotizar un crédito automotriz para un ${car.brand} ${car.model} ${car.year} (${formatPrice(car.price)}): pie de ${formatPrice(sim.downPayment)} (${sim.downPaymentPercent}%), ${sim.months} meses y cuota de ${formatPrice(sim.monthlyPayment)} al mes. Referencia AutoLupa, CAE ${formatRatePercent(sim.effectiveAnnualRate)}.`;
  const quoteUrl = `https://wa.me/?text=${encodeURIComponent(quoteText)}`;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border border-blue-100 dark:border-gray-600">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        Calculadora de Crédito
      </h3>

      <div className="mb-4">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">
          Tasa mensual de mercado 2026: {formatRatePercent(scenario.monthlyRate)}
        </label>
        <div className="flex gap-2">
          {RATE_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                scenario.id === s.id
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">
            Pie inicial: {sim.downPaymentPercent}% ({formatPrice(sim.downPayment)})
          </label>
          <input
            type="range"
            min={MIN_DOWN_PAYMENT_PERCENT}
            max={MAX_DOWN_PAYMENT_PERCENT}
            step={5}
            value={sim.downPaymentPercent}
            onChange={(e) => setPiePercent(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{pieHint}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Plazo:</label>
          <div className="flex gap-2">
            {PLAZOS.map((p) => (
              <button
                key={p}
                onClick={() => setPlazo(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  plazo === p
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
                }`}
              >
                {p}m
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-600 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cuota mensual</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(sim.monthlyPayment)}</p>
        </div>
        <div className="bg-white dark:bg-gray-600 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total pagado (pie + cuotas)</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(sim.totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-gray-600 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Costo del crédito</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(sim.creditCost)}</p>
        </div>
        <div className="bg-white dark:bg-gray-600 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CAE referencia</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatRatePercent(sim.effectiveAnnualRate)}</p>
        </div>
      </div>

      <a
        href={quoteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
      >
        Pide tu cotización
      </a>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
        Simulación referencial con tasas de mercado 2026 (0,7% a 1,5% mensual según banco y perfil; pie mínimo 10%,
        plazos de 12 a 60 meses). El CAE se calcula sólo con el interés, sin seguros ni gastos: no constituye oferta de
        crédito, la tasa final la define el banco o financiera tras evaluar tu perfil.
      </p>
    </div>
  );
}
