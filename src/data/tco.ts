import { Car } from '../types';
import { HOME_KWH_CLP, FAST_KWH_CLP, GASOLINE_CLP_PER_L, DIESEL_CLP_PER_L } from './energyCosts';
import { TYPICAL_MONTHLY_RATE, annualEffectiveRate, monthlyPayment } from './credit';

const LOAN_RATE_MONTHLY = TYPICAL_MONTHLY_RATE;
const LOAN_RATE_ANNUAL = annualEffectiveRate(TYPICAL_MONTHLY_RATE);

/** Mixed charging: ~80% hogar y ~20% carga rápida pública */
const HOME_CHARGE_SHARE = 0.8;
const AVG_KWH_CLP = HOME_KWH_CLP * HOME_CHARGE_SHARE + FAST_KWH_CLP * (1 - HOME_CHARGE_SHARE);

/** SOAP 2026 (varies by vehicle value, simplified) */
function getSoapAnual(vehiclePrice: number): number {
  if (vehiclePrice <= 8_000_000) return 32_000;
  if (vehiclePrice <= 15_000_000) return 48_000;
  if (vehiclePrice <= 25_000_000) return 65_000;
  return 85_000;
}

/**
 * Permiso de circulación (estimador basado en la fórmula oficial del SII).
 * Escala progresiva y acumulativa de la FAQ 001.170.5079.007:
 *  - hasta 60 UTM: 1%; 60-120: 2%; 120-250: 3%; 250-400: 4%; sobre 400: 4,5%
 *  - mínimo: media UTM (0,5 UTM)
 * Base = tasación fiscal. Para autos de años anteriores se aproxima la
 * tasación SII depreciando el precio comercial (~10% anual). Los vehículos
 * eléctricos e híbridos enchufables (año >= 2021) pagan el 25% del impuesto
 * (Ley 21.505, beneficio vigente para permisos 2026).
 */
const UTM_JANUARY_2026_CLP = 69_751;
const EV_DISCOUNT_RATE = 0.25;

const TASACION_RANGE_UTM = [
  { uptoU: 60, rate: 0.01 },
  { uptoU: 120, rate: 0.02 },
  { uptoU: 250, rate: 0.03 },
  { uptoU: 400, rate: 0.04 },
  { uptoU: Infinity, rate: 0.045 },
];

function getPermisoCirculacion(price: number, year: number, fuel: Car['fuel']): number {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  const tasacion = age === 0 ? price : price * Math.pow(0.9, age);

  let permiso = 0;
  let applied = 0;
  for (const range of TASACION_RANGE_UTM) {
    const upper = Math.min(tasacion, range.uptoU * UTM_JANUARY_2026_CLP);
    if (upper > applied) {
      permiso += (upper - applied) * range.rate;
      applied = upper;
    }
  }

  const minimo = 0.5 * UTM_JANUARY_2026_CLP;
  const annual = Math.max(minimo, permiso);

  const isElectrified = fuel === 'electrico' || fuel === 'hibrido_enchufable';
  const discounted = isElectrified && year >= 2021 ? annual * EV_DISCOUNT_RATE : annual;
  return Math.round(discounted);
}

/** Estimated annual insurance (1.5% of vehicle value for full coverage) */
function getInsuranceAnual(price: number): number {
  return Math.round(price * 0.015);
}

/** Annual maintenance cost estimate */
function getMaintenanceAnual(car: Car): number {
  if (car.fuel === 'electrico') return 200_000;
  if (car.fuel === 'hibrido' || car.fuel === 'hibrido_enchufable') return 400_000;
  if (car.fuel === 'diesel') return 550_000;
  return 500_000;
}

/** Annual depreciation estimate (tasa según antigüedad del vehículo) */
function getDepreciationAnual(price: number, year: number): number {
  const age = Math.max(0, new Date().getFullYear() - year);
  const rate = age <= 1 ? 0.18 : age <= 3 ? 0.12 : age <= 6 ? 0.09 : 0.07;
  return Math.round(price * rate);
}

