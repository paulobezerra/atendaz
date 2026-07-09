import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentForm from "@/app/dashboard/configuracoes/pagamentos/PaymentForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));
const mockToast = jest.fn();
jest.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

const DISCONNECTED = { connected: false, last4: null };

describe("PaymentForm", () => {
  beforeEach(() => {
    mockToast.mockClear();
    // @ts-expect-error mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, last4: "4821" }),
    });
  });

  it("monta desconectado: campo de token (mascarado) + ações", () => {
    render(<PaymentForm initial={DISCONNECTED} />);
    const input = screen.getByPlaceholderText("$aact_...");
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: /Salvar e conectar/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Como conectar/ })).toBeInTheDocument();
  });

  it("👁 alterna mostrar/ocultar o token", async () => {
    const user = userEvent.setup();
    render(<PaymentForm initial={DISCONNECTED} />);
    const input = screen.getByPlaceholderText("$aact_...");
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: /Mostrar token/ }));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /Ocultar token/ }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("submit envia POST e mostra o estado conectado", async () => {
    const user = userEvent.setup();
    render(<PaymentForm initial={DISCONNECTED} />);
    await user.type(screen.getByPlaceholderText("$aact_..."), "$aact_prod_teste_4821");
    await user.click(screen.getByRole("button", { name: /Salvar e conectar/ }));

    expect(await screen.findByText(/Conectado/)).toBeInTheDocument();
    expect(screen.getByText(/4821/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/settings/pagamentos",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("estado conectado inicial mostra os últimos 4 dígitos + Atualizar", () => {
    render(<PaymentForm initial={{ connected: true, last4: "9999" }} />);
    expect(screen.getByText(/9999/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Atualizar token/ })).toBeInTheDocument();
  });

  it("abre o tutorial (slide-over) ao clicar em 'Como conectar'", async () => {
    const user = userEvent.setup();
    render(<PaymentForm initial={DISCONNECTED} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Como conectar/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Crie sua conta no Asaas/)).toBeInTheDocument();
  });

  it("submit com erro do POST: mantém o form e avisa por toast", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Chave Asaas inválida ou sem permissão." }),
    });
    const user = userEvent.setup();
    render(<PaymentForm initial={DISCONNECTED} />);
    await user.type(screen.getByPlaceholderText("$aact_..."), "$aact_ruim");
    await user.click(screen.getByRole("button", { name: /Salvar e conectar/ }));

    // não avançou para o estado conectado
    expect(screen.getByRole("button", { name: /Salvar e conectar/ })).toBeInTheDocument();
    expect(screen.queryByText(/Conectado/)).not.toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(expect.stringMatching(/inválida/i), "error");
  });

  it("valida onBlur: campo vazio mostra erro ao sair do campo", async () => {
    const user = userEvent.setup();
    render(<PaymentForm initial={DISCONNECTED} />);
    const input = screen.getByPlaceholderText("$aact_...");
    await user.click(input);
    await user.tab(); // blur sem preencher
    expect(await screen.findByText(/Informe o token de API do Asaas/)).toBeInTheDocument();
  });
});
