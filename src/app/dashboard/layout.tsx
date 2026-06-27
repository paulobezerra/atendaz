import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") {
    redirect("/onboarding");
  }

  return (
    <AppShell
      business={{
        nomeFantasia: business.nomeFantasia,
        slug: business.slug,
        modulos: {
          agenda: business.modulos.agenda,
          cobranca: business.modulos.cobranca,
          nfse: business.modulos.nfse,
        },
      }}
      user={{ nome: session.user.name }}
    >
      {children}
    </AppShell>
  );
}
