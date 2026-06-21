import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";

export async function GET() {
  try {
    await dbConnect();

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

    await Plano.deleteMany({});
    await Plano.insertMany(planos);

    return NextResponse.json({
      message: "Seed finalizado com sucesso",
      planosInseridos: planos.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
