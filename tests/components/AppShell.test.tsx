import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import AppShell from '@/components/AppShell';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));

const BUSINESS = {
  nomeFantasia: 'Barbearia do Zé',
  slug: 'barbearia-do-ze',
  modulos: { agenda: false, cobranca: false, nfse: false },
};

describe('AppShell', () => {
  it('mostra iniciais e nome/negócio na conta, sem itens de módulo inativo', () => {
    render(
      <AppShell business={BUSINESS} user={{ nome: 'Maria Silva' }}>
        <p>conteúdo</p>
      </AppShell>
    );
    expect(screen.getByText('MS')).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getAllByText('Barbearia do Zé').length).toBeGreaterThan(0);
    // Progressive disclosure (Guardrail 2): sem módulos ativos, só "Profissionais" aparece.
    expect(screen.queryByText('Cobrança')).toBeNull();
  });

  it('dispara signOut ao clicar em Sair', async () => {
    const user = userEvent.setup();
    render(
      <AppShell business={BUSINESS} user={{ nome: 'Maria Silva' }}>
        <p>conteúdo</p>
      </AppShell>
    );
    const [sairButton] = screen.getAllByRole('button', { name: 'Sair' });
    await user.click(sairButton);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
