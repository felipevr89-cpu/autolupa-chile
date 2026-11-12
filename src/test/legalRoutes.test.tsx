import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import App from '../App';

const cases: [string, RegExp][] = [
  ['/privacidad', /Política de Privacidad/i],
  ['/responsabilidad', /Declaración de Responsabilidad/i],
  ['/terminos', /Términos y Condiciones/i],
];

describe('rutas de documentos legales', () => {
  it.each(cases)('%s muestra su documento y no la página 404', async (path, title) => {
    window.history.pushState({}, '', path);
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );
    const main = await screen.findByRole('main');
    await waitFor(() => expect(within(main).getAllByText(title).length).toBeGreaterThan(0), { timeout: 5000 });
    expect(screen.queryByText(/Página no encontrada/i)).not.toBeInTheDocument();
  });
});
