import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/login/page';

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

describe('LoginPage', () => {
  it('mostra o acesso com Google no Shell Público (sem split/painel roxo)', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('heading', { name: 'Acesse sua conta' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Entrar com Google/ })
    ).toBeInTheDocument();
    // sem "meia tela roxa": não há painel de branding <aside>
    expect(document.querySelector('aside')).toBeNull();
  });

  it('mostra o hero fiel à landing (headline, subcopy e trust bar)', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('heading', { name: /Agenda, cobrança e nota fiscal num só lugar/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/500 negócios/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Começar grátis' })
    ).toHaveAttribute('href', '/onboarding');
  });

  it('dispara signIn("google") ao clicar', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /Entrar com Google/ }));
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });
});
