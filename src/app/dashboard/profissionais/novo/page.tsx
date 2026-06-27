import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import ProfessionalForm from "../ProfessionalForm";

export const dynamic = "force-dynamic";

export default async function NovoProfissionalPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") redirect("/onboarding");

  return (
    <ProfessionalForm
      billingEnabled={business.modulos.cobranca || business.modulos.nfse}
      nfseEnabled={business.modulos.nfse}
    />
  );
}
