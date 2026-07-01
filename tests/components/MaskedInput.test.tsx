import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaskedInput } from '@/components/MaskedInput';

function Controlled({ kind }: { kind: 'cpf' | 'phone' }) {
  const [v, setV] = React.useState('');
  return <MaskedInput kind={kind} value={v} onChange={setV} placeholder="campo" />;
}

describe('MaskedInput', () => {
  it('aplica a máscara de CPF ao digitar', async () => {
    const user = userEvent.setup();
    render(<Controlled kind="cpf" />);
    const input = screen.getByPlaceholderText('campo');
    await user.type(input, '12345678901');
    expect(input).toHaveValue('123.456.789-01');
  });

  it('aplica a máscara de telefone ao digitar', async () => {
    const user = userEvent.setup();
    render(<Controlled kind="phone" />);
    const input = screen.getByPlaceholderText('campo');
    await user.type(input, '11999998888');
    expect(input).toHaveValue('(11) 99999-8888');
  });
});
