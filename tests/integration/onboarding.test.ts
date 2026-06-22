import { POST } from "@/app/api/onboarding/route";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
import PlatformSubscription from "@/models/PlatformSubscription";
import { decrypt } from "@/lib/crypto";

jest.mock("@/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/asaas", () => ({
  validateAsaasKey: jest.fn().mockResolvedValue({ valid: true }),
}));

import { getSession } from "@/lib/auth";
const mockedAuth = getSession as jest.Mock;

function makeReq(body: unknown) {
  return new Request("http://localhost/api/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function seedPlano(over: Record<string, unknown> = {}) {
  await dbConnect();
  return Plano.create({
    slug: "agenda-simples",
    nome: "Agenda Simples",
    modulos: { agenda: true, agendaPublica: true, cobranca: false, nfse: false },
    precoBase: 29,
    precoPorAgendaAdicional: 15,
    ativo: true,
    ...over,
  });
}

describe("POST /api/onboarding", () => {
  beforeAll(() => {
    process.env.CRYPTO_MASTER_KEY = "chave-mestre-teste";
    process.env.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3";
  });
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("retorna 401 sem sessão", async () => {
    mockedAuth.mockResolvedValue(null);
    const res = await POST(makeReq({}) as Request);
    expect(res.status).toBe(401);
  });

  it("cria Business + Professional + PlatformSubscription (plano grátis)", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-123", email: "dono@x.com" } });
    const plano = await seedPlano();

    const res = await POST(
      makeReq({
        nomeFantasia: "Barbearia Zé",
        slug: "Barbearia Zé",
        segmento: "barbearia",
        planoId: plano._id.toString(),
        profissionalNome: "Zé",
      }) as Request
    );
    expect(res.status).toBe(201);

    const biz = await Business.findOne({ googleId: "g-123" });
    expect(biz?.slug).toBe("barbearia-ze");
    expect(biz?.modulos.agenda).toBe(true);
    expect(biz?.onboardingStatus).toBe("COMPLETE");
    expect(biz?.billingConfigPadrao ?? null).toBeNull();

    const prof = await Professional.findOne({ businessId: biz!._id });
    expect(prof?.ativo).toBe(true);
    expect(prof?.slugInterno).toBe("ze");

    const sub = await PlatformSubscription.findOne({ businessId: biz!._id });
    expect(sub?.status).toBe("TRIAL");
    expect(sub?.valorMensal).toBe(29);
    expect(sub?.trialEndsAt).toBeInstanceOf(Date);
  });

  it("é idempotente: re-submit do mesmo googleId retorna 409", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-dup", email: "d@x.com" } });
    const plano = await seedPlano();
    const body = {
      nomeFantasia: "Negócio A",
      slug: "negocio-a",
      planoId: plano._id.toString(),
      profissionalNome: "Pedro",
    };
    const r1 = await POST(makeReq(body) as Request);
    expect(r1.status).toBe(201);
    const r2 = await POST(makeReq({ ...body, slug: "negocio-b" }) as Request);
    expect(r2.status).toBe(409);
    expect(await Business.countDocuments({ googleId: "g-dup" })).toBe(1);
  });

  it("plano pago: valida e criptografa a chave Asaas (gating)", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-pay", email: "p@x.com" } });
    const plano = await seedPlano({
      slug: "completo",
      nome: "Completo",
      modulos: { agenda: true, agendaPublica: true, cobranca: true, nfse: true },
      precoBase: 59,
    });

    const res = await POST(
      makeReq({
        nomeFantasia: "Clínica Vida",
        slug: "clinica-vida",
        planoId: plano._id.toString(),
        profissionalNome: "Dra Ana",
        asaasApiKey: "$aact_chave_real",
        nfseStrategy: "AUTO_AFTER_PAYMENT",
      }) as Request
    );
    expect(res.status).toBe(201);

    const biz = await Business.findOne({ googleId: "g-pay" });
    const enc = biz?.billingConfigPadrao?.asaasApiKeyEncrypted;
    expect(enc).toBeTruthy();
    expect(enc).not.toContain("$aact_chave_real");
    expect(decrypt(enc!)).toBe("$aact_chave_real");
    expect(biz?.billingConfigPadrao?.nfseStrategy).toBe("AUTO_AFTER_PAYMENT");
  });

  it("plano pago sem chave Asaas retorna 400", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-nokey", email: "n@x.com" } });
    const plano = await seedPlano({
      slug: "cobranca-nota",
      nome: "Cobrança + Nota",
      modulos: { agenda: false, agendaPublica: false, cobranca: true, nfse: true },
      precoBase: 39,
    });
    const res = await POST(
      makeReq({
        nomeFantasia: "Emissor",
        slug: "emissor-notas",
        planoId: plano._id.toString(),
        profissionalNome: "Fulano",
      }) as Request
    );
    expect(res.status).toBe(400);
  });

  it("rejeita slug reservado", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-res", email: "r@x.com" } });
    const plano = await seedPlano();
    const res = await POST(
      makeReq({
        nomeFantasia: "Xpto Ltda",
        slug: "admin",
        planoId: plano._id.toString(),
        profissionalNome: "Pedro",
      }) as Request
    );
    expect(res.status).toBe(400);
  });
});
