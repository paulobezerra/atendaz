import { validateAsaasKey } from "@/lib/asaas";

describe("validateAsaasKey", () => {
  const realFetch = global.fetch;

  beforeAll(() => {
    process.env.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3";
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("retorna válido quando a API responde ok e usa header access_token", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;
    const r = await validateAsaasKey("$aact_valida");
    expect(r.valid).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://sandbox.asaas.com/api/v3/myAccount",
      expect.objectContaining({
        headers: expect.objectContaining({ access_token: "$aact_valida" }),
      })
    );
  });

  it("retorna inválido quando a API responde 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as unknown as typeof fetch;
    const r = await validateAsaasKey("$aact_invalida");
    expect(r.valid).toBe(false);
    expect(r.status).toBe(401);
  });

  it("não chama a API para chave vazia", async () => {
    const spy = jest.fn();
    global.fetch = spy as unknown as typeof fetch;
    const r = await validateAsaasKey("");
    expect(r.valid).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
