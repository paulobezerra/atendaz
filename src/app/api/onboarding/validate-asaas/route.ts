import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateAsaasKey } from "@/lib/asaas";

export const dynamic = "force-dynamic";

// Validação onBlur da chave Asaas no wizard (feedback ✓/✗ antes do submit).
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.googleId) {
    return NextResponse.json({ valid: false, error: "Não autenticado." }, { status: 401 });
  }

  let body: { apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, error: "JSON inválido." }, { status: 400 });
  }

  if (!body.apiKey) {
    return NextResponse.json({ valid: false, error: "Chave vazia." });
  }

  const result = await validateAsaasKey(body.apiKey);
  return NextResponse.json(result);
}
