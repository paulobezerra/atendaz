import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
import { serializeProfessional } from "@/lib/professionals";
import ProfessionalsList from "./ProfessionalsList";

export const dynamic = "force-dynamic";

export default async function ProfissionaisPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") redirect("/onboarding");

  const profs = await Professional.find({ businessId: business._id }).sort({ createdAt: 1 });
  const professionals = profs.map(serializeProfessional);
  const billingEnabled = business.modulos.cobranca || business.modulos.nfse;

  return (
    <ProfessionalsList
      initial={professionals}
      billingEnabled={billingEnabled}
    />
  );
}
