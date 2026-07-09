import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import { billingModuleEnabled, serializeBillingStatus } from "@/lib/settings";
import PaymentForm from "./PaymentForm";

export const dynamic = "force-dynamic";

export default async function PagamentosPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") redirect("/onboarding");

  // Habilitação por módulo (D1): sem cobrança/NFS-e, a rota não existe (404).
  if (!billingModuleEnabled(business.modulos)) notFound();

  const status = serializeBillingStatus(business);

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/dashboard/configuracoes" className="hover:text-gray-700">Configurações</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-700">Pagamentos e NFS-e</span>
      </nav>
      <PaymentForm initial={status} />
    </div>
  );
}
