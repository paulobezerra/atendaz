import { POST as fotoPOST, DELETE as fotoDELETE } from "@/app/api/professionals/[id]/foto/route";
import { PATCH, GET } from "@/app/api/professionals/[id]/route";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
import AuditLog from "@/models/AuditLog";

jest.mock("@/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@vercel/blob", () => ({
  put: jest.fn().mockResolvedValue({ url: "https://blob.example/prof.jpg" }),
  del: jest.fn().mockResolvedValue(undefined),
}));

import { getSession } from "@/lib/auth";
import { put, del } from "@vercel/blob";
const mockedAuth = getSession as jest.Mock;
const mockedPut = put as jest.Mock;
const mockedDel = del as jest.Mock;

const AGENDA = { agenda: true, agendaPublica: true, cobranca: false, nfse: false };
const NO_AGENDA = { agenda: false, agendaPublica: false, cobranca: false, nfse: false };

async function makeBusiness(googleId: string, slug: string, modulos = AGENDA) {
  await dbConnect();
  const plano = await Plano.create({
    slug: `p-${Math.random().toString(36).slice(2, 8)}`,
    nome: "P", modulos, precoBase: 29, precoPorAgendaAdicional: 15, ativo: true,
  });
  return Business.create({
    googleId, nomeFantasia: "Biz", slug, email: "d@x.com", segmento: "barbearia",
    planoId: plano._id, modulos, onboardingStatus: "COMPLETE",
  });
}
const login = (googleId: string) => mockedAuth.mockResolvedValue({ user: { googleId } });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

function fotoReq(file?: File) {
  const fd = new FormData();
  if (file) fd.append("file", file);
  return new Request("http://localhost/api/professionals/x/foto", { method: "POST", body: fd });
}
function jsonReq(body: unknown) {
  return new Request("http://localhost/api/professionals/x", {
    method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}
const jpg = (bytes = 10) => new File([new Uint8Array(bytes)], "f.jpg", { type: "image/jpeg" });

describe("F3.1 — foto & perfil do profissional", () => {
  beforeAll(() => {
    // @vercel/blob é mockado; o valor não importa, só a presença (o upload checa a env).
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test";
  });
  beforeEach(() => {
    mockedAuth.mockReset();
    mockedPut.mockReset().mockResolvedValue({ url: "https://blob.example/prof.jpg" });
    mockedDel.mockReset().mockResolvedValue(undefined);
  });

  it("401 sem sessão (POST foto)", async () => {
    mockedAuth.mockResolvedValue(null);
    expect((await fotoPOST(fotoReq(jpg()), ctx("x"))).status).toBe(401);
  });

  it("404 sem modulos.agenda (POST foto)", async () => {
    const biz = await makeBusiness("g-off", "off", NO_AGENDA);
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    expect((await fotoPOST(fotoReq(jpg()), ctx(String(prof._id)))).status).toBe(404);
  });

  it("upload válido → salva fotoUrl, audita, chama put()", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    const res = await fotoPOST(fotoReq(jpg()), ctx(String(prof._id)));
    expect(res.status).toBe(200);
    expect((await res.json()).fotoUrl).toBe("https://blob.example/prof.jpg");
    expect(mockedPut).toHaveBeenCalledTimes(1);
    const saved = await Professional.findById(prof._id);
    expect(saved!.fotoUrl).toBe("https://blob.example/prof.jpg");
    expect(await AuditLog.findOne({ entidade: "professional", acao: "update_foto" })).not.toBeNull();
  });

  it("rejeita tipo inválido (400) e não chama put()", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    const txt = new File([new Uint8Array(5)], "f.txt", { type: "text/plain" });
    const res = await fotoPOST(fotoReq(txt), ctx(String(prof._id)));
    expect(res.status).toBe(400);
    expect(mockedPut).not.toHaveBeenCalled();
  });

  it("rejeita arquivo > 2 MB (400)", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    const big = new File([new Uint8Array(3 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
    expect((await fotoPOST(fotoReq(big), ctx(String(prof._id)))).status).toBe(400);
  });

  it("sem arquivo (400)", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    expect((await fotoPOST(fotoReq(), ctx(String(prof._id)))).status).toBe(400);
  });

  it("DELETE remove a foto → { fotoUrl: null } e del()", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true, fotoUrl: "https://blob.example/old.jpg" });
    login(biz.googleId);
    const res = await fotoDELETE(new Request("http://localhost/x", { method: "DELETE" }), ctx(String(prof._id)));
    expect(res.status).toBe(200);
    expect((await res.json()).fotoUrl).toBeNull();
    expect(mockedDel).toHaveBeenCalled();
    expect((await Professional.findById(prof._id))!.fotoUrl).toBeFalsy();
  });

  it("isolamento: foto de profissional de outro business → 404", async () => {
    const bizA = await makeBusiness("g-a", "a");
    const profA = await Professional.create({ businessId: bizA._id, nome: "A", slugInterno: "a", ativo: true });
    await makeBusiness("g-b", "b");
    login("g-b");
    expect((await fotoPOST(fotoReq(jpg()), ctx(String(profA._id)))).status).toBe(404);
  });

  it("PATCH redesSociais persiste (com agenda) e GET reflete", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    const res = await PATCH(jsonReq({ redesSociais: { instagram: "instagram.com/x" } }), ctx(String(prof._id)));
    expect(res.status).toBe(200);
    const got = await GET(new Request("http://localhost/x"), ctx(String(prof._id)));
    expect((await got.json()).redesSociais.instagram).toBe("instagram.com/x");
  });

  it("PATCH redesSociais sem agenda → 404 (habilitação)", async () => {
    const biz = await makeBusiness("g-off", "off", NO_AGENDA);
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    expect((await PATCH(jsonReq({ redesSociais: { instagram: "x" } }), ctx(String(prof._id)))).status).toBe(404);
  });

  it("bio > 280 → 400", async () => {
    const biz = await makeBusiness("g-a", "a");
    const prof = await Professional.create({ businessId: biz._id, nome: "P", slugInterno: "p", ativo: true });
    login(biz.googleId);
    expect((await PATCH(jsonReq({ bio: "x".repeat(281) }), ctx(String(prof._id)))).status).toBe(400);
  });
});
