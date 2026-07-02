import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Professional from "@/models/Professional";
import { serializeProfessional } from "@/lib/professionals";
import ProfessionalForm from "../ProfessionalForm";

export const dynamic = "force-dynamic";

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") redirect("/onboarding");

  if (!mongoose.Types.ObjectId.isValid(id)) notFound();
  const prof = await Professional.findOne({ _id: id, businessId: business._id });
  if (!prof) notFound();

  return (
    <ProfessionalForm
      initial={serializeProfessional(prof)}
      billingEnabled={business.modulos.cobranca || business.modulos.nfse}
      nfseEnabled={business.modulos.nfse}
    />
  );
}
