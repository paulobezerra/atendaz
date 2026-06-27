import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Professional from "@/models/Professional";

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
  const qtdProfissionais = await Professional.countDocuments({
    businessId: business._id,
    ativo: true,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Início</h1>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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

      <Link
        href="/dashboard/profissionais"
        className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-primary"
      >
        <h2 className="text-sm font-semibold text-gray-700">Profissionais</h2>
        <p className="mt-1 text-2xl font-bold text-gray-900">{qtdProfissionais}</p>
        <p className="mt-1 text-xs text-gray-500">ativo(s) — gerenciar →</p>
      </Link>
    </div>
  );
}
