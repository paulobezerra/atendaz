import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  CalendarCheck,
  CreditCard,
  FileText,
  LineChart,
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Professional from "@/models/Professional";

export const dynamic = "force-dynamic";

type Metric = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning";
  hint?: string;
  href?: string;
};

const TONE: Record<Metric["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

function MetricCard({ m }: { m: Metric }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${TONE[m.tone]}`}>
          <m.icon className="h-5 w-5" aria-hidden />
        </span>
        {m.hint && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {m.hint}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">{m.label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{m.value}</p>
    </>
  );
  const cls =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition";
  return m.href ? (
    <Link href={m.href} className={`${cls} hover:border-primary hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.googleId) redirect("/");

  await dbConnect();
  const business = await Business.findOne({ googleId: session.user.googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") {
    redirect("/onboarding");
  }

  const qtdProfissionais = await Professional.countDocuments({
    businessId: business._id,
    ativo: true,
  });

  // Só profissionais tem dado real hoje. Métricas de módulos ativos entram como
  // placeholder honesto ("em breve") até as features (agenda/cobrança/nfse) existirem.
  const metrics: Metric[] = [
    {
      label: "Profissionais ativos",
      value: String(qtdProfissionais),
      icon: Users,
      tone: "primary",
      href: "/dashboard/profissionais",
    },
  ];
  if (business.modulos.agenda) {
    metrics.push({ label: "Agendamentos hoje", value: "—", icon: CalendarCheck, tone: "primary", hint: "em breve" });
  }
  if (business.modulos.cobranca) {
    metrics.push({ label: "Cobranças pendentes", value: "—", icon: CreditCard, tone: "warning", hint: "em breve" });
  }
  if (business.modulos.nfse) {
    metrics.push({ label: "NFS-e emitidas", value: "—", icon: FileText, tone: "success", hint: "em breve" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visão geral</h1>
          <p className="text-sm text-gray-500">Resumo do {business.nomeFantasia}.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} m={m} />
        ))}
      </div>

      {/* Gráfico + composição — estado honesto até haver movimento para exibir */}
      <div className={`grid gap-4 ${business.modulos.cobranca ? "lg:grid-cols-3" : ""}`}>
        <div
          className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${
            business.modulos.cobranca ? "lg:col-span-2" : ""
          }`}
        >
          <h3 className="font-semibold text-gray-900">Resumo financeiro</h3>
          <p className="text-sm text-gray-500">Últimos 12 meses</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-12 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-gray-400">
              <LineChart className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-medium text-gray-700">Sem dados por enquanto</p>
            <p className="max-w-xs text-xs text-gray-500">
              Seu resumo financeiro aparece aqui assim que houver agendamentos e
              cobranças registrados.
            </p>
          </div>
        </div>

        {business.modulos.cobranca && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">Formas de recebimento</h3>
            <p className="text-sm text-gray-500">Este mês</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-gray-400">
                <PieChart className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-medium text-gray-700">Sem cobranças ainda</p>
              <p className="max-w-[16rem] text-xs text-gray-500">
                A composição por Pix, cartão e boleto aparece aqui assim que houver
                cobranças pagas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
