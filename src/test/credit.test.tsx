import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  BANK_DOWN_PAYMENT_MAX,
  BANK_DOWN_PAYMENT_MIN,
  MARKET_MONTHLY_RATE_MAX,
  MARKET_MONTHLY_RATE_MIN,
  MAX_MONTHS,
  MIN_DOWN_PAYMENT_PERCENT,
  MIN_MONTHS,
  RATE_SCENARIOS,
  TYPICAL_MONTHLY_RATE,
  annualEffectiveRate,
  formatRatePercent,
  monthlyPayment,
  simulateCredit,
} from '../data/credit';
import { calculateTCO } from '../data/tco';
import { CreditCalc } from '../components/Calculator/CreditCalc';
import { Car } from '../types';

const testCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2026,
  price: 18_000_000,
  type: 'sedan',
  fuel: 'gasolina',
  transmission: 'automatica',
  seats: 5,
  traction: '4x2',
  description: 'Sedán familiar',
  hp: 140,
  torque_nm: 175,
  airbags: 6,
  origin_country: 'Japón',
  fuel_consumption_mixed_km_l: 16,
};

describe('tasas de crédito de mercado 2026', () => {
  it('mantiene los escenarios dentro del rango publicado (0,7% a 1,5% mensual)', () => {
    expect(RATE_SCENARIOS).toHaveLength(3);
    for (const scenario of RATE_SCENARIOS) {
      expect(scenario.monthlyRate).toBeGreaterThanOrEqual(MARKET_MONTHLY_RATE_MIN);
      expect(scenario.monthlyRate).toBeLessThanOrEqual(MARKET_MONTHLY_RATE_MAX);
    }
    const rates = RATE_SCENARIOS.map((s) => s.monthlyRate);
    expect([...rates].sort((a, b) => a - b)).toEqual(rates);
  });

  it('convierte la tasa mensual en CAE efectivo anual', () => {
    expect(annualEffectiveRate(MARKET_MONTHLY_RATE_MIN)).toBeCloseTo(0.0873, 3);
    expect(annualEffectiveRate(TYPICAL_MONTHLY_RATE)).toBeCloseTo(0.1268, 3);
    expect(annualEffectiveRate(MARKET_MONTHLY_RATE_MAX)).toBeCloseTo(0.1956, 3);
    expect(annualEffectiveRate(MARKET_MONTHLY_RATE_MAX)).toBeGreaterThan(annualEffectiveRate(MARKET_MONTHLY_RATE_MIN));
  });

  it('formatea el porcentaje con coma decimal', () => {
    expect(formatRatePercent(0.127)).toBe('12,7%');
    expect(formatRatePercent(0.0873)).toBe('8,7%');
  });

  it('calcula la cuota francesa y lineal cuando la tasa es 0', () => {
    const expected = (14_400_000 * 0.01 * Math.pow(1.01, 36)) / (Math.pow(1.01, 36) - 1);
    expect(monthlyPayment(14_400_000, 0.01, 36)).toBeCloseTo(expected, 2);
    expect(monthlyPayment(1_200_000, 0, 12)).toBe(100_000);
    expect(monthlyPayment(1_200_000, 0.01, 0)).toBe(0);
  });
});

