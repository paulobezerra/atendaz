import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PessoaTipoField, type TipoPessoa } from '@/components/PessoaTipoField';

function Controlled() {
  const [tipo, setTipo] = React.useState<TipoPessoa>('FISICA');
  const [doc, setDoc] = React.useState('');
  return (
    <PessoaTipoField
      tipo={tipo}
      onTipoChange={setTipo}
      documento={doc}
      onDocumentoChange={setDoc}
    />
  );
}

describe('PessoaTipoField', () => {
  it('começa em PF e troca a máscara ao selecionar PJ', async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Pessoa Jurídica' }));
    expect(screen.getByPlaceholderText('00.000.000/0000-00')).toBeInTheDocument();
  });
});
