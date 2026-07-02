/**
 * Mockup flutuante do app (TEMPLATE/landing.html, seção Hero). Reusado como o
 * "lado visual" do Shell Público em telas de auth (onboarding) — mesma peça
 * que a landing usará quando existir (F0012), evitando recriar do zero.
 */
export default function AppMockupCard() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-200/60">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-xs text-white">
              A
            </span>
            Barbearia do Zé
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Receita do mês</p>
            <p className="mt-1 text-xl font-bold">R$ 12.480</p>
            <p className="mt-1 text-xs font-medium text-success">▲ 18% vs. mês passado</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Agendamentos hoje</p>
            <p className="mt-1 text-xl font-bold">14</p>
            <p className="mt-1 text-xs text-gray-400">3 aguardando confirmação</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                MS
              </span>
              Maria Silva · 14:30
            </span>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              Pago
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                JS
              </span>
              João Souza · 15:00
            </span>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              Aguardando
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -left-4 top-24 hidden rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg sm:block">
        <p className="text-[11px] text-gray-500">NFS-e emitida</p>
        <p className="text-sm font-semibold text-success">✓ Automático</p>
      </div>
      <div className="absolute -right-3 bottom-6 hidden rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg sm:block">
        <p className="text-[11px] text-gray-500">Cobrança Pix</p>
        <p className="text-sm font-semibold">
          R$ 60,00 <span className="text-success">recebido</span>
        </p>
      </div>
    </div>
  );
}
