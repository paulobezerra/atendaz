"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface PlanoDTO {
  id: string;
  slug: string;
  nome: string;
  precoBase: number;
  modulos: {
    agenda: boolean;
    agendaPublica: boolean;
    cobranca: boolean;
    nfse: boolean;
  };
}

export default function OnboardingWizard({
  planos,
  defaultProfissional,
}: {
  planos: PlanoDTO[];
  defaultProfissional: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    nomeFantasia: "",
    slug: "",
    segmento: "",
    planoId: "",
    asaasApiKey: "",
    nfseStrategy: "AUTO_AFTER_PAYMENT",
    profissionalNome: defaultProfissional,
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const plano = useMemo(
    () => planos.find((p) => p.id === form.planoId),
    [planos, form.planoId]
  );
  const precisaBilling = !!plano && (plano.modulos.cobranca || plano.modulos.nfse);

  async function checkSlug(): Promise<boolean> {
    const res = await fetch(
      `/api/onboarding/validate-slug?slug=${encodeURIComponent(form.slug)}`
    );
    const data = await res.json();
    if (!data.available) {
      setSlugStatus(data.reason ?? "Slug indisponível.");
      return false;
    }
    setSlugStatus(null);
    set("slug", data.slug);
    return true;
  }

  async function next() {
    setError(null);
    if (step === 1) {
      if (form.nomeFantasia.trim().length < 2) return setError("Informe o nome fantasia.");
      if (!(await checkSlug())) return;
    }
    if (step === 2 && !form.planoId) return setError("Selecione um plano.");
    // Passo 3 (billing) é pulado quando o plano não exige
    if (step === 2 && !precisaBilling) return setStep(4);
    if (step === 4 && !precisaBilling) return setStep(2);
    setStep((s) => Math.min(4, s + 1));
  }

  function back() {
    setError(null);
    if (step === 4 && !precisaBilling) return setStep(2);
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    setError(null);
    if (form.profissionalNome.trim().length < 2)
      return setError("Informe o nome do profissional.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nomeFantasia: form.nomeFantasia,
          slug: form.slug,
          segmento: form.segmento || undefined,
          planoId: form.planoId,
          asaasApiKey: precisaBilling ? form.asaasApiKey : undefined,
          nfseStrategy:
            precisaBilling && plano?.modulos.nfse ? form.nfseStrategy : undefined,
          profissionalNome: form.profissionalNome,
        }),
      });
      if (res.status === 201) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Falha ao concluir o onboarding.");
    } catch {
      setError("Erro de rede ao concluir o onboarding.");
    } finally {
      setSubmitting(false);
    }
  }

  const input =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao Atendaz</h1>
      <p className="mt-1 text-sm text-gray-500">Passo {precisaBilling ? step : step > 2 ? step - 1 : step} — configure seu negócio</p>

      <div className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Nome fantasia</label>
              <input
                className={input}
                value={form.nomeFantasia}
                onChange={(e) => set("nomeFantasia", e.target.value)}
                placeholder="Barbearia do Zé"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Slug público (/agendar/...)</label>
              <input
                className={input}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="barbearia-do-ze"
              />
              {slugStatus && <p className="mt-1 text-xs text-red-600">{slugStatus}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Segmento (opcional)</label>
              <input
                className={input}
                value={form.segmento}
                onChange={(e) => set("segmento", e.target.value)}
                placeholder="Barbearia, Clínica, ..."
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Escolha um plano</p>
            {planos.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${
                  form.planoId === p.id ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-300"
                }`}
              >
                <span>
                  <input
                    type="radio"
                    name="plano"
                    className="mr-2"
                    checked={form.planoId === p.id}
                    onChange={() => set("planoId", p.id)}
                  />
                  <span className="font-medium text-gray-900">{p.nome}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {Object.entries(p.modulos)
                      .filter(([, v]) => v)
                      .map(([k]) => k)
                      .join(", ")}
                  </span>
                </span>
                <span className="text-sm font-semibold text-gray-900">R$ {p.precoBase}</span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && precisaBilling && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Chave de API do Asaas</label>
              <input
                className={input}
                value={form.asaasApiKey}
                onChange={(e) => set("asaasApiKey", e.target.value)}
                placeholder="$aact_..."
              />
              <p className="mt-1 text-xs text-gray-500">Validada no Asaas e armazenada criptografada.</p>
            </div>
            {plano?.modulos.nfse && (
              <div>
                <label className="text-sm font-medium text-gray-700">Estratégia de emissão de NFS-e</label>
                <select
                  className={input}
                  value={form.nfseStrategy}
                  onChange={(e) => set("nfseStrategy", e.target.value)}
                >
                  <option value="AUTO_AFTER_PAYMENT">Automática após pagamento</option>
                  <option value="MANUAL_PER_PAYMENT">Manual por pagamento</option>
                  <option value="MANUAL_BATCH">Manual em lote</option>
                </select>
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <div>
            <label className="text-sm font-medium text-gray-700">Nome do profissional inicial</label>
            <input
              className={input}
              value={form.profissionalNome}
              onChange={(e) => set("profissionalNome", e.target.value)}
              placeholder="Seu nome"
            />
            <p className="mt-1 text-xs text-gray-500">Criamos automaticamente sua primeira agenda.</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
          <button
            onClick={back}
            disabled={step === 1 || submitting}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 disabled:opacity-40"
          >
            Voltar
          </button>
          {step < 4 ? (
            <button
              onClick={next}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
            >
              {submitting ? "Concluindo..." : "Concluir"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
