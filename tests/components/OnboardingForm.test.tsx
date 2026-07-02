import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import OnboardingForm from '@/app/onboarding/OnboardingForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));
jest.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));

const SEGMENTOS = [
  { slug: 'barbearia', nome: 'Barbearia' },
  { slug: 'clinica', nome: 'Clínica' },
];

function jsonRes(data: unknown, status = 200) {
  return { status, ok: status < 400, json: async () => data } as unknown as Response;
}

describe('OnboardingForm', () => {
  it('monta sem lançar com os campos do passo único', () => {
    render(<OnboardingForm segmentos={SEGMENTOS} defaultProfissional="Maria" />);
    expect(screen.getByText('Nome do negócio')).toBeInTheDocument();
    expect(screen.getByText('Endereço público')).toBeInTheDocument();
    expect(screen.getByText('Segmento')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Começar a usar' })
    ).toBeInTheDocument();
  });

  it('mostra o lado de benefícios (sem mockup) no Shell Público, sem split', async () => {
    const user = userEvent.setup();
    render(<OnboardingForm segmentos={SEGMENTOS} defaultProfissional="Maria" />);
    expect(screen.getByText(/Leva menos de/)).toBeInTheDocument();
    expect(screen.getByText('NFS-e automática')).toBeInTheDocument();
    expect(screen.getByText('Nota emitida sozinha após o pagamento.')).toBeInTheDocument();
    expect(document.querySelector('aside')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('valida o slug no blur e mostra erro quando indisponível', async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        jsonRes({ available: false, slug: 'admin', reason: 'Slug já está em uso.' })
      ) as unknown as typeof fetch;

    render(<OnboardingForm segmentos={SEGMENTOS} defaultProfissional="Maria" />);
    await user.type(screen.getByPlaceholderText('barbearia-do-ze'), 'admin');
    await user.tab(); // blur dispara checkSlug

    await waitFor(() =>
      expect(screen.getByText('Slug já está em uso.')).toBeInTheDocument()
    );
  });

  it('envia POST /api/onboarding com o payload do passo único', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn((url: string | URL) => {
      if (String(url).includes('validate-slug')) {
        return Promise.resolve(jsonRes({ available: true, slug: 'barbearia-do-ze' }));
      }
      return Promise.resolve(jsonRes({ id: '1', slug: 'barbearia-do-ze' }, 201));
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<OnboardingForm segmentos={SEGMENTOS} defaultProfissional="Maria" />);

    // nomeFantasia → preenche o slug automaticamente (normalizeSlug)
    await user.type(
      screen.getByPlaceholderText('Barbearia do Zé'),
      'Barbearia do Zé'
    );
    // segmento (Radix Select)
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Barbearia' }));

    await user.click(screen.getByRole('button', { name: 'Começar a usar' }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(
        ([u]) => String(u) === '/api/onboarding'
      );
      expect(call).toBeTruthy();
      const body = JSON.parse((call![1] as RequestInit).body as string);
      expect(body).toMatchObject({
        nomeFantasia: 'Barbearia do Zé',
        slug: 'barbearia-do-ze',
        segmento: 'barbearia',
        profissionalNome: 'Maria',
      });
    });
  });
});
