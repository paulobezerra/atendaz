import { NextResponse } from "next/server";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await ensureSeed(true); // manual: sempre executa
    return NextResponse.json({
      message: "Seed finalizado com sucesso (Idempotente)",
      count: result.planos.length,
      planos: result.planos,
      segmentos: { count: result.segmentos },
    });
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Erro no seed.";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
