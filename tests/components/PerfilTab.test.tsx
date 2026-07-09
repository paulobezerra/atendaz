import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PerfilTab from "@/app/dashboard/profissionais/[id]/PerfilTab";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));
const mockToast = jest.fn();
jest.mock("@/components/Toast", () => ({ useToast: () => ({ toast: mockToast }) }));

const BASE = { id: "abc", fotoUrl: null, bio: null, redesSociais: null };

describe("PerfilTab", () => {
  beforeEach(() => {
    mockToast.mockClear();
    // @ts-expect-error mock global fetch
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ fotoUrl: null }) });
  });

  it("monta sem foto: bio, 4 redes, salvar e trocar foto; sem 'Remover'", () => {
    render(<PerfilTab initial={BASE} />);
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
    for (const r of ["instagram", "facebook", "tiktok", "site"]) {
      expect(screen.getByLabelText(r)).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /Salvar perfil/ })).toBeInTheDocument();
    expect(screen.getByText(/Trocar foto/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument();
  });

  it("com foto inicial: mostra imagem + 'Remover'; remover chama DELETE", async () => {
    const user = userEvent.setup();
    render(<PerfilTab initial={{ ...BASE, fotoUrl: "https://blob.example/x.jpg" }} />);
    expect(screen.getByRole("img", { name: /Foto do profissional/ })).toBeInTheDocument();
    const rm = screen.getByRole("button", { name: /Remover/ });
    await user.click(rm);
    expect(fetch).toHaveBeenCalledWith(
      "/api/professionals/abc/foto",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(screen.queryByRole("img", { name: /Foto do profissional/ })).not.toBeInTheDocument();
  });

  it("Salvar perfil envia PATCH com bio + redesSociais", async () => {
    const user = userEvent.setup();
    render(<PerfilTab initial={BASE} />);
    await user.type(screen.getByLabelText("Bio"), "Barbeiro");
    await user.type(screen.getByLabelText("instagram"), "instagram.com/eu");
    await user.click(screen.getByRole("button", { name: /Salvar perfil/ }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/professionals/abc",
      expect.objectContaining({ method: "PATCH" })
    );
    const body = JSON.parse((fetch as jest.Mock).mock.calls.at(-1)![1].body);
    expect(body.bio).toBe("Barbeiro");
    expect(body.redesSociais.instagram).toBe("instagram.com/eu");
  });

  it("erro ao salvar → avisa por toast", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Falhou." }) });
    const user = userEvent.setup();
    render(<PerfilTab initial={BASE} />);
    await user.type(screen.getByLabelText("Bio"), "x");
    await user.click(screen.getByRole("button", { name: /Salvar perfil/ }));
    expect(mockToast).toHaveBeenCalledWith(expect.stringMatching(/Falhou/i), "error");
  });
});
