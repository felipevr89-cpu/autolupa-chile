import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MultiSelectDropdown } from '../components/Filters/MultiSelectDropdown';

const options = [
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Honda', label: 'Honda' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Citroen', label: 'Citroën' },
];

function open(ui: React.ReactElement, name = /todas las marcas/i) {
  render(ui);
  fireEvent.click(screen.getByRole('button', { name }));
}

describe('MultiSelectDropdown con buscador', () => {
  it('filtra por letra: "h" muestra Hyundai y Honda pero no Toyota', () => {
    open(<MultiSelectDropdown label="Marca" options={options} selected={[]} onChange={vi.fn()} placeholder="Todas las marcas" searchable />);

    fireEvent.change(screen.getByLabelText('Buscar en Marca'), { target: { value: 'h' } });

    expect(screen.getByRole('button', { name: 'Hyundai' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Honda' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Toyota' })).toBeNull();
  });

  it('ignora tildes y mayúsculas al buscar', () => {
    open(<MultiSelectDropdown label="Marca" options={options} selected={[]} onChange={vi.fn()} placeholder="Todas las marcas" searchable />);

    fireEvent.change(screen.getByLabelText('Buscar en Marca'), { target: { value: 'citroen' } });

    expect(screen.getByRole('button', { name: 'Citroën' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Toyota' })).toBeNull();
  });

  it('avisa cuando no hay resultados', () => {
    open(<MultiSelectDropdown label="Marca" options={options} selected={[]} onChange={vi.fn()} placeholder="Todas las marcas" searchable />);

    fireEvent.change(screen.getByLabelText('Buscar en Marca'), { target: { value: 'zzz' } });

    expect(screen.getByText(/sin resultados para "zzz"/i)).toBeInTheDocument();
  });

  it('permite seleccionar una opción filtrada', () => {
    const onChange = vi.fn();
    open(<MultiSelectDropdown label="Marca" options={options} selected={[]} onChange={onChange} placeholder="Todas las marcas" searchable />);

    fireEvent.change(screen.getByLabelText('Buscar en Marca'), { target: { value: 'hon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Honda' }));

    expect(onChange).toHaveBeenCalledWith(['Honda']);
  });

  it('el dropdown sin buscador no muestra el campo de búsqueda', () => {
    open(<MultiSelectDropdown label="Tipo de vehículo" options={options} selected={[]} onChange={vi.fn()} placeholder="Todos los tipos" />, /todos los tipos/i);

    expect(screen.queryByLabelText('Buscar en Tipo de vehículo')).toBeNull();
  });
});
