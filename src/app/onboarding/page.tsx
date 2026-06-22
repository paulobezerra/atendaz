import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { ensureSeed } from "@/lib/seed";
import Business from "@/models/Business";
import Plano from "@/models/Plano";
import Segmento from "@/models/Segmento";
import OnboardingWizard, { type PlanoDTO, type SegmentoDTO } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
  await ensureSeed(); // garante planos + segmentos no banco (1x por instância)

  const existing = await Business.findOne({ googleId: session.user.googleId });
  if (existing?.onboardingStatus === "COMPLETE") redirect("/dashboard");

  const planosRaw = await Plano.find({ ativo: true }).lean();
  const planos: PlanoDTO[] = planosRaw.map((p) => ({
    id: String(p._id),
    slug: p.slug,
    nome: p.nome,
    precoBase: p.precoBase,
    modulos: {
      agenda: p.modulos.agenda,
      agendaPublica: p.modulos.agendaPublica,
      cobranca: p.modulos.cobranca,
      nfse: p.modulos.nfse,
    },
  }));

  const segmentosRaw = await Segmento.find({ ativo: true }).sort({ ordem: 1 }).lean();
  const segmentos: SegmentoDTO[] = segmentosRaw.map((s) => ({
    slug: s.slug,
    nome: s.nome,
  }));

  return (
    <OnboardingWizard
      planos={planos}
      segmentos={segmentos}
      defaultProfissional={session.user.name ?? ""}
    />
  );
}
