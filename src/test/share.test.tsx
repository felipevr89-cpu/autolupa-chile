import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ShareButton } from '../components/Share/ShareButton';
import { InstallHint } from '../components/Layout/InstallHint';

const originalUserAgent = window.navigator.userAgent;
const originalPlatform = window.navigator.platform;
const originalMatchMedia = window.matchMedia;

function setNavigatorProperty(name: string, value: unknown) {
  Object.defineProperty(window.navigator, name, { value, configurable: true, writable: true });
}

beforeEach(() => {
  window.localStorage.clear();
  window.matchMedia = originalMatchMedia;
  setNavigatorProperty('userAgent', originalUserAgent);
  setNavigatorProperty('platform', originalPlatform);
  setNavigatorProperty('share', undefined);
  setNavigatorProperty('standalone', undefined);
  setNavigatorProperty('clipboard', { writeText: vi.fn().mockResolvedValue(undefined) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('botón de compartir', () => {
  it('usa Web Share API cuando el navegador la tiene', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', share);

    render(<ShareButton title="Toyota Corolla 2020" text="8.500.000 · AutoLupa" url="https://autolupa.pages.dev/usados/toyota-corolla-2020-x1" label="Compartir aviso" />);

    await userEvent.click(screen.getByRole('button', { name: /compartir aviso/i }));

    expect(share).toHaveBeenCalledWith({
      title: 'Toyota Corolla 2020',
      text: '8.500.000 · AutoLupa',
      url: 'https://autolupa.pages.dev/usados/toyota-corolla-2020-x1',
    });
    expect(screen.getByRole('button', { name: /compartir aviso/i })).toBeInTheDocument();
  });

  it('copia el enlace cuando no hay Web Share API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('clipboard', { writeText });

    render(<ShareButton title="Guía" url="https://autolupa.pages.dev/blog/guia" label="Compartir guía" />);

    await userEvent.click(screen.getByRole('button', { name: /compartir guía/i }));

    expect(writeText).toHaveBeenCalledWith('https://autolupa.pages.dev/blog/guia');
    expect(await screen.findByText('¡Enlace copiado!')).toBeInTheDocument();
  });

  it('no copia nada si el usuario cancela el diálogo de compartir', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('Cancelado por el usuario', 'AbortError'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', share);
    setNavigatorProperty('clipboard', { writeText });

    render(<ShareButton title="Guía" url="https://autolupa.pages.dev/blog/guia" />);

    await userEvent.click(screen.getByRole('button', { name: /compartir/i }));

    expect(share).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('recurre a copiar si el navegador comparte pero falla', async () => {
    const share = vi.fn().mockRejectedValue(new Error('sin permiso'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', share);
    setNavigatorProperty('clipboard', { writeText });

    render(<ShareButton title="Guía" url="https://autolupa.pages.dev/blog/guia" />);

    await userEvent.click(screen.getByRole('button', { name: /compartir/i }));

    expect(writeText).toHaveBeenCalledWith('https://autolupa.pages.dev/blog/guia');
    expect(await screen.findByText('¡Enlace copiado!')).toBeInTheDocument();
  });
});

describe('aviso de instalación', () => {
  it('explica cómo instalar en iPhone y se puede descartar', async () => {
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');
    setNavigatorProperty('platform', 'iPhone');

    render(<InstallHint />);

    expect(await screen.findByTestId('install-hint')).toBeInTheDocument();
    expect(screen.getByText(/añadir a pantalla de inicio/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(screen.queryByTestId('install-hint')).toBeNull();
    expect(window.localStorage.getItem('autolupa-install-hint')).toBe('1');
  });

  it('no se muestra cuando la app ya está instalada', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;

    render(<InstallHint />);

    expect(screen.queryByTestId('install-hint')).toBeNull();
  });

  it('ofrece instalar cuando el navegador emite beforeinstallprompt', async () => {
    render(<InstallHint />);

    expect(screen.queryByTestId('install-hint')).toBeNull();

    const event = new Event('beforeinstallprompt');
    const prompt = vi.fn().mockResolvedValue(undefined);
    Object.assign(event, { prompt });
    fireEvent(window, event);

    expect(screen.getByTestId('install-hint')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Instalar' }));

    expect(prompt).toHaveBeenCalledTimes(1);
  });
});
