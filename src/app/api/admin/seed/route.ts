import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";
import Segmento from "@/models/Segmento";
import { normalizeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

// Lista controlada de segmentos do ramo de serviços (expansível).
const SEGMENTOS = [
  "Barbearia", "Salão de Beleza", "Estética", "Manicure e Pedicure",
  "Maquiagem", "Sobrancelhas e Cílios", "Depilação", "Tatuagem e Piercing",
  "Clínica Médica", "Odontologia", "Fisioterapia", "Psicologia",
  "Nutrição", "Fonoaudiologia", "Terapias Holísticas", "Personal Trainer",
  "Pilates", "Academia", "Yoga", "Petshop", "Veterinária", "Banho e Tosa",
  "Advocacia", "Contabilidade", "Consultoria", "Coaching", "Arquitetura",
  "Design", "Fotografia", "Marketing Digital", "Aulas Particulares",
  "Idiomas", "Música", "Reformas e Reparos", "Limpeza", "Eventos",
  "Mecânica Automotiva", "Outros",
];

export async function GET() {
  try {
    await dbConnect();

    // 1. Planos base (Fonte da Verdade Comercial)
    const planos = [
      {
        slug: "agenda-simples",
        nome: "Agenda Simples",
        modulos: { agenda: true, agendaPublica: true, cobranca: false, nfse: false },
        precoBase: 29,
        precoPorAgendaAdicional: 15,
        ativo: true,
      },
      {
        slug: "cobranca-nota",
        nome: "Cobrança + Nota",
        modulos: { agenda: false, agendaPublica: false, cobranca: true, nfse: true },
        precoBase: 39,
        precoPorAgendaAdicional: 0,
        ativo: true,
      },
      {
        slug: "completo",
        nome: "Completo",
        modulos: { agenda: true, agendaPublica: true, cobranca: true, nfse: true },
        precoBase: 59,
        precoPorAgendaAdicional: 25,
        ativo: true,
      },
    ];

    const planosResult = await Promise.all(
      planos.map((plano) =>
        Plano.findOneAndUpdate({ slug: plano.slug }, plano, {
          upsert: true,
          new: true,
        })
      )
    );

    // 2. Segmentos (lista controlada do onboarding) — idempotente
    const segmentosResult = await Promise.all(
      SEGMENTOS.map((nome, ordem) => {
        const slug = normalizeSlug(nome);
        return Segmento.findOneAndUpdate(
          { slug },
          { slug, nome, ordem, ativo: true },
          { upsert: true, new: true }
        );
      })
    );

    return NextResponse.json({
      message: "Seed finalizado com sucesso (Idempotente)",
      count: planosResult.length,
      planos: planosResult.map((r) => r.slug),
      segmentos: { count: segmentosResult.length },
    });
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Erro no seed.";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
