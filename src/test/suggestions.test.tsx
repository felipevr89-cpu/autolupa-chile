import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Reclamos } from '../pages/Reclamos';
import { sendSuggestion, SuggestionsUnavailableError, validateSuggestionInput } from '../lib/suggestions';

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/reclamos']}>
        <Routes>
          <Route path="/reclamos" element={<Reclamos />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText(/asunto/i), { target: { value: 'No puedo editar mi aviso' } });
  fireEvent.change(screen.getByLabelText(/^mensaje$/i), { target: { value: 'Intenté editar la descripción y no guarda los cambios.' } });
}

describe('validación de reclamos y sugerencias', () => {
  const base = { kind: 'sugerencia' as const, title: 'Consulta clara', body: 'Cuerpo suficientemente largo.', email: '' };

  it('exige asunto y mensaje con longitud mínima', () => {
    expect(validateSuggestionInput({ ...base, title: 'abc', body: 'corto' })).toHaveProperty('title');
    expect(validateSuggestionInput({ ...base, body: 'corto' })).toHaveProperty('body');
    expect(validateSuggestionInput({ ...base, title: 'x'.repeat(121) })).toHaveProperty('title');
    expect(validateSuggestionInput({ ...base, body: 'x'.repeat(2001) })).toHaveProperty('body');
  });

  it('acepta mensajes válidos y solo marca el correo si no está vacío', () => {
    expect(validateSuggestionInput(base)).toEqual({});
    expect(validateSuggestionInput({ ...base, email: 'persona@ejemplo.cl' })).toEqual({});
    expect(validateSuggestionInput({ ...base, email: 'no-es-correo' })).toHaveProperty('email');
  });

  it('ignora el honeypot y no toca la base de datos', async () => {
    await expect(
      sendSuggestion({ ...base, title: 'Título válido' }, 'http://spam.example'),
    ).resolves.toBeUndefined();
  });

  it('bloquea envíos repetidos dentro de los 30 segundos', async () => {
    localStorage.setItem('autolupa_suggestion_last_sent', String(Date.now()));
    await expect(sendSuggestion(base, '')).rejects.toThrow(/Espera unos segundos/);
  });

  it('expone el error cuando el formulario no está configurado', () => {
    expect(new SuggestionsUnavailableError().message).toMatch(/no está disponible/);
  });
});

describe('página de reclamos y sugerencias', () => {
  it('muestra formulario, política de datos y preguntas frecuentes', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /reclamos y sugerencias/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mensaje$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo \(opcional\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Ley 21.719/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: /preguntas frecuentes/i })).toBeInTheDocument();
    expect(screen.getByText(/¿Quién puede enviar un reclamo o una sugerencia\?/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /ruta de navegación/i })).toBeInTheDocument();
  });

  it('muestra los avisos de privacidad y el estado de la lista pública', () => {
    renderPage();
    expect(screen.getAllByText(/Sin cuenta ni registro/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/no publicamos tu correo/i)).toBeInTheDocument();
    expect(screen.getByText(/se mostrarán aquí cuando el formulario esté activo/i)).toBeInTheDocument();
  });

  it('valida antes de enviar', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/al menos 5 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    expect(screen.queryByText(/no está disponible/i)).not.toBeInTheDocument();
  });

  it('marca el correo inválido', () => {
    renderPage();
    fillForm();
    fireEvent.change(screen.getByLabelText(/correo \(opcional\)/i), { target: { value: 'no-es-correo' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/no parece una dirección válida/i)).toBeInTheDocument();
  });

  it('confirma el envío cuando llena el campo oculto de robots', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/no llenes este campo/i), { target: { value: 'http://spam' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/mensaje recibido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar otro mensaje/i })).toBeInTheDocument();
  });

  it('avisa si el formulario aún no está conectado a la base de datos', async () => {
    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/no está disponible/i);
  });
});
