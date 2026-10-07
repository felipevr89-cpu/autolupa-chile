import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AutoLupaSeal } from '../components/Trust/AutoLupaSeal';
import { DocumentLinks } from '../components/Trust/DocumentLinks';
import { Footer } from '../components/Footer';
import { Faq } from '../pages/Faq';

function renderView(ui: React.ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>,
  );
}

describe('sello AutoLupa', () => {
  it('declara revisión de moderación, contacto directo y datos del vendedor', () => {
    renderView(<AutoLupaSeal />);
    expect(screen.getByText(/sello autolupa/i)).toBeInTheDocument();
    expect(screen.getByText(/revisada por moderación/i)).toBeInTheDocument();
    expect(screen.getByText(/sin comisión, sin intermediarios/i)).toBeInTheDocument();
    expect(screen.getByText(/declarados por el vendedor/i)).toBeInTheDocument();
    expect(screen.queryByText(/correo del vendedor verificado/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /estafas/i })).toHaveAttribute('href', '/faq');
  });

  it('suma el correo verificado cuando el vendedor lo tiene', () => {
    renderView(<AutoLupaSeal emailVerified />);
    expect(screen.getByText('Correo del vendedor verificado.')).toBeInTheDocument();
  });
});

describe('enlaces de historial y transferencia', () => {
  it('apunta al certificado de anotaciones, la guía de transferencia y el checklist', () => {
    renderView(<DocumentLinks />);
    expect(screen.getByText('Historial y transferencia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /anotaciones vigentes/i })).toHaveAttribute(
      'href',
      'https://www.registrocivil.cl/',
    );
    expect(screen.getByRole('link', { name: /guía de transferencia/i })).toHaveAttribute(
      'href',
      '/blog/transferencia-vehiculo-chile',
    );
    expect(screen.getByRole('link', { name: /checklist de revisión/i })).toHaveAttribute(
      'href',
      '/blog/revision-auto-usado-checklist',
    );
  });
});

describe('preguntas frecuentes de seguridad', () => {
  it('responde las dudas antiestafas con estructura FAQPage', async () => {
    renderView(<Faq />);

    expect(screen.getByRole('heading', { name: /preguntas frecuentes y seguridad/i })).toBeInTheDocument();
    expect(screen.getByText(/no pagues/i)).toBeInTheDocument();
    expect(screen.getByText(/correo verificado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/anotaciones vigentes/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /reclamos y sugerencias/i })).toHaveAttribute('href', '/reclamos');

    await waitFor(() => expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull());
    const script = document.querySelector('script[type="application/ld+json"]');
    const structuredData = JSON.parse(script?.textContent ?? '{}');
    expect(structuredData['@type']).toBe('FAQPage');
    expect(structuredData.mainEntity.length).toBeGreaterThanOrEqual(8);
    expect(structuredData.mainEntity[0]['@type']).toBe('Question');
  });

  it('está enlazada desde el pie del sitio', () => {
    renderView(<Footer />);
    expect(screen.getByRole('link', { name: /preguntas frecuentes y seguridad/i })).toHaveAttribute('href', '/faq');
  });
});
