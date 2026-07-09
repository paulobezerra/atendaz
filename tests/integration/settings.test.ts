import { GET, POST } from "@/app/api/settings/pagamentos/route";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";
import Business from "@/models/Business";
import AuditLog from "@/models/AuditLog";
import { decrypt } from "@/lib/crypto";

jest.mock("@/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/asaas", () => ({
  validateAsaasKey: jest.fn().mockResolvedValue({ valid: true }),
}));

import { getSession } from "@/lib/auth";
import { validateAsaasKey } from "@/lib/asaas";
const mockedAuth = getSession as jest.Mock;
const mockedAsaas = validateAsaasKey as jest.Mock;

function postReq(body?: unknown) {
  return new Request("http://localhost/api/settings/pagamentos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const MOD_OFF = { agenda: true, agendaPublica: true, cobranca: false, nfse: false };
const MOD_COB = { agenda: true, agendaPublica: true, cobranca: true, nfse: false };

async function makeBusiness(googleId: string, slug: string, modulos = MOD_COB) {
  await dbConnect();
  const plano = await Plano.create({
    slug: `p-${Math.random().toString(36).slice(2, 8)}`,
    nome: "P",
    modulos,
    precoBase: 29,
    precoPorAgendaAdicional: 15,
    ativo: true,
  });
  return Business.create({
    googleId,
    nomeFantasia: "Biz",
    slug,
    email: "d@x.com",
    segmento: "barbearia",
    planoId: plano._id,
    modulos,
    onboardingStatus: "COMPLETE",
  });
}

function login(googleId: string) {
  mockedAuth.mockResolvedValue({ user: { googleId } });
}

describe("F0002.8 — /api/settings/pagamentos", () => {
  beforeAll(() => {
    process.env.CRYPTO_MASTER_KEY = "chave-mestre-teste";
    process.env.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3";
  });
  beforeEach(() => {
    mockedAuth.mockReset();
    mockedAsaas.mockReset();
    mockedAsaas.mockResolvedValue({ valid: true });
  });

  it("Dado sem sessão, quando GET, então 401", async () => {
    mockedAuth.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("Dado sem sessão, quando POST, então 401", async () => {
    mockedAuth.mockResolvedValue(null);
    expect((await POST(postReq({ apiKey: "k" }))).status).toBe(401);
  });

  it("Dado business SEM cobrança/nfse, quando GET, então 404 (habilitação)", async () => {
    const biz = await makeBusiness("g-off", "off", MOD_OFF);
    login(biz.googleId);
    expect((await GET()).status).toBe(404);
  });

  it("Dado business SEM cobrança/nfse, quando POST, então 404 (habilitação)", async () => {
    const biz = await makeBusiness("g-off", "off", MOD_OFF);
    login(biz.googleId);
    expect((await POST(postReq({ apiKey: "k" }))).status).toBe(404);
  });

  it("Dado business habilitado e desconectado, quando GET, então 200 { connected:false }", async () => {
    const biz = await makeBusiness("g-cob", "cob");
    login(biz.googleId);
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ connected: false, last4: null });
  });

  it("Dado token válido, quando POST, então conecta, criptografa e audita sem a chave", async () => {
    const biz = await makeBusiness("g-cob", "cob");
    login(biz.googleId);
    const res = await POST(postReq({ apiKey: "aact_prod_secreta_4821" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.connected).toBe(true);
    expect(json.last4).toBe("4821");

    // persistido criptografado (≠ texto plano), mas descriptografável
    const saved = await Business.findById(biz._id);
    const enc = saved!.billingConfigPadrao!.asaasApiKeyEncrypted!;
    expect(enc).not.toBe("aact_prod_secreta_4821");
    expect(decrypt(enc)).toBe("aact_prod_secreta_4821");

    // audit sem a chave
    const audit = await AuditLog.findOne({ entidade: "business", acao: "connect_payment" });
    expect(audit).not.toBeNull();
    expect(JSON.stringify(audit!.payloadResumido)).not.toContain("aact_prod_secreta_4821");
  });

  it("Dado token inválido no Asaas, quando POST, então 400 e nada persistido", async () => {
    const biz = await makeBusiness("g-cob", "cob");
    login(biz.googleId);
    mockedAsaas.mockResolvedValue({ valid: false, error: "Chave Asaas inválida ou sem permissão." });
    const res = await POST(postReq({ apiKey: "ruim" }));
    expect(res.status).toBe(400);
    const saved = await Business.findById(biz._id);
    expect(saved!.billingConfigPadrao?.asaasApiKeyEncrypted).toBeFalsy();
  });

  it("Dado corpo sem apiKey, quando POST, então 400 (schema)", async () => {
    const biz = await makeBusiness("g-cob", "cob");
    login(biz.googleId);
    expect((await POST(postReq({}))).status).toBe(400);
  });

  it("Dado business já conectado, quando POST novo token, então atualiza (D3)", async () => {
    const biz = await makeBusiness("g-cob", "cob");
    login(biz.googleId);
    await POST(postReq({ apiKey: "aact_token_1111" }));
    const res = await POST(postReq({ apiKey: "aact_token_2222" }));
    const json = await res.json();
    expect(json.last4).toBe("2222");
    const saved = await Business.findById(biz._id);
    expect(decrypt(saved!.billingConfigPadrao!.asaasApiKeyEncrypted!)).toBe("aact_token_2222");
  });

  it("Dado token salvo, quando GET, então nunca expõe a chave (só last4)", async () => {
    const biz = await makeBusiness("g-cob", "cob");
    login(biz.googleId);
    await POST(postReq({ apiKey: "aact_super_secreta_9999" }));
    const res = await GET();
    const json = await res.json();
    expect(JSON.stringify(json)).not.toContain("aact_super_secreta_9999");
    expect(json).toEqual({ connected: true, last4: "9999" });
  });

  it("Isolamento: conectar em A não afeta B", async () => {
    const bizA = await makeBusiness("g-a", "a");
    const bizB = await makeBusiness("g-b", "b");
    login("g-a");
    await POST(postReq({ apiKey: "aact_do_a_1234" }));
    login("g-b");
    const res = await GET();
    expect(await res.json()).toEqual({ connected: false, last4: null });
    void bizA;
    void bizB;
  });
});
