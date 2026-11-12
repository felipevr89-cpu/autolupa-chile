import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SmartAsk } from '../components/Wizard/SmartAsk';

describe('SmartAsk con consulta inicial', () => {
  it('muestra resultados de inmediato al venir del buscador principal', () => {
    render(
      <MemoryRouter>
        <SmartAsk initialQuery="SUV familiar 7 asientos hasta 25 millones" onClose={vi.fn()} onSelectCar={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByDisplayValue('SUV familiar 7 asientos hasta 25 millones')).toBeInTheDocument();
    expect(screen.getByText('Entendí:')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Ver ficha de/ }).length).toBeGreaterThan(0);
  });

  it('las filas de resultado se abren con teclado', () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter>
        <SmartAsk initialQuery="pickup 4x4 diésel" onClose={vi.fn()} onSelectCar={onSelect} />
      </MemoryRouter>,
    );
    const row = screen.getAllByRole('button', { name: /Ver ficha de/ })[0];
    row.focus();
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
