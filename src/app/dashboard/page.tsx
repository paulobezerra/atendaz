import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
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
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-sm text-gray-500 hover:text-gray-900">
            Sair
          </button>
        </form>
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
