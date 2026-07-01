import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { ensureSeed } from "@/lib/seed";
import Business from "@/models/Business";
import Segmento from "@/models/Segmento";
import OnboardingForm, { type SegmentoDTO } from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
  await ensureSeed(); // garante segmentos (e planos p/ F0011) no banco (1x por instância)

  const existing = await Business.findOne({ googleId: session.user.googleId });
  if (existing?.onboardingStatus === "COMPLETE") redirect("/dashboard");

  const segmentosRaw = await Segmento.find({ ativo: true }).sort({ ordem: 1 }).lean();
  const segmentos: SegmentoDTO[] = segmentosRaw.map((s) => ({
    slug: s.slug,
    nome: s.nome,
  }));

  return (
    <OnboardingForm
      segmentos={segmentos}
      defaultProfissional={session.user.name ?? ""}
    />
  );
}
