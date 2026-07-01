import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';

describe('Estados reutilizáveis', () => {
  it('EmptyState mostra título e CTA', () => {
    render(
      <EmptyState title="Sem profissionais" action={<button>Adicionar</button>} />
    );
    expect(screen.getByText('Sem profissionais')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
  });

  it('ErrorState chama onRetry ao clicar em "Tentar novamente"', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('LoadingState sinaliza carregamento (aria-busy)', () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });
});
