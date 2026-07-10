import { NextResponse } from "next/server";
import { requireBusiness, findOwnedProfessional, HttpError } from "@/lib/professionals";
import { uploadFoto, deleteFoto } from "@/lib/blob";
import { logAudit } from "@/models/AuditLog";

export const dynamic = "force-dynamic";

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("professional foto error:", e);
  return NextResponse.json({ error: "Falha inesperada." }, { status: 500 });
}

/** POST — envia/atualiza a foto. 404 sem `modulos.agenda`; isolado por `businessId`. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const business = await requireBusiness();
    if (!business.modulos.agenda) {
      return NextResponse.json({ error: "Recurso não disponível." }, { status: 404 });
    }
    const { id } = await params;
    const prof = await findOwnedProfessional(business._id, id);

    let file: File | null = null;
    try {
      const form = await req.formData();
      const f = form.get("file");
      if (f instanceof File) file = f;
    } catch {
      return NextResponse.json({ error: "Requisição inválida (multipart esperado)." }, { status: 400 });
    }
    if (!file) return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });

    const oldUrl = prof.fotoUrl;
    const fotoUrl = await uploadFoto(String(business._id), String(prof._id), file);
    prof.fotoUrl = fotoUrl;
    await prof.save();
    if (oldUrl && oldUrl !== fotoUrl) await deleteFoto(oldUrl); // limpa a anterior (best-effort)

    await logAudit({
      entidade: "professional",
      entidadeId: String(prof._id),
      acao: "update_foto",
      businessId: String(business._id),
      payloadResumido: { hasFoto: true },
    });

    return NextResponse.json({ fotoUrl });
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE — remove a foto (best-effort no Blob). 404 sem `modulos.agenda`. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const business = await requireBusiness();
    if (!business.modulos.agenda) {
      return NextResponse.json({ error: "Recurso não disponível." }, { status: 404 });
    }
    const { id } = await params;
    const prof = await findOwnedProfessional(business._id, id);

    const oldUrl = prof.fotoUrl;
    prof.fotoUrl = undefined;
    await prof.save();
    await deleteFoto(oldUrl);

    await logAudit({
      entidade: "professional",
      entidadeId: String(prof._id),
      acao: "delete_foto",
      businessId: String(business._id),
      payloadResumido: { hasFoto: false },
    });

    return NextResponse.json({ fotoUrl: null });
  } catch (e) {
    return handleError(e);
  }
}
