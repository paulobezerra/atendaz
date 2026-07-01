import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfessionalForm from '@/app/dashboard/profissionais/ProfessionalForm';

// useRouter exige o app-router montado — mockado no ambiente de teste.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

// Toast (sonner) não é o alvo aqui — mock leve para isolar o form.
jest.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe('ProfessionalForm', () => {
  it('monta sem lançar com cobrança e NFS-e ativas', () => {
    render(<ProfessionalForm billingEnabled nfseEnabled />);
    expect(
      screen.getByRole('radio', { name: /Configurar faturamento próprio/ })
    ).toBeInTheDocument();
  });

  // Regressão do bug S5: "useFormField should be used within <FormField>".
  it('revela "faturamento próprio" sem crashar (regressão useFormField)', async () => {
    const user = userEvent.setup();
    render(<ProfessionalForm billingEnabled nfseEnabled />);

    await user.click(
      screen.getByRole('radio', { name: /Configurar faturamento próprio/ })
    );

    expect(screen.getByText(/Token do meio de pagamento/)).toBeInTheDocument();
    expect(screen.getByText('CPF/CNPJ *')).toBeInTheDocument();
  });

  it('alternar PF↔PJ troca a máscara do documento', async () => {
    const user = userEvent.setup();
    render(<ProfessionalForm billingEnabled nfseEnabled />);

    await user.click(
      screen.getByRole('radio', { name: /Configurar faturamento próprio/ })
    );
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Pessoa Jurídica' }));
    expect(screen.getByPlaceholderText('00.000.000/0000-00')).toBeInTheDocument();
  });
});
