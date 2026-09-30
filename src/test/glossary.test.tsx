import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GLOSSARY, GLOSSARY_CATEGORIES, getGlossaryTerm, searchGlossary } from '../data/glossary';
import { Glosario } from '../pages/Glosario';
import { TermTip } from '../components/Glossary/TermTip';

function renderPage(ui: ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>,
  );
}


describe('glossary data', () => {
  it('keeps every category used by the navigation', () => {
    const used = new Set(GLOSSARY.map((entry) => entry.category));
    const declared = new Set(GLOSSARY_CATEGORIES.map((category) => category.id));
    for (const category of used) expect(declared.has(category)).toBe(true);
  });

  it('resolves the technical terms the site actually displays', () => {
    expect(getGlossaryTerm('hibrido_enchufable')?.term).toContain('Enchufable');
    expect(getGlossaryTerm('CVT')?.term).toContain('CVT');
    expect(getGlossaryTerm('PHEV')?.term).toContain('Enchufable');
    expect(getGlossaryTerm('kWh')?.id).toBe('kwh');
    expect(getGlossaryTerm('permiso de circulación')?.id).toBe('permiso_circulacion');
    expect(getGlossaryTerm('no-existe')).toBeUndefined();
  });

  it('searches by term, alias and definition', () => {
    expect(searchGlossary('variador').length).toBeGreaterThan(0);
    expect(searchGlossary('bencina').map((entry) => entry.id)).toContain('gasolina');
    expect(searchGlossary('')).toHaveLength(GLOSSARY.length);
    expect(searchGlossary('zzzz-sin-resultados')).toHaveLength(0);
  });

  it('gives each entry a short and a full definition', () => {
    for (const entry of GLOSSARY) {
      expect(entry.short.length).toBeGreaterThan(10);
      expect(entry.definition.length).toBeGreaterThan(40);
      expect(entry.aliases.length).toBeGreaterThan(0);
    }
  });
});

describe('glossary page', () => {
  it('renders the full glossary by category', () => {
    renderPage(<Glosario />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/glosario/i);
    expect(screen.getByText('CVT (variador continuo)')).toBeInTheDocument();
    expect(screen.getByText('CAE')).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBe(GLOSSARY.length);
  });

  it('filters terms with the search box', () => {
    renderPage(<Glosario />);
    const input = screen.getByLabelText(/buscar término/i);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, 'CAE');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});

describe('TermTip', () => {
  it('links to the glossary with the short definition', () => {
    renderPage(<TermTip term="cvt">CVT</TermTip>);
    const trigger = screen.getByLabelText(/CVT \(variador continuo\)/i);
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger).toHaveTextContent('CVT');
  });

  it('falls back to plain content for unknown terms', () => {
    renderPage(<TermTip term="término-inexistente">Texto libre</TermTip>);
    expect(screen.getByText('Texto libre')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
