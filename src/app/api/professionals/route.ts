import { NextResponse } from "next/server";
import Professional from "@/models/Professional";
import { professionalSchema } from "@/lib/schemas/professional";
import { validateSlug } from "@/lib/slug";
import { logAudit } from "@/models/AuditLog";
import {
  requireBusiness,
  buildBillingConfig,
  serializeProfessional,
  HttpError,
} from "@/lib/professionals";

export const dynamic = "force-dynamic";

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (typeof e === "object" && e !== null && (e as { code?: number }).code === 11000) {
    return NextResponse.json({ error: "Slug já usado neste negócio." }, { status: 409 });
  }
  console.error("professionals error:", e);
  return NextResponse.json({ error: "Falha inesperada." }, { status: 500 });
}

// GET — lista os profissionais do business (escopo por businessId).
export async function GET() {
  try {
    const business = await requireBusiness();
    const profs = await Professional.find({ businessId: business._id }).sort({ createdAt: 1 });
    return NextResponse.json({ professionals: profs.map(serializeProfessional) });
  } catch (e) {
    return handleError(e);
  }
}

// POST — cria um profissional.
export async function POST(req: Request) {
  try {
    const business = await requireBusiness();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    const parsed = professionalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // slugInterno: usa o informado ou deriva do nome; valida formato/reservados
    const rawSlug = data.slugInterno || data.nome;
    const slugCheck = validateSlug(rawSlug);
    if (!slugCheck.valid) {
      return NextResponse.json({ error: slugCheck.reason }, { status: 400 });
    }
    const slugInterno = slugCheck.slug;

    if (await Professional.exists({ businessId: business._id, slugInterno })) {
      return NextResponse.json({ error: "Slug já usado neste negócio." }, { status: 409 });
    }

    const billingConfig = await buildBillingConfig(data, business.modulos);

    const prof = await Professional.create({
      businessId: business._id,
      nome: data.nome,
      slugInterno,
      whatsapp: data.whatsapp,
      bio: data.bio,
      billingConfig,
      ativo: data.ativo ?? true,
    });

    await logAudit({
      entidade: "professional",
      entidadeId: String(prof._id),
      acao: "create",
      businessId: String(business._id),
      payloadResumido: { nome: prof.nome, billingMode: billingConfig ? "own" : "inherit", ativo: prof.ativo },
    });

    return NextResponse.json(serializeProfessional(prof), { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
