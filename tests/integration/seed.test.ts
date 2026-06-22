import { GET } from "@/app/api/admin/seed/route";
import Plano from "@/models/Plano";
import Segmento from "@/models/Segmento";
import dbConnect from "@/lib/mongodb";

describe("API Seed Integration", () => {
  it("deve inserir exatamente 3 planos e garantir idempotência via upsert", async () => {
    // Executa Seed
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(3);

    // Valida no banco
    await dbConnect();
    const count = await Plano.countDocuments();
    expect(count).toBe(3);

    const agendaSimples = await Plano.findOne({ slug: "agenda-simples" });
    expect(agendaSimples).toBeDefined();
    expect(agendaSimples?.modulos.agenda).toBe(true);

    // Testa idempotência (roda de novo sem duplicar)
    const response2 = await GET();
    const data2 = await response2.json();
    expect(data2.count).toBe(3);

    const count2 = await Plano.countDocuments();
    expect(count2).toBe(3);
  });

  it("deve semear segmentos (lista controlada) de forma idempotente", async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.segmentos.count).toBeGreaterThan(0);

    await dbConnect();
    const total = await Segmento.countDocuments();
    expect(total).toBe(data.segmentos.count);

    const barbearia = await Segmento.findOne({ slug: "barbearia" });
    expect(barbearia?.ativo).toBe(true);

    // Idempotência: rodar de novo não duplica
    await GET();
    expect(await Segmento.countDocuments()).toBe(total);
  });
});
