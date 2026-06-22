import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Plano from "@/models/Plano";
import OnboardingWizard, { type PlanoDTO } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
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

  return (
    <OnboardingWizard
      planos={planos}
      defaultProfissional={session.user.name ?? ""}
    />
  );
}
