import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, CreditCard, Gem, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import { billingModuleEnabled, serializeBillingStatus } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") redirect("/onboarding");

  const billingEnabled = billingModuleEnabled(business.modulos);
  const { connected } = serializeBillingStatus(business);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Ajustes do seu negócio no Atendaz.</p>
      </div>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Identidade (edição em fase posterior) */}
        <div className="flex items-center gap-4 px-5 py-4 opacity-60">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-400">
            <Store className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">Identidade do negócio</p>
            <p className="truncate text-sm text-gray-500">Nome, endereço público (slug) e segmento.</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">em breve</span>
        </div>

        {/* Pagamentos e NFS-e — habilitado por módulo (D1) */}
        {billingEnabled && (
          <Link
            href="/dashboard/configuracoes/pagamentos"
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">Pagamentos e NFS-e</p>
              <p className="truncate text-sm text-gray-500">Conecte o meio de pagamento para ativar cobranças e notas.</p>
            </div>
            {connected ? (
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:inline-flex">
                <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
              </span>
            ) : (
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning sm:inline-flex">
                <AlertCircle className="h-3.5 w-3.5" /> Não conectado
              </span>
            )}
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
          </Link>
        )}

        {/* Plano e assinatura (gancho F0011) */}
        <div className="flex items-center gap-4 px-5 py-4 opacity-60">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-400">
            <Gem className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">Plano e assinatura</p>
            <p className="truncate text-sm text-gray-500">Gerencie seu plano da plataforma.</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">em breve</span>
        </div>
      </div>
    </div>
  );
}
