import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Usados } from '../pages/Usados';
import { PublicarAuto } from '../pages/PublicarAuto';
import { MisAnuncios } from '../pages/MisAnuncios';
import { ModeracionUsados } from '../pages/ModeracionUsados';
import { UsedListingDetail } from '../pages/UsedListingDetail';

const noop = () => Promise.resolve();

function renderPage(ui: React.ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>
  );
}

describe('marketplace pages without a configured backend', () => {
  it('shows a preparation state instead of inventing listings', () => {
    renderPage(<Usados />);
    expect(screen.getByText(/preparación/i)).toBeInTheDocument();
    expect(screen.queryByText(/aviso publicado/i)).not.toBeInTheDocument();
  });

  it('keeps the publish form closed until the backend exists', () => {
    renderPage(<PublicarAuto user={null} isCloudAuthAvailable={false} onSignIn={noop} />);
    expect(screen.getByText(/preparación/i)).toBeInTheDocument();
  });

  it('asks anonymous visitors to sign in for their listings', () => {
    renderPage(<MisAnuncios user={null} isCloudAuthAvailable onSignIn={noop} />);
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument();
  });

  it('does not expose the moderation panel to anonymous visitors', () => {
    renderPage(<ModeracionUsados user={null} isCloudAuthAvailable onSignIn={noop} />);
    expect(screen.getByText(/panel privado/i)).toBeInTheDocument();
    expect(screen.queryByText(/cola de revisión/i)).not.toBeInTheDocument();
  });

  it('returns a noindex state for unknown listing slugs', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/usados/toyota-corolla-2020-abcdef12']}>
          <Routes>
            <Route path="/usados/:slug" element={<UsedListingDetail user={null} isCloudAuthAvailable={false} onSignIn={noop} />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByRole('heading', { name: /aviso no disponible/i })).toBeInTheDocument();
  });

  it('reports a session error instead of failing silently', async () => {
    const signIn = vi.fn().mockRejectedValue(new Error('oauth failed'));
    renderPage(<MisAnuncios user={null} isCloudAuthAvailable onSignIn={signIn} />);
    screen.getByRole('button', { name: /continuar con google/i }).click();
    expect(await screen.findByText(/no pudimos iniciar sesión/i)).toBeInTheDocument();
  });
});
