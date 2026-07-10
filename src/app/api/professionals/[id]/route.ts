import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Professional from "@/models/Professional";
import { professionalSchema } from "@/lib/schemas/professional";
import { validateSlug } from "@/lib/slug";
import { logAudit } from "@/models/AuditLog";
import {
  requireBusiness,
  buildBillingConfig,
  serializeProfessional,
  findOwnedProfessional,
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
  console.error("professional [id] error:", e);
  return NextResponse.json({ error: "Falha inesperada." }, { status: 500 });
}

async function countActive(businessId: mongoose.Types.ObjectId, exceptId?: string) {
  const query: Record<string, unknown> = { businessId, ativo: true };
  if (exceptId) query._id = { $ne: exceptId };
  return Professional.countDocuments(query);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const business = await requireBusiness();
    const { id } = await params;
    const prof = await findOwnedProfessional(business._id, id);
    return NextResponse.json(serializeProfessional(prof));
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const business = await requireBusiness();
    const { id } = await params;
    const prof = await findOwnedProfessional(business._id, id);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    const parsed = professionalSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (data.nome !== undefined) prof.nome = data.nome;
    if (data.whatsapp !== undefined) prof.whatsapp = data.whatsapp;

    // Perfil (F3.1) — bio e redes só existem com o módulo agenda (habilitação → 404).
    const mexeNoPerfil = data.bio !== undefined || data.redesSociais !== undefined;
    if (mexeNoPerfil && !business.modulos.agenda) {
      return NextResponse.json({ error: "Recurso não disponível." }, { status: 404 });
    }
    if (data.bio !== undefined) prof.bio = data.bio;
    if (data.redesSociais !== undefined) {
      prof.redesSociais = data.redesSociais;
      prof.markModified("redesSociais");
    }

    if (data.slugInterno !== undefined) {
      const slugCheck = validateSlug(data.slugInterno);
      if (!slugCheck.valid) {
        return NextResponse.json({ error: slugCheck.reason }, { status: 400 });
      }
      if (
        await Professional.exists({
          businessId: business._id,
          slugInterno: slugCheck.slug,
          _id: { $ne: prof._id },
        })
      ) {
        return NextResponse.json({ error: "Slug já usado neste negócio." }, { status: 409 });
      }
      prof.slugInterno = slugCheck.slug;
    }

    // Invariante: não desativar o último profissional ativo
    if (data.ativo === false && prof.ativo) {
      const others = await countActive(business._id, String(prof._id));
      if (others === 0) {
        return NextResponse.json(
          { error: "Todo negócio precisa de ao menos um profissional ativo." },
          { status: 409 }
        );
      }
    }
    if (data.ativo !== undefined) prof.ativo = data.ativo;

    // billing: só reprocessa se o cliente enviou algo de billing
    if (data.billingMode !== undefined || data.asaasApiKey !== undefined) {
      const existing = prof.billingConfig as
        | (typeof prof.billingConfig & { cpfCnpj?: string })
        | null;
      // schema.partial() pode deixar nome ausente; buildBillingConfig só usa campos de billing
      prof.billingConfig = await buildBillingConfig(
        { ...data, nome: prof.nome },
        business.modulos,
        existing
      );
      prof.markModified("billingConfig");
    }

    await prof.save();

    await logAudit({
      entidade: "professional",
      entidadeId: String(prof._id),
      acao: data.ativo === false ? "deactivate" : data.ativo === true ? "activate" : "update",
      businessId: String(business._id),
      payloadResumido: { nome: prof.nome, ativo: prof.ativo, billingMode: prof.billingConfig ? "own" : "inherit", perfilAlterado: mexeNoPerfil },
    });

    return NextResponse.json(serializeProfessional(prof));
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const business = await requireBusiness();
    const { id } = await params;
    const prof = await findOwnedProfessional(business._id, id);

    if (prof.ativo) {
      const others = await countActive(business._id, String(prof._id));
      if (others === 0) {
        return NextResponse.json(
          { error: "Todo negócio precisa de ao menos um profissional ativo." },
          { status: 409 }
        );
      }
    }

    await prof.deleteOne();

    await logAudit({
      entidade: "professional",
      entidadeId: String(prof._id),
      acao: "delete",
      businessId: String(business._id),
      payloadResumido: { nome: prof.nome },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
