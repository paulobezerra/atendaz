"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export interface ProfessionalDTO {
  id: string;
  nome: string;
  slugInterno: string;
  ativo: boolean;
  billingMode: string;
  temAsaasProprio: boolean;
  asaasKeyLast4?: string;
}

export default function ProfessionalsList({
  initial,
  billingEnabled,
}: {
  initial: ProfessionalDTO[];
  billingEnabled: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  const activeCount = items.filter((p) => p.ativo).length;

  async function toggleAtivo(p: ProfessionalDTO) {
    setBusyId(p.id);
    const res = await fetch(`/api/professionals/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ativo: !p.ativo }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast(j.error ?? "Não foi possível atualizar.", "error");
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, ativo: !p.ativo } : x))
    );
    toast(p.ativo ? "Profissional desativado." : "Profissional ativado.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
        <Link
          href="/dashboard/profissionais/novo"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          + Adicionar
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {items.map((p) => {
          const isLastActive = p.ativo && activeCount === 1;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0"
            >
              <Link href={`/dashboard/profissionais/${p.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{p.nome}</p>
                <p className="truncate text-xs text-gray-500">/{p.slugInterno}</p>
              </Link>

              {billingEnabled && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.temAsaasProprio
                      ? "bg-indigo-50 text-primary"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.temAsaasProprio
                    ? `Próprio ····${p.asaasKeyLast4 ?? ""}`
                    : "Padrão"}
                </span>
              )}

              <button
                onClick={() => toggleAtivo(p)}
                disabled={busyId === p.id || isLastActive}
                title={
                  isLastActive
                    ? "Todo negócio precisa de ao menos um profissional ativo."
                    : undefined
                }
                className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                  p.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.ativo ? "ON" : "OFF"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
