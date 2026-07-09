import { NextResponse } from "next/server";
import { requireBusiness, HttpError } from "@/lib/professionals";
import {
  billingModuleEnabled,
  serializeBillingStatus,
  saveBusinessBillingKey,
} from "@/lib/settings";
import { paymentConfigSchema } from "@/lib/schemas/settings";

export const dynamic = "force-dynamic";

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("settings/pagamentos error:", e);
  return NextResponse.json({ error: "Falha inesperada." }, { status: 500 });
}

/** GET — estado da conexão (DTO seguro). 404 se módulo desabilitado (D1). */
export async function GET() {
  try {
    const business = await requireBusiness();
    if (!billingModuleEnabled(business.modulos)) {
      return NextResponse.json({ error: "Recurso não disponível." }, { status: 404 });
    }
    return NextResponse.json(serializeBillingStatus(business));
  } catch (e) {
    return handleError(e);
  }
}

/** POST — conecta/atualiza o token Asaas (valida + criptografa). 404 se off. */
export async function POST(req: Request) {
  try {
    const business = await requireBusiness();
    if (!billingModuleEnabled(business.modulos)) {
      return NextResponse.json({ error: "Recurso não disponível." }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }

    const parsed = paymentConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const status = await saveBusinessBillingKey(business, parsed.data.apiKey);
    return NextResponse.json(status);
  } catch (e) {
    return handleError(e);
  }
}
