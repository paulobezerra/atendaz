import { POST } from "@/app/api/onboarding/route";
import dbConnect from "@/lib/mongodb";
import Segmento from "@/models/Segmento";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
import PlatformSubscription from "@/models/PlatformSubscription";

jest.mock("@/lib/auth", () => ({ getSession: jest.fn() }));

import { getSession } from "@/lib/auth";
const mockedAuth = getSession as jest.Mock;

function makeReq(body: unknown) {
  return new Request("http://localhost/api/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function seedSegmento() {
  await dbConnect();
  return Segmento.create({ slug: "barbearia", nome: "Barbearia", ativo: true, ordem: 0 });
}

describe("POST /api/onboarding (F0002.6 — passo único, trial)", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("retorna 401 sem sessão", async () => {
    mockedAuth.mockResolvedValue(null);
    const res = await POST(makeReq({}) as Request);
    expect(res.status).toBe(401);
  });

  it("cria Business (trial, módulos completos, sem plano) + Professional + PlatformSubscription", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-123", email: "dono@x.com" } });
    await seedSegmento();

    const res = await POST(
      makeReq({
        nomeFantasia: "Barbearia Zé",
        slug: "Barbearia Zé",
        segmento: "barbearia",
        profissionalNome: "Zé",
      }) as Request
    );
    expect(res.status).toBe(201);

    const biz = await Business.findOne({ googleId: "g-123" });
    expect(biz?.slug).toBe("barbearia-ze");
    expect(biz?.segmento).toBe("barbearia");
    expect(biz?.onboardingStatus).toBe("COMPLETE");
    // Trial: sem plano, sistema completo liberado, sem billing.
    expect(biz?.planoId ?? null).toBeNull();
    expect(biz?.modulos.agenda).toBe(true);
    expect(biz?.modulos.agendaPublica).toBe(true);
    expect(biz?.modulos.cobranca).toBe(true);
    expect(biz?.modulos.nfse).toBe(true);
    expect(biz?.billingConfigPadrao ?? null).toBeNull();

    const prof = await Professional.findOne({ businessId: biz!._id });
    expect(prof?.ativo).toBe(true);
    expect(prof?.slugInterno).toBe("ze");

    const sub = await PlatformSubscription.findOne({ businessId: biz!._id });
    expect(sub?.status).toBe("TRIAL");
    expect(sub?.planoId ?? null).toBeNull();
    expect(sub?.valorMensal ?? null).toBeNull();
    expect(sub?.trialEndsAt).toBeInstanceOf(Date);
  });

  it("rejeita segmento fora da lista controlada (400)", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-seg", email: "s@x.com" } });
    await seedSegmento();
    const res = await POST(
      makeReq({
        nomeFantasia: "Negócio X",
        slug: "negocio-x",
        segmento: "segmento-inexistente",
        profissionalNome: "Pedro",
      }) as Request
    );
    expect(res.status).toBe(400);
  });

  it("é idempotente: re-submit do mesmo googleId retorna 409", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-dup", email: "d@x.com" } });
    await seedSegmento();
    const body = {
      nomeFantasia: "Negócio A",
      slug: "negocio-a",
      segmento: "barbearia",
      profissionalNome: "Pedro",
    };
    const r1 = await POST(makeReq(body) as Request);
    expect(r1.status).toBe(201);
    const r2 = await POST(makeReq({ ...body, slug: "negocio-b" }) as Request);
    expect(r2.status).toBe(409);
    expect(await Business.countDocuments({ googleId: "g-dup" })).toBe(1);
  });

  it("rejeita slug reservado (400)", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-res", email: "r@x.com" } });
    await seedSegmento();
    const res = await POST(
      makeReq({
        nomeFantasia: "Xpto Ltda",
        slug: "admin",
        segmento: "barbearia",
        profissionalNome: "Pedro",
      }) as Request
    );
    expect(res.status).toBe(400);
  });

  it("rejeita dados inválidos do schema — nome muito curto (400)", async () => {
    mockedAuth.mockResolvedValue({ user: { googleId: "g-inv", email: "i@x.com" } });
    await seedSegmento();
    const res = await POST(
      makeReq({
        nomeFantasia: "X",
        slug: "negocio-y",
        segmento: "barbearia",
        profissionalNome: "Pedro",
      }) as Request
    );
    expect(res.status).toBe(400);
  });
});
