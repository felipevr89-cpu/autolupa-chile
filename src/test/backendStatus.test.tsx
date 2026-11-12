import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceNotice } from '../components/Used/ServiceNotice';
import { DemoListings } from '../components/Used/DemoListings';

describe('degradación del marketplace', () => {
  it('explica la caída y ofrece salidas útiles', () => {
    render(<MemoryRouter><ServiceNotice context="listings" /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('no están disponibles');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver autos nuevos' })).toHaveAttribute('href', '/autos');
  });

  it('el aviso de publicación no promete un formulario', () => {
    render(<MemoryRouter><ServiceNotice context="publish" /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('pausada temporalmente');
  });

  it('los ejemplos aclaran que el servicio está caído y no que no hay avisos', () => {
    render(<MemoryRouter><DemoListings reason="unavailable" /></MemoryRouter>);
    expect(screen.getByText(/se restablece el servicio/)).toBeInTheDocument();
    expect(screen.queryByText(/Aún no hay avisos reales/)).not.toBeInTheDocument();
  });
});
