import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/login");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") {
    redirect("/onboarding");
  }

  const modulosAtivos = Object.entries(business.modulos)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {business.nomeFantasia}
        </h1>
        <SignOutButton />
      </div>
      <p className="mt-1 text-sm text-gray-500">/agendar/{business.slug}</p>

      <section className="mt-8 rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700">Módulos ativos</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {modulosAtivos.map((m) => (
            <span
              key={m}
              className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
            >
              {m}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
