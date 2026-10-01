import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthError } from '@supabase/supabase-js';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { MisAnuncios } from '../pages/MisAnuncios';
import { isVerificationRateLimit, verificationErrorMessage } from '../lib/authVerification';
import { supabase } from '../lib/supabase';
import { getMyUsedListings } from '../lib/usedListings';
import type { User } from '../types';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      resend: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));

vi.mock('../lib/usedListings', () => ({
  getMyUsedListings: vi.fn(),
  markUsedListingAsSold: vi.fn(),
  updateUsedListing: vi.fn(),
}));

const resendMock = vi.mocked(supabase!.auth.resend);

function makeUser(overrides: Partial<User> = {}): User {
  return {
    uid: 'uid-1',
    displayName: 'Ana',
    email: 'ana@correo.cl',
    photoURL: null,
    emailVerified: false,
    pendingEmail: null,
    ...overrides,
  };
}

function renderMisAnuncios(user: User) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <MisAnuncios user={user} isCloudAuthAvailable onSignIn={vi.fn()} />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getMyUsedListings).mockResolvedValue([]);
  resendMock.mockResolvedValue({ data: { user: null, session: null }, error: null });
});

describe('mensajes de verificación de correo', () => {
  it('explica el límite de 2 correos por hora en vez del error de la API', () => {
    const rateLimit = new AuthError('email rate limit exceeded', 429, 'over_email_send_rate_limit');
    expect(isVerificationRateLimit(rateLimit)).toBe(true);
    expect(verificationErrorMessage(rateLimit, 'No pudimos reenviar el enlace')).toMatch(
      /límite de 2 correos por hora/i,
    );
  });

  it('mantiene el detalle del error cuando no es un límite de envío', () => {
    expect(verificationErrorMessage(new Error('algo salió mal'), 'No pudimos reenviar el enlace')).toBe(
      'No pudimos reenviar el enlace: algo salió mal',
    );
    expect(verificationErrorMessage('algo', 'No pudimos reenviar el enlace')).toBe(
      'No pudimos reenviar el enlace.',
    );
  });
});

describe('estado de verificación en mis avisos', () => {
  it('muestra la confirmación cuando el correo ya quedó verificado', async () => {
    renderMisAnuncios(makeUser({ emailVerified: true }));

    expect(await screen.findByText(/correo verificado/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reenviar enlace/i })).not.toBeInTheDocument();
  });

  it('permite reenviar el enlace al correo pendiente', async () => {
    renderMisAnuncios(makeUser({ email: null, pendingEmail: 'ana.nuevo@correo.cl' }));

    expect(await screen.findByText(/verificando ana\.nuevo@correo\.cl/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reenviar enlace' }));

    expect(resendMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'email_change', email: 'ana.nuevo@correo.cl' }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Reenviamos el enlace de confirmación a ana.nuevo@correo.cl.',
    );
  });

  it('traduce el límite de correos a un mensaje en español', async () => {
    resendMock.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthError('email rate limit exceeded', 429, 'over_email_send_rate_limit'),
    });

    renderMisAnuncios(makeUser({ email: null, pendingEmail: 'ana.nuevo@correo.cl' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Reenviar enlace' }));

    expect(await screen.findByText(/límite de 2 correos por hora/i)).toBeInTheDocument();
    expect(screen.queryByText(/rate limit/i)).not.toBeInTheDocument();
  });

  it('guía a publicar cuando todavía no hay correo que verificar', async () => {
    renderMisAnuncios(makeUser({ email: null, pendingEmail: null }));

    expect(await screen.findByText(/sin correo por verificar/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /verificar correo al publicar/i })).toHaveAttribute(
      'href',
      '/publicar-auto',
    );
    expect(screen.queryByRole('button', { name: /reenviar enlace/i })).not.toBeInTheDocument();
    expect(resendMock).not.toHaveBeenCalled();
  });
});
