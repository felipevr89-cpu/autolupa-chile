import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SafetyBanner } from '../components/Trust/SafetyBanner';

function renderBanner(context?: 'used' | 'new') {
  return render(
    <MemoryRouter>
      <SafetyBanner context={context} />
    </MemoryRouter>,
  );
}

describe('banner de seguridad en fichas', () => {
  it('recomienda verificar documentos antes de transferir en avisos usados', () => {
    renderBanner('used');
    expect(screen.getByRole('note', { name: /recomendaciones de seguridad/i })).toBeInTheDocument();
    expect(screen.getByText(/certificado de anotaciones vigentes/i)).toBeInTheDocument();
    expect(screen.getByText(/nunca transfieras ni deposites/i)).toBeInTheDocument();
    expect(screen.queryByText(/cotización por escrito/i)).not.toBeInTheDocument();
  });

  it('ajusta los consejos cuando la ficha es de auto nuevo', () => {
    renderBanner('new');
    expect(screen.getByText(/cotización por escrito/i)).toBeInTheDocument();
    expect(screen.queryByText(/certificado de anotaciones vigentes/i)).not.toBeInTheDocument();
  });

  it('enlaza al glosario desde la ficha', () => {
    renderBanner();
    const link = screen.getByRole('link', { name: /revisa el glosario/i });
    expect(link).toHaveAttribute('href', '/glosario');
  });
});
