export interface RateScenario {
  id: string;
  label: string;
  monthlyRate: number;
}

export const MARKET_MONTHLY_RATE_MIN = 0.007;
export const MARKET_MONTHLY_RATE_MAX = 0.015;

export const RATE_SCENARIOS: RateScenario[] = [
  { id: 'baja', label: 'Mejor tasa', monthlyRate: MARKET_MONTHLY_RATE_MIN },
  { id: 'tipica', label: 'Tasa típica', monthlyRate: 0.01 },
  { id: 'alta', label: 'Tasa alta', monthlyRate: MARKET_MONTHLY_RATE_MAX },
];

export const TYPICAL_MONTHLY_RATE = 0.01;

export const MIN_DOWN_PAYMENT_PERCENT = 10;
export const MAX_DOWN_PAYMENT_PERCENT = 50;
export const BANK_DOWN_PAYMENT_MIN = 20;
export const BANK_DOWN_PAYMENT_MAX = 25;

export const MIN_MONTHS = 12;
export const MAX_MONTHS = 60;
export const DEFAULT_MONTHS = 48;
export const PLAZOS = [12, 24, 36, 48, 60];

export function annualEffectiveRate(monthlyRate: number): number {
  return Math.pow(1 + monthlyRate, 12) - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function formatRatePercent(rate: number): string {
  return `${(rate * 100).toFixed(1).replace('.', ',')}%`;
}

export interface CreditSimulation {
  price: number;
  downPaymentPercent: number;
  downPayment: number;
  principal: number;
  months: number;
  monthlyRate: number;
  monthlyPayment: number;
  totalPaid: number;
  creditCost: number;
  effectiveAnnualRate: number;
}

export function simulateCredit(
  price: number,
  downPaymentPercent: number,
  months: number,
  monthlyRate: number
): CreditSimulation {
  const percent = clamp(downPaymentPercent, MIN_DOWN_PAYMENT_PERCENT, MAX_DOWN_PAYMENT_PERCENT);
  const term = Math.round(clamp(months, MIN_MONTHS, MAX_MONTHS));
  const downPayment = Math.round(price * (percent / 100));
  const principal = price - downPayment;
  const cuota = Math.round(monthlyPayment(principal, monthlyRate, term));
  const totalPaid = downPayment + cuota * term;

  return {
    price,
    downPaymentPercent: percent,
    downPayment,
    principal,
    months: term,
    monthlyRate,
    monthlyPayment: cuota,
    totalPaid,
    creditCost: totalPaid - price,
    effectiveAnnualRate: annualEffectiveRate(monthlyRate),
  };
}
