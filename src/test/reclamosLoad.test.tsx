import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { Reclamos } from '../pages/Reclamos';
import { getPublishedSuggestions, type Suggestion } from '../lib/suggestions';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {},
}));

vi.mock('../lib/suggestions', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/suggestions')>()),
  getPublishedSuggestions: vi.fn(),
}));

function renderReclamos() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/reclamos']}>
        <Reclamos />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('respuestas publicadas de reclamos', () => {
  it('muestra skeleton mientras carga y evita el estado vacío falso', async () => {
    let resolveList: (rows: Suggestion[]) => void = () => undefined;
    vi.mocked(getPublishedSuggestions).mockReturnValue(new Promise<Suggestion[]>((resolve) => { resolveList = resolve; }));

    renderReclamos();

    expect(await screen.findByLabelText('Cargando')).toBeInTheDocument();
    expect(screen.queryByText(/Todavía no hay respuestas publicadas/i)).toBeNull();
    expect(screen.getByText('… respuestas')).toBeInTheDocument();

    resolveList([]);

    expect(await screen.findByText(/Todavía no hay respuestas publicadas/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Cargando')).toBeNull();
    expect(screen.getByText('0 respuestas')).toBeInTheDocument();
  });

  it('lista las respuestas cuando el servicio responde', async () => {
    vi.mocked(getPublishedSuggestions).mockResolvedValue([
      {
        id: 'sug-1',
        kind: 'sugerencia',
        title: 'Agregar filtros por comuna',
        body: 'Estaría genial poder filtrar avisos por comuna.',
        email: '',
        answer: 'Lo estamos evaluando para una próxima versión.',
        status: 'answered',
        createdAt: '2026-09-20T10:00:00.000Z',
        answeredAt: '2026-09-21T10:00:00.000Z',
      } as unknown as Suggestion,
    ]);

    renderReclamos();

    expect(await screen.findByText('Agregar filtros por comuna')).toBeInTheDocument();
    expect(screen.getByText('Respuesta de AutoLupa')).toBeInTheDocument();
    expect(screen.queryByLabelText('Cargando')).toBeNull();
  });
});
