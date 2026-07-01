import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Segmento from "@/models/Segmento";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
import PlatformSubscription from "@/models/PlatformSubscription";
import { onboardingSchema } from "@/lib/schemas/onboarding";
import { validateSlug, normalizeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

const TRIAL_DAYS = 30;

// F0002.6: onboarding de passo único. Não pede plano nem Asaas — cria o business
// em trial com o sistema completo liberado; plano vem depois (F0011) e Meio de
// Pagamento na F0002.7.
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

  // Segmento deve pertencer à lista controlada (sem texto livre)
  if (!(await Segmento.exists({ slug: data.segmento, ativo: true }))) {
    return NextResponse.json({ error: "Segmento inválido." }, { status: 400 });
  }

  try {
    // Trial sem plano (planoId: null) → módulos completos para o usuário testar tudo.
    // Ao escolher o plano (F0011), `modulos` passa a ser copiado do plano.
    const business = await Business.create({
      googleId,
      nomeFantasia: data.nomeFantasia,
      slug,
      email: session.user?.email ?? "",
      segmento: data.segmento,
      planoId: null,
      modulos: {
        agenda: true,
        agendaPublica: true,
        cobranca: true,
        nfse: true,
      },
      cpfCnpj: null,
      billingConfigPadrao: null,
      onboardingStatus: "COMPLETE",
    });

    await Professional.create({
      businessId: business._id,
      nome: data.profissionalNome,
      slugInterno: normalizeSlug(data.profissionalNome) || "profissional",
      ativo: true,
    });

    // Assinatura de plataforma em TRIAL, ainda sem plano/valor (definidos na F0011).
    await PlatformSubscription.create({
      businessId: business._id,
      planoId: null,
      status: "TRIAL",
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      qtdAgendasAtivas: 1,
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