/** Monthly fuel cost for combustion/hybrid */
function getMonthlyFuelCost(car: Car, kmPerMonth: number): number {
  const consumption = car.fuel_consumption_mixed_km_l;
  if (!consumption || consumption <= 0) return 0;
  const pricePerL = car.fuel === 'diesel' ? DIESEL_CLP_PER_L : GASOLINE_CLP_PER_L;
  const litersPerMonth = kmPerMonth / consumption;
  return Math.round(litersPerMonth * pricePerL);
}

/** Monthly charging cost for EV/PHEV (hogar + carga rápida) */
function getMonthlyChargingCost(car: Car, kmPerMonth: number): number {
  const range = car.electric_range_km;
  const battery = car.battery_kwh;
  if (!range || !battery || range <= 0) return 0;
  const chargingPerKm = battery / range;
  const kwhPerMonth = kmPerMonth * chargingPerKm;
  return Math.round(kwhPerMonth * AVG_KWH_CLP);
}

export interface TCOResult {
  price: number;
  monthlyLoan: number;
  loanMonths: number;
  loanRate: number;
  soapAnual: number;
  permisoCirculacion: number;
  insuranceAnual: number;
  maintenanceAnual: number;
  depreciacionAnual: number;
  fuelOrChargeMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  total5Years: number;
  breakdown: { label: string; monthly: number; icon: string }[];
}

export function calculateTCO(
  car: Car,
  loanMonths: number = 48,
  kmPerMonth: number = 1000
): TCOResult {
  const price = car.price;

  const monthlyLoan = loanMonths > 0 ? Math.round(monthlyPayment(price, LOAN_RATE_MONTHLY, loanMonths)) : 0;

  const soapAnual = getSoapAnual(price);
  const permisoCirculacion = getPermisoCirculacion(price, car.year, car.fuel);
  const insuranceAnual = getInsuranceAnual(price);
  const maintenanceAnual = getMaintenanceAnual(car);
  const depreciacionAnual = getDepreciationAnual(price, car.year);

  let fuelOrChargeMonthly = 0;
  if (car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable') {
    fuelOrChargeMonthly = getMonthlyChargingCost(car, kmPerMonth);
  } else if (car.fuel === 'hibrido') {
    // Hybrid: 50% electric + 50% combustion
    const electricPart = getMonthlyChargingCost(car, kmPerMonth * 0.5);
    const combustionPart = getMonthlyFuelCost(car, kmPerMonth * 0.5);
    fuelOrChargeMonthly = electricPart + combustionPart;
  } else {
    fuelOrChargeMonthly = getMonthlyFuelCost(car, kmPerMonth);
  }

  const monthlySoap = Math.round(soapAnual / 12);
  const monthlyPermiso = Math.round(permisoCirculacion / 12);
  const monthlyInsurance = Math.round(insuranceAnual / 12);
  const monthlyMaintenance = Math.round(maintenanceAnual / 12);
  const monthlyDepreciation = Math.round(depreciacionAnual / 12);

  const totalMonthly =
    monthlyLoan + monthlySoap + monthlyPermiso + monthlyInsurance + monthlyMaintenance + fuelOrChargeMonthly + monthlyDepreciation;

  const totalAnnual = totalMonthly * 12;
  const total5Years = totalAnnual * 5;

  const breakdown = [
    { label: 'Cuota crédito', monthly: monthlyLoan, icon: '🏦' },
    { label: 'SOAP', monthly: monthlySoap, icon: '🛡️' },
    { label: 'Permiso circulación', monthly: monthlyPermiso, icon: '📋' },
    { label: 'Seguro', monthly: monthlyInsurance, icon: '🔒' },
    { label: 'Mantención', monthly: monthlyMaintenance, icon: '🔧' },
    { label: 'Depreciación', monthly: monthlyDepreciation, icon: '📉' },
    {
      label: car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable' || car.fuel === 'hibrido'
        ? 'Carga eléctrica'
        : 'Combustible',
      monthly: fuelOrChargeMonthly,
      icon: car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable' ? '⚡' : '⛽',
    },
  ];

  return {
    price,
    monthlyLoan,
    loanMonths,
    loanRate: LOAN_RATE_ANNUAL,
    soapAnual,
    permisoCirculacion,
    insuranceAnual,
    maintenanceAnual,
    depreciacionAnual,
    fuelOrChargeMonthly,
    totalMonthly,
    totalAnnual,
    total5Years,
    breakdown,
  };
}
