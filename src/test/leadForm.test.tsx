import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LeadForm } from '../components/Used/LeadForm';
import { submitUsedListingLead } from '../lib/usedListings';

vi.mock('../lib/usedListings', () => ({ submitUsedListingLead: vi.fn() }));

const submit = vi.mocked(submitUsedListingLead);

function fillAndSend() {
  render(<LeadForm listingId="id-1" listingTitle="Toyota Corolla 2020" sellerName="Ana" onClose={() => {}} />);
  const [name, email] = screen.getAllByRole('textbox');
  fireEvent.change(name, { target: { value: 'Pedro' } });
  fireEvent.change(email, { target: { value: 'pedro@correo.cl' } });
  fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));
}

describe('formulario de contacto al vendedor', () => {
  beforeEach(() => {
    submit.mockReset();
  });

  it('confirma el envío solo cuando el mensaje se guardó', async () => {
    submit.mockResolvedValue(undefined);
    fillAndSend();
    expect(await screen.findByRole('status')).toHaveTextContent(/mensaje enviado/i);
  });

  it('avisa el error y permite reintentar cuando el envío falla', async () => {
    submit.mockRejectedValue(new Error('insert failed'));
    fillAndSend();
    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos enviar tu mensaje/i);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeEnabled();
  });
});
