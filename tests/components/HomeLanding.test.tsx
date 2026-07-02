import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import HomeLanding from '@/components/HomeLanding';

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

describe('HomeLanding', () => {
  it('mostra a landing (hero, recursos, preços) e nenhum modal de login por padrão', () => {
    render(<HomeLanding />);
    expect(
      screen.getByRole('heading', { name: /Agenda, cobrança e nota fiscal num só lugar/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Agenda inteligente')).toBeInTheDocument();
    expect(screen.getByText('Preço simples, sem surpresa')).toBeInTheDocument();
    expect(screen.queryByText('Acesse sua conta')).toBeNull();
  });

  it('abre o modal de login no canto superior direito ao clicar em "Entrar"', async () => {
    const user = userEvent.setup();
    render(<HomeLanding />);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Entrar com Google/ })
    ).toBeInTheDocument();
  });

  it('dispara signIn("google") ao clicar em "Entrar com Google" no modal', async () => {
    const user = userEvent.setup();
    render(<HomeLanding />);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await user.click(screen.getByRole('button', { name: /Entrar com Google/ }));
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });

  it('fecha o modal ao clicar no X', async () => {
    const user = userEvent.setup();
    render(<HomeLanding />);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByText('Acesse sua conta')).toBeNull();
  });

  it('todos os CTAs de entrada abrem o mesmo modal', async () => {
    const user = userEvent.setup();
    render(<HomeLanding />);
    await user.click(screen.getByRole('button', { name: /Criar minha conta/ }));
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
  });
});