describe('simulateCredit', () => {
  it('desglosa pie, monto, total pagado y costo del crédito de forma consistente', () => {
    const sim = simulateCredit(18_000_000, 20, 36, TYPICAL_MONTHLY_RATE);
    expect(sim.downPayment).toBe(3_600_000);
    expect(sim.principal).toBe(14_400_000);
    expect(sim.monthlyPayment).toBeGreaterThan(0);
    expect(sim.totalPaid).toBe(sim.downPayment + sim.monthlyPayment * 36);
    expect(sim.creditCost).toBe(sim.totalPaid - sim.price);
    expect(sim.creditCost).toBeGreaterThan(0);
    expect(sim.totalPaid).toBeGreaterThan(sim.price);
    expect(sim.effectiveAnnualRate).toBeCloseTo(0.1268, 3);
  });

  it('exige el pie mínimo de 10% (financieras) y respeta el tope del slider', () => {
    expect(simulateCredit(18_000_000, 0, 36, TYPICAL_MONTHLY_RATE).downPaymentPercent).toBe(MIN_DOWN_PAYMENT_PERCENT);
    expect(simulateCredit(18_000_000, 5, 36, TYPICAL_MONTHLY_RATE).downPaymentPercent).toBe(MIN_DOWN_PAYMENT_PERCENT);
    expect(simulateCredit(18_000_000, 90, 36, TYPICAL_MONTHLY_RATE).downPaymentPercent).toBe(50);
    expect(simulateCredit(18_000_000, 25, 36, TYPICAL_MONTHLY_RATE).downPaymentPercent).toBe(25);
    expect(BANK_DOWN_PAYMENT_MIN).toBe(20);
    expect(BANK_DOWN_PAYMENT_MAX).toBe(25);
  });

  it('respeta los plazos de mercado de 12 a 60 meses', () => {
    expect(simulateCredit(18_000_000, 20, 3, TYPICAL_MONTHLY_RATE).months).toBe(MIN_MONTHS);
    expect(simulateCredit(18_000_000, 20, 96, TYPICAL_MONTHLY_RATE).months).toBe(MAX_MONTHS);
    const cuota12 = simulateCredit(18_000_000, 20, 12, TYPICAL_MONTHLY_RATE).monthlyPayment;
    const cuota60 = simulateCredit(18_000_000, 20, 60, TYPICAL_MONTHLY_RATE).monthlyPayment;
    expect(cuota12).toBeGreaterThan(cuota60);
  });

  it('un pie más grande baja la cuota y el costo del crédito', () => {
    const pocoPie = simulateCredit(18_000_000, 10, 48, TYPICAL_MONTHLY_RATE);
    const muchoPie = simulateCredit(18_000_000, 50, 48, TYPICAL_MONTHLY_RATE);
    expect(muchoPie.monthlyPayment).toBeLessThan(pocoPie.monthlyPayment);
    expect(muchoPie.creditCost).toBeLessThan(pocoPie.creditCost);
  });

  it('una tasa más alta encarece el crédito', () => {
    const baja = simulateCredit(18_000_000, 20, 48, MARKET_MONTHLY_RATE_MIN);
    const alta = simulateCredit(18_000_000, 20, 48, MARKET_MONTHLY_RATE_MAX);
    expect(alta.monthlyPayment).toBeGreaterThan(baja.monthlyPayment);
    expect(alta.creditCost).toBeGreaterThan(baja.creditCost);
  });

  it('el TCO usa la tasa típica de mercado 2026', () => {
    const result = calculateTCO(testCar, 48, 1000);
    expect(result.loanRate).toBeCloseTo(annualEffectiveRate(TYPICAL_MONTHLY_RATE), 5);
    expect(result.monthlyLoan).toBe(
      Math.round(monthlyPayment(testCar.price, TYPICAL_MONTHLY_RATE, 48))
    );
  });
});

describe('CreditCalc (UI)', () => {
  it('muestra cuota, total pagado, costo y CAE de referencia', () => {
    render(<CreditCalc car={testCar} />);
    expect(screen.getByText('Cuota mensual')).toBeInTheDocument();
    expect(screen.getByText(/Total pagado/)).toBeInTheDocument();
    expect(screen.getByText('Costo del crédito')).toBeInTheDocument();
    expect(screen.getByText('CAE referencia')).toBeInTheDocument();
    expect(screen.getByText('12,7%')).toBeInTheDocument();
    expect(screen.getByText(/pie mínimo 10%/i)).toBeInTheDocument();
  });

  it('ofrece la CTA de cotización por WhatsApp con la simulación', () => {
    render(<CreditCalc car={testCar} />);
    const cta = screen.getByRole('link', { name: /pide tu cotización/i });
    expect(cta).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(decodeURIComponent(cta.getAttribute('href') ?? '')).toContain('Toyota Corolla');
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('recalcula la cuota al cambiar de escenario de tasa', () => {
    render(<CreditCalc car={testCar} />);
    const before = screen.getByText(/Total pagado/).nextElementSibling?.textContent;
    fireEvent.click(screen.getByRole('button', { name: /tasa alta/i }));
    const after = screen.getByText(/Total pagado/).nextElementSibling?.textContent;
    expect(after).not.toBe(before);
    expect(screen.getAllByText('19,6%').length).toBeGreaterThan(0);
  });
});
