import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompareTable } from '../components/Compare/CompareTable';
import { carsData } from '../data/brands';

const [carA, carB] = carsData;

function renderTable(cars: typeof carsData, onRemove: (id: number) => void = () => {}) {
  return render(
    <MemoryRouter>
      <CompareTable cars={cars} onRemove={onRemove} />
    </MemoryRouter>
  );
}

describe('<CompareTable />', () => {
  it('renders the selected cars side by side', () => {
    renderTable([carA, carB]);
    expect(screen.getAllByText(carA.brand).length).toBeGreaterThan(0);
    expect(screen.getAllByText(carB.brand).length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no cars', () => {
    renderTable([]);
    expect(screen.getByText(/Sin vehículos para comparar/i)).toBeInTheDocument();
  });

  it('calls onRemove with the car id when the remove button is clicked', () => {
    const onRemove = vi.fn();
    renderTable([carA, carB], onRemove);
    const removeButton = screen.getByLabelText(
      new RegExp(`Quitar ${carA.brand} ${carA.model}`, 'i')
    );
    removeButton.click();
    expect(onRemove).toHaveBeenCalledWith(carA.id);
  });

  it('renders the diff toggle button', () => {
    renderTable([carA, carB]);
    expect(
      screen.getByRole('button', { name: /Resaltar diferencias/i })
    ).toBeInTheDocument();
  });
});
