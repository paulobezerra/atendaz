import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Plano from "@/models/Plano";
import Business, { IBillingConfig } from "@/models/Business";
import Professional from "@/models/Professional";
import PlatformSubscription from "@/models/PlatformSubscription";
import { onboardingSchema } from "@/lib/schemas/onboarding";
import { validateSlug, normalizeSlug } from "@/lib/slug";
import { validateAsaasKey } from "@/lib/asaas";
import { encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const TRIAL_DAYS = 30;

export async function POST(req: Request) {
  const session = await getSession();
  const googleId = session?.user?.googleId;
  if (!googleId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Validação de slug (formato + palavras reservadas)
  const slugCheck = validateSlug(data.slug);
  if (!slugCheck.valid) {
    return NextResponse.json({ error: slugCheck.reason }, { status: 400 });
  }
  const slug = slugCheck.slug;

  await dbConnect();

  // Idempotência: 1 business por googleId
  if (await Business.exists({ googleId })) {
    return NextResponse.json(
      { error: "Onboarding já concluído para esta conta." },
      { status: 409 }
    );
  }
  // Unicidade do slug
  if (await Business.exists({ slug })) {
    return NextResponse.json({ error: "Slug já está em uso." }, { status: 409 });
  }

  // Plano + cópia de módulos
  const plano = await Plano.findById(data.planoId);
  if (!plano || !plano.ativo) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }
  const modulos = {
    agenda: plano.modulos.agenda,
    agendaPublica: plano.modulos.agendaPublica,
    cobranca: plano.modulos.cobranca,
    nfse: plano.modulos.nfse,
  };

  // Gating: só pede/valida/criptografa Asaas se o plano tiver cobranca/nfse
  let billingConfigPadrao: IBillingConfig | null = null;
  if (modulos.cobranca || modulos.nfse) {
    if (!data.asaasApiKey) {
      return NextResponse.json(
        { error: "Chave Asaas obrigatória para este plano." },
        { status: 400 }
      );
    }
    const asaas = await validateAsaasKey(data.asaasApiKey);
    if (!asaas.valid) {
      return NextResponse.json(
        { error: asaas.error ?? "Chave Asaas inválida." },
        { status: 400 }
      );
    }
    billingConfigPadrao = {
      asaasApiKeyEncrypted: encrypt(data.asaasApiKey),
      nfseStrategy: modulos.nfse ? data.nfseStrategy : undefined,
      codigosFiscais: modulos.nfse ? data.codigosFiscais : undefined,
    };
  }

  try {
    const business = await Business.create({
      googleId,
      nomeFantasia: data.nomeFantasia,
      slug,
      email: session.user?.email ?? "",
      segmento: data.segmento,
      planoId: plano._id,
      modulos,
      cpfCnpj: data.cpfCnpj ?? null,
      billingConfigPadrao,
      onboardingStatus: "COMPLETE",
    });

    await Professional.create({
      businessId: business._id,
      nome: data.profissionalNome,
      slugInterno: normalizeSlug(data.profissionalNome) || "profissional",
      ativo: true,
    });

    await PlatformSubscription.create({
      businessId: business._id,
      planoId: plano._id,
      status: "TRIAL",
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      qtdAgendasAtivas: 1,
      valorMensal: plano.precoBase,
    });

    return NextResponse.json(
      {
        id: business._id,
        slug: business.slug,
        onboardingStatus: business.onboardingStatus,
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && (e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Registro duplicado." }, { status: 409 });
    }
    console.error("Onboarding error:", e);
    return NextResponse.json(
      { error: "Falha ao concluir onboarding." },
      { status: 500 }
    );
  }
}
