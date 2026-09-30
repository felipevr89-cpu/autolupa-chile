import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Usados } from '../pages/Usados';
import { PublicarAuto } from '../pages/PublicarAuto';
import { MisAnuncios } from '../pages/MisAnuncios';
import { ModeracionUsados } from '../pages/ModeracionUsados';
import { UsedListingDetail } from '../pages/UsedListingDetail';
import { TusDatos } from '../pages/TusDatos';

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
    renderPage(<PublicarAuto user={null} isCloudAuthAvailable={false} onSignIn={noop} onSignInAnonymous={noop} />);
    expect(screen.getByText(/preparación/i)).toBeInTheDocument();
  });

  it('offers publishing without an account when the backend is live', () => {
    const anonymous = vi.fn();
    renderPage(
      <PublicarAuto user={null} isCloudAuthAvailable onSignIn={noop} onSignInAnonymous={anonymous} />,
    );
    expect(screen.getByRole('heading', { name: /sin crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByText(/pedimos un correo para confirmar/i)).toBeInTheDocument();
    screen.getByRole('button', { name: /publicar sin crear cuenta/i }).click();
    expect(anonymous).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument();
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

describe('rights page (Ley 21.719)', () => {
  it('keeps the data tools closed for anonymous visitors', () => {
    renderPage(<TusDatos user={null} isCloudAuthAvailable onSignIn={noop} />);
    expect(screen.getByRole('heading', { name: /inicia sesión/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /descargar json/i })).not.toBeInTheDocument();
  });

  it('offers export and deletion to a signed-in user', () => {
    const user = { uid: 'uid-1', displayName: 'Ana', email: 'ana@correo.cl', photoURL: null };
    renderPage(<TusDatos user={user} isCloudAuthAvailable onSignIn={noop} />);
    expect(screen.getByRole('button', { name: /descargar json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^eliminar mi cuenta$/i })).toBeInTheDocument();
    expect(screen.getByText(/privacidad@autolupa\.cl/i)).toBeInTheDocument();
  });

  it('requires a confirmation step before deleting', async () => {
    const user = { uid: 'uid-1', displayName: 'Ana', email: 'ana@correo.cl', photoURL: null };
    renderPage(<TusDatos user={user} isCloudAuthAvailable onSignIn={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /^eliminar mi cuenta$/i }));
    expect(await screen.findByRole('button', { name: /sí, eliminar todo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(await screen.findByRole('button', { name: /^eliminar mi cuenta$/i })).toBeInTheDocument();
  });

  it('shows a preparation state when the backend is absent', () => {
    renderPage(<TusDatos user={null} isCloudAuthAvailable={false} onSignIn={noop} />);
    expect(screen.getByText(/preparación/i)).toBeInTheDocument();
  });
});
