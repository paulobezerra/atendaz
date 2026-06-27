import { GET as listGET, POST as createPOST } from "@/app/api/professionals/route";
import { PATCH, DELETE } from "@/app/api/professionals/[id]/route";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
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

function makeReq(body?: unknown, qs = "") {
  return new Request(`http://localhost/api/professionals${qs}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function makeBusiness(over: Record<string, unknown> = {}, modulos = { agenda: true, agendaPublica: true, cobranca: false, nfse: false }) {
  await dbConnect();
  const plano = await Plano.create({
    slug: `p-${Math.random().toString(36).slice(2, 8)}`, nome: "P", modulos, precoBase: 29, precoPorAgendaAdicional: 15, ativo: true,
  });
  return Business.create({
    googleId: (over.googleId as string) ?? "g-1",
    nomeFantasia: "Biz",
    slug: (over.slug as string) ?? "biz",
    email: "d@x.com",
    segmento: "barbearia",
    planoId: plano._id,
    modulos,
    onboardingStatus: "COMPLETE",
    ...over,
  });
}

describe("F2 — /api/professionals", () => {
  beforeAll(() => {
    process.env.CRYPTO_MASTER_KEY = "chave-mestre-teste";
    process.env.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3";
  });
  beforeEach(() => {
    mockedAuth.mockReset();
    mockedAsaas.mockReset();
    mockedAsaas.mockResolvedValue({ valid: true });
  });

  it("401 sem sessão", async () => {
    mockedAuth.mockResolvedValue(null);
    const res = await listGET();
    expect(res.status).toBe(401);
  });

  it("cria profissional herdando billing (plano sem cobrança)", async () => {
    const biz = await makeBusiness();
    mockedAuth.mockResolvedValue({ user: { googleId: biz.googleId } });
    const res = await createPOST(makeReq({ nome: "Maria Silva" }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.slugInterno).toBe("maria-silva");
    expect(json.billingMode).toBe("inherit");
    expect(json.temAsaasProprio).toBe(false);

    const audit = await AuditLog.findOne({ entidade: "professional", acao: "create" });
    expect(audit).not.toBeNull();
  });

  it("rejeita billingConfig quando módulo de cobrança está off (400)", async () => {
    const biz = await makeBusiness();
    mockedAuth.mockResolvedValue({ user: { googleId: biz.googleId } });
    const res = await createPOST(makeReq({ nome: "João", billingMode: "own", asaasApiKey: "k" }));
    expect(res.status).toBe(400);
  });

  it("cria com Asaas próprio e criptografa a chave (plano com cobrança)", async () => {
    const biz = await makeBusiness({ googleId: "g-cob", slug: "cob" }, { agenda: true, agendaPublica: true, cobranca: true, nfse: false });
    mockedAuth.mockResolvedValue({ user: { googleId: "g-cob" } });
    const res = await createPOST(makeReq({ nome: "Ana", billingMode: "own", asaasApiKey: "aact_minha_chave" }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.temAsaasProprio).toBe(true);

    const prof = await Professional.findOne({ businessId: biz._id, nome: "Ana" });
    const enc = (prof!.billingConfig as { asaasApiKeyEncrypted: string }).asaasApiKeyEncrypted;
    expect(enc).not.toBe("aact_minha_chave");
    expect(decrypt(enc)).toBe("aact_minha_chave");
  });

  it("rejeita chave Asaas inválida no override", async () => {
    await makeBusiness({ googleId: "g-cob", slug: "cob" }, { agenda: false, agendaPublica: false, cobranca: true, nfse: false });
    mockedAuth.mockResolvedValue({ user: { googleId: "g-cob" } });
    mockedAsaas.mockResolvedValue({ valid: false, error: "Chave Asaas inválida ou sem permissão." });
    const res = await createPOST(makeReq({ nome: "Bia", billingMode: "own", asaasApiKey: "ruim" }));
    expect(res.status).toBe(400);
  });

  it("slugInterno é único no business e permitido em outro business", async () => {
    const biz = await makeBusiness();
    mockedAuth.mockResolvedValue({ user: { googleId: biz.googleId } });
    await createPOST(makeReq({ nome: "Repetido" }));
    const dup = await createPOST(makeReq({ nome: "Repetido" }));
    expect(dup.status).toBe(409);

    // outro business → mesmo slug ok
    const biz2 = await makeBusiness({ googleId: "g-2", slug: "biz2" });
    mockedAuth.mockResolvedValue({ user: { googleId: biz2.googleId } });
    const ok = await createPOST(makeReq({ nome: "Repetido" }));
    expect(ok.status).toBe(201);
  });

  it("isolamento de tenant: não acessa profissional de outro business (404)", async () => {
    const bizA = await makeBusiness({ googleId: "g-a", slug: "a" });
    const profA = await Professional.create({ businessId: bizA._id, nome: "A", slugInterno: "a-prof", ativo: true });
    const bizB = await makeBusiness({ googleId: "g-b", slug: "b" });
    void bizB;
    mockedAuth.mockResolvedValue({ user: { googleId: "g-b" } });

    const res = await PATCH(makeReq({ nome: "Hack" }), ctx(String(profA._id)));
    expect(res.status).toBe(404);
  });

  it("bloqueia desativar o último profissional ativo (409)", async () => {
    const biz = await makeBusiness();
    const prof = await Professional.create({ businessId: biz._id, nome: "Único", slugInterno: "unico", ativo: true });
    mockedAuth.mockResolvedValue({ user: { googleId: biz.googleId } });
    const res = await PATCH(makeReq({ ativo: false }), ctx(String(prof._id)));
    expect(res.status).toBe(409);
  });

  it("permite desativar quando há outro ativo", async () => {
    const biz = await makeBusiness();
    const p1 = await Professional.create({ businessId: biz._id, nome: "P1", slugInterno: "p1", ativo: true });
    await Professional.create({ businessId: biz._id, nome: "P2", slugInterno: "p2", ativo: true });
    mockedAuth.mockResolvedValue({ user: { googleId: biz.googleId } });
    const res = await PATCH(makeReq({ ativo: false }), ctx(String(p1._id)));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ativo).toBe(false);
  });

  it("bloqueia excluir o último ativo (409)", async () => {
    const biz = await makeBusiness();
    const prof = await Professional.create({ businessId: biz._id, nome: "Solo", slugInterno: "solo", ativo: true });
    mockedAuth.mockResolvedValue({ user: { googleId: biz.googleId } });
    const res = await DELETE(makeReq(), ctx(String(prof._id)));
    expect(res.status).toBe(409);
  });

  it("GET nunca expõe a chave Asaas em texto plano", async () => {
    const biz = await makeBusiness({ googleId: "g-cob", slug: "cob" }, { agenda: false, agendaPublica: false, cobranca: true, nfse: false });
    mockedAuth.mockResolvedValue({ user: { googleId: "g-cob" } });
    await createPOST(makeReq({ nome: "Carla", billingMode: "own", asaasApiKey: "aact_secreta_1234" }));
    const res = await listGET();
    const json = await res.json();
    const serialized = JSON.stringify(json);
    expect(serialized).not.toContain("aact_secreta_1234");
    expect(json.professionals[0].asaasKeyLast4).toBe("1234");
  });
});
