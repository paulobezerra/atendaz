import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";

export async function GET() {
  try {
    // 1. Garantir conexão
    await dbConnect();

    // 2. Definir planos base (Fonte da Verdade Comercial)
    const planos = [
      {
        slug: "agenda-simples",
        nome: "Agenda Simples",
        modulos: {
          agenda: true,
          agendaPublica: true,
          cobranca: false,
          nfse: false,
        },
        precoBase: 29,
        precoPorAgendaAdicional: 15,
        ativo: true,
      },
      {
        slug: "cobranca-nota",
        nome: "Cobrança + Nota",
        modulos: {
          agenda: false,
          agendaPublica: false,
          cobranca: true,
          nfse: true,
        },
        precoBase: 39,
        precoPorAgendaAdicional: 0,
        ativo: true,
      },
      {
        slug: "completo",
        nome: "Completo",
        modulos: {
          agenda: true,
          agendaPublica: true,
          cobranca: true,
          nfse: true,
        },
        precoBase: 59,
        precoPorAgendaAdicional: 25,
        ativo: true,
      },
    ];

    // 3. Upsert inteligente (idempotente)
    const results = await Promise.all(
      planos.map((plano) =>
        Plano.findOneAndUpdate({ slug: plano.slug }, plano, {
          upsert: true,
          new: true,
        })
      )
    );

    return NextResponse.json({
      message: "Seed finalizado com sucesso (Idempotente)",
      count: results.length,
      planos: results.map((r) => r.slug),
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
