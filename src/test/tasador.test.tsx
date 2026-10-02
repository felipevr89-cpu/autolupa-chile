import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { TasarAuto } from '../pages/TasarAuto';
import { carsData } from '../data/brands';
import {
  estimarValor,
  getDepreciacionAcumulada,
  getFactorEstado,
  getFactorKilometraje,
} from '../data/tasador';

const currentYear = new Date().getFullYear();
const car = carsData.find(candidate => candidate.brand === 'Toyota' && candidate.model === 'Corolla') ?? carsData[0];

function estimate(overrides: Partial<Parameters<typeof estimarValor>[0]> = {}) {
  return estimarValor({
    brand: car.brand,
    model: car.model,
    year: currentYear - 5,
    km: 90_000,
    estado: 'bueno',
    ...overrides,
  });
}

describe('motor de tasación', () => {
  it('deprecia acumuladamente y de forma monotónica', () => {
    expect(getDepreciacionAcumulada(0)).toBe(1);
    expect(getDepreciacionAcumulada(1)).toBeCloseTo(0.82, 5);
    expect(getDepreciacionAcumulada(5)).toBeLessThan(getDepreciacionAcumulada(4));
    expect(getDepreciacionAcumulada(10)).toBeLessThan(getDepreciacionAcumulada(5));
    expect(getDepreciacionAcumulada(10)).toBeGreaterThan(0);
  });

  it('compara el kilometraje contra los 15.000 km anuales esperados', () => {
    expect(getFactorKilometraje(15_000, 1)).toBeCloseTo(1, 5);
    expect(getFactorKilometraje(75_000, 5)).toBeCloseTo(1, 5);
    expect(getFactorKilometraje(150_000, 5)).toBeCloseTo(0.85, 5);
    expect(getFactorKilometraje(0, 5)).toBeCloseTo(1.015, 5);
  });

  it('ordena los estados: excelente > bueno > regular', () => {
    expect(getFactorEstado('excelente')).toBeGreaterThan(getFactorEstado('bueno'));
    expect(getFactorEstado('bueno')).toBeGreaterThan(getFactorEstado('regular'));
  });

  it('estima valor, rango y comparables para un modelo del catálogo', () => {
    const result = estimate();
    expect(result).not.toBeNull();
    expect(result!.valorEstimado).toBeGreaterThan(0);
    expect(result!.min).toBeLessThan(result!.valorEstimado);
    expect(result!.max).toBeGreaterThan(result!.valorEstimado);
    expect(result!.comparables.length).toBeGreaterThan(0);
    expect(result!.comparables.length).toBeLessThanOrEqual(3);
    expect(result!.comparables.every(comparable => comparable.id !== result!.car.id)).toBe(true);
    expect(new Set(result!.comparables.map(comparable => comparable.id)).size).toBe(result!.comparables.length);
    expect(result!.precioLista).toBeGreaterThanOrEqual(result!.valorEstimado);
  });

  it('baja el valor por antigüedad, kilometraje y estado', () => {
    const nuevo = estimate({ year: currentYear, km: 0 });
    const viejo = estimate({ year: currentYear - 10, km: 60_000 });
    expect(viejo!.valorEstimado).toBeLessThan(nuevo!.valorEstimado);

    const recorrido = estimate({ year: currentYear - 5, km: 300_000 });
    const poco = estimate({ year: currentYear - 5, km: 10_000 });
    expect(recorrido!.valorEstimado).toBeLessThan(poco!.valorEstimado);

    const impecable = estimate({ estado: 'excelente' });
    const gastado = estimate({ estado: 'regular' });
    expect(impecable!.valorEstimado).toBeGreaterThan(gastado!.valorEstimado);
  });

  it('devuelve null cuando el modelo no está en el catálogo', () => {
    expect(estimate({ brand: 'Marca Inexistente', model: 'Otro' })).toBeNull();
  });
});

function renderTasar() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/tasar-auto']}>
        <TasarAuto />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('página /tasar-auto', () => {
  it('calcula el valor y ofrece publicar a ese precio', async () => {
    const user = userEvent.setup();
    renderTasar();

    await user.selectOptions(screen.getByLabelText('Marca'), car.brand);
    await user.selectOptions(screen.getByLabelText('Modelo'), car.model);
    await user.selectOptions(screen.getByLabelText('Año'), String(currentYear - 4));
    await user.type(screen.getByLabelText('Kilómetros'), '85000');
    await user.click(screen.getByRole('button', { name: 'Calcular valor' }));

    expect(await screen.findByText(/rango de venta sugerido/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /modelos nuevos de precio parecido/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /publicar mi auto gratis/i })).toHaveAttribute('href', '/publicar-auto');
    expect(screen.getByText(/no es un peritaje ni una tasación oficial/i)).toBeInTheDocument();
  });

  it('pide los datos obligatorios antes de calcular', async () => {
    const user = userEvent.setup();
    renderTasar();

    await user.click(screen.getByRole('button', { name: 'Calcular valor' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/marca y el modelo/i);
    expect(screen.queryByText(/rango de venta sugerido/i)).not.toBeInTheDocument();
  });

  it('limpia el modelo al cambiar de marca', async () => {
    const user = userEvent.setup();
    renderTasar();

    await user.selectOptions(screen.getByLabelText('Marca'), car.brand);
    await user.selectOptions(screen.getByLabelText('Modelo'), car.model);
    await user.selectOptions(screen.getByLabelText('Marca'), 'Kia');
    expect(screen.getByLabelText('Modelo')).toHaveValue('');
  });
});
