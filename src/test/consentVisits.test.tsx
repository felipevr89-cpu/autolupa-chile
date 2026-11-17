import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const rpc = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => rpc(...args) },
  isSupabaseConfigured: true,
}));

import { ConsentBanner } from '../components/Layout/ConsentBanner';
import { VisitCounter } from '../components/Layout/VisitCounter';
import { CONSENT_STORAGE_KEY, hasConsent, openConsentPreferences, readConsent } from '../lib/consent';
import { registerSiteVisit, resetSiteVisitsCache, SITE_VISITS_MIN_DISPLAY, trackListingView } from '../lib/visits';
import { act } from 'react';

function renderBanner() {
  return render(<MemoryRouter><ConsentBanner /></MemoryRouter>);
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  rpc.mockReset();
  resetSiteVisitsCache();
});

describe('ConsentBanner', () => {
  it('se muestra sin decisión previa y guarda "Aceptar todo"', async () => {
    renderBanner();
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar todo' }));
    expect(readConsent()).toMatchObject({ analytics: true, ads: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('"Solo esenciales" desactiva medición y publicidad y excluye a Plausible', async () => {
    renderBanner();
    await userEvent.click(screen.getByRole('button', { name: 'Solo esenciales' }));
    expect(readConsent()).toMatchObject({ analytics: false, ads: false });
    expect(window.localStorage.getItem('plausible_ignore')).toBe('true');
    expect(hasConsent('analytics')).toBe(false);
  });

  it('no aparece si ya hay decisión y se reabre desde preferencias', async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: true, ads: false, version: 1, decidedAt: '2026-11-17' }));
    renderBanner();
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => openConsentPreferences());
    expect(screen.getByRole('dialog')).toBeTruthy();
    await userEvent.click(screen.getByRole('checkbox', { name: /Publicidad/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar preferencias' }));
    expect(readConsent()).toMatchObject({ analytics: true, ads: true });
  });

  it('publicidad queda desactivada por defecto', () => {
    expect(hasConsent('ads')).toBe(false);
    expect(hasConsent('analytics')).toBe(true);
  });
});

describe('contadores de visitas', () => {
  it('registra la visita al sitio una sola vez por sesión', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    await registerSiteVisit();
    await registerSiteVisit();
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('register_site_visit');
  });

  it('no registra visitas si se rechazó la medición', async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: false, ads: false, version: 1, decidedAt: '2026-11-17' }));
    await registerSiteVisit();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('cuenta la vista del aviso una vez y luego solo la consulta', async () => {
    rpc.mockImplementation((name: string) => Promise.resolve(
      name === 'register_listing_view' ? { data: 7, error: null } : { data: [{ listing_id: 'a1', views: 7 }], error: null },
    ));
    expect(await trackListingView('a1')).toBe(7);
    expect(await trackListingView('a1')).toBe(7);
    expect(rpc.mock.calls.map((call) => call[0])).toEqual(['register_listing_view', 'get_listing_views']);
  });

  it('el contador del sitio se oculta bajo el umbral y se muestra sobre él', async () => {
    rpc.mockResolvedValue({ data: SITE_VISITS_MIN_DISPLAY - 1, error: null });
    const { unmount } = render(<VisitCounter />);
    await waitFor(() => expect(rpc).toHaveBeenCalled());
    expect(screen.queryByTestId('visit-counter')).toBeNull();
    unmount();
    resetSiteVisitsCache();
    rpc.mockResolvedValue({ data: 12345, error: null });
    render(<VisitCounter />);
    expect((await screen.findByTestId('visit-counter')).textContent).toContain('12.345 visitas');
  });

  it('el contador se oculta si el backend falla', async () => {
    rpc.mockRejectedValue(new Error('down'));
    render(<VisitCounter />);
    await waitFor(() => expect(rpc).toHaveBeenCalled());
    expect(screen.queryByTestId('visit-counter')).toBeNull();
  });
});
