"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SplitLayout from "@/components/SplitLayout";
import Stepper, { type Step } from "@/components/Stepper";
import { useToast } from "@/components/Toast";
import { normalizeSlug } from "@/lib/slug";

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

export interface SegmentoDTO {
  slug: string;
  nome: string;
}

type StepKey = "identidade" | "plano" | "faturamento" | "profissional";

const META: Record<StepKey, { label: string; descricao: string; titulo: string; subtitulo: string }> = {
  identidade: {
    label: "Identidade",
    descricao: "Dê um nome e endereço ao negócio",
    titulo: "Configure sua identidade",
    subtitulo: "Como seu negócio vai aparecer para os clientes.",
  },
  plano: {
    label: "Plano",
    descricao: "Selecione o que melhor se encaixa",
    titulo: "Escolha seu plano",
    subtitulo: "Você pode mudar depois.",
  },
  faturamento: {
    label: "Faturamento",
    descricao: "Conecte sua conta Asaas",
    titulo: "Configure o faturamento",
    subtitulo: "Conecte sua conta Asaas para cobrar seus clientes.",
  },
  profissional: {
    label: "Profissional",
    descricao: "Confirme seu nome",
    titulo: "Último passo! 🎉",
    subtitulo: "Criamos sua primeira agenda automaticamente.",
  },
};

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function OnboardingWizard({
  planos,
  segmentos,
  defaultProfissional,
}: {
  planos: PlanoDTO[];
  segmentos: SegmentoDTO[];
  defaultProfissional: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [showAsaasKey, setShowAsaasKey] = useState(false);
  const [asaasStatus, setAsaasStatus] = useState<null | "checking" | "valid" | "invalid">(null);

  const [form, setForm] = useState({
    nomeFantasia: "",
    slug: "",
    segmento: "",
    planoId: "",
    asaasApiKey: "",
    nfseStrategy: "AUTO_AFTER_PAYMENT",
    profissionalNome: defaultProfissional,
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const plano = useMemo(() => planos.find((p) => p.id === form.planoId), [planos, form.planoId]);
  const precisaBilling = !!plano && (plano.modulos.cobranca || plano.modulos.nfse);

  const stepKeys: StepKey[] = precisaBilling
    ? ["identidade", "plano", "faturamento", "profissional"]
    : ["identidade", "plano", "profissional"];
  const currentKey = stepKeys[Math.min(idx, stepKeys.length - 1)];
  const isLast = idx === stepKeys.length - 1;
  const steps: Step[] = stepKeys.map((k) => ({ key: k, label: META[k].label, descricao: META[k].descricao }));

  async function checkSlug(): Promise<boolean> {
    if (!form.slug) {
      setSlugStatus("Informe o endereço público.");
      return false;
    }
    const res = await fetch(`/api/onboarding/validate-slug?slug=${encodeURIComponent(form.slug)}`);
    const data = await res.json();
    if (!data.available) {
      setSlugStatus(data.reason ?? "Slug indisponível.");
      return false;
    }
    setSlugStatus(null);
    set("slug", data.slug);
    return true;
  }

  async function checkAsaas() {
    if (!form.asaasApiKey) return;
    setAsaasStatus("checking");
    try {
      const res = await fetch("/api/onboarding/validate-asaas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey: form.asaasApiKey }),
      });
      const data = await res.json();
      setAsaasStatus(data.valid ? "valid" : "invalid");
    } catch {
      setAsaasStatus("invalid");
    }
  }

  function onNomeChange(v: string) {
    setForm((f) => ({ ...f, nomeFantasia: v, slug: slugTouched ? f.slug : normalizeSlug(v) }));
  }

  async function goNext() {
    setError(null);
    if (currentKey === "identidade") {
      if (form.nomeFantasia.trim().length < 2) return setError("Informe o nome fantasia.");
      if (!form.segmento) return setError("Selecione um segmento.");
      if (!(await checkSlug())) return;
    }
    if (currentKey === "plano" && !form.planoId) return setError("Selecione um plano.");
    if (currentKey === "faturamento" && !form.asaasApiKey) return setError("Informe a chave do Asaas.");
    setIdx((i) => Math.min(stepKeys.length - 1, i + 1));
  }

  function goBack() {
    setError(null);
    setIdx((i) => Math.max(0, i - 1));
  }

  async function submit() {
    setError(null);
    if (form.profissionalNome.trim().length < 2) return setError("Informe o nome do profissional.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nomeFantasia: form.nomeFantasia,
          slug: form.slug,
          segmento: form.segmento,
          planoId: form.planoId,
          asaasApiKey: precisaBilling ? form.asaasApiKey : undefined,
          nfseStrategy: precisaBilling && plano?.modulos.nfse ? form.nfseStrategy : undefined,
          profissionalNome: form.profissionalNome,
        }),
      });
      if (res.status === 201) {
        toast("Tudo pronto! Bem-vindo ao Atendaz 🎉", "success");
        router.push("/dashboard");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Falha ao concluir o onboarding.");
      toast(data.error ?? "Falha ao concluir o onboarding.", "error");
    } catch {
      setError("Erro de rede ao concluir o onboarding.");
      toast("Erro de rede ao concluir o onboarding.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const meta = META[currentKey];

  return (
    <SplitLayout
      mobileHeader={
        <>
          <span className="text-lg font-bold">◈ Atendaz</span>
          <span className="text-sm text-indigo-100">
            {meta.label} ({idx + 1}/{stepKeys.length})
          </span>
        </>
      }
      left={
        <>
          <p className="text-2xl font-bold">◈ Atendaz</p>
          <div className="my-10">
            <Stepper steps={steps} current={idx} />
          </div>
          <p className="text-sm text-indigo-200">Leva menos de 5 minutos para estar no ar.</p>
        </>
      }
    >
      <h2 className="text-2xl font-bold text-gray-900">{meta.titulo}</h2>
      <p className="mt-1 text-sm text-gray-500">{meta.subtitulo}</p>

      <div className="mt-8 space-y-5">
        {currentKey === "identidade" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Nome fantasia *</label>
              <input
                className={inputCls}
                value={form.nomeFantasia}
                onChange={(e) => onNomeChange(e.target.value)}
                placeholder="Barbearia do Zé"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Endereço público *</label>
              <div className="mt-1 flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <span className="text-sm text-gray-400">/agendar/</span>
                <input
                  className="w-full py-2 text-sm focus:outline-none"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  onBlur={() => form.slug && checkSlug()}
                  placeholder="barbearia-do-ze"
                />
              </div>
              {slugStatus && <p className="mt-1 text-xs text-red-600">{slugStatus}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Segmento *</label>
              <select className={inputCls} value={form.segmento} onChange={(e) => set("segmento", e.target.value)}>
                <option value="">Selecione seu segmento…</option>
                {segmentos.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {currentKey === "plano" && (
          <div className="space-y-3">
            {planos.map((p) => {
              const selected = form.planoId === p.id;
              const mods = Object.entries(p.modulos)
                .filter(([, v]) => v)
                .map(([k]) => k);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => set("planoId", p.id)}
                  className={`flex w-full items-start justify-between rounded-lg border p-4 text-left transition ${
                    selected ? "border-primary bg-indigo-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          selected ? "border-primary" : "border-gray-400"
                        }`}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <span className="font-medium text-gray-900">{p.nome}</span>
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {mods.map((m) => (
                        <span key={m} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {m}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-900">R$ {p.precoBase}/mês</span>
                </button>
              );
            })}
          </div>
        )}

        {currentKey === "faturamento" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Chave API Asaas *</label>
              <div className="mt-1 flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <input
                  type={showAsaasKey ? "text" : "password"}
                  className="w-full py-2 text-sm focus:outline-none"
                  value={form.asaasApiKey}
                  onChange={(e) => {
                    set("asaasApiKey", e.target.value);
                    setAsaasStatus(null);
                  }}
                  onBlur={checkAsaas}
                  placeholder="$aact_..."
                />
                <button
                  type="button"
                  onClick={() => setShowAsaasKey((s) => !s)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  {showAsaasKey ? "ocultar" : "mostrar"}
                </button>
              </div>
              {asaasStatus === "checking" && <p className="mt-1 text-xs text-gray-500">Validando chave…</p>}
              {asaasStatus === "valid" && <p className="mt-1 text-xs text-emerald-600">✓ Chave validada</p>}
              {asaasStatus === "invalid" && <p className="mt-1 text-xs text-red-600">✗ Chave inválida ou sem permissão</p>}
              <p className="mt-1 text-xs text-gray-400">Armazenada com criptografia AES-256. Nunca compartilhamos.</p>
            </div>
            {plano?.modulos.nfse && (
              <div>
                <label className="text-sm font-medium text-gray-700">Estratégia de emissão de NFS-e</label>
                <select className={inputCls} value={form.nfseStrategy} onChange={(e) => set("nfseStrategy", e.target.value)}>
                  <option value="AUTO_AFTER_PAYMENT">Automática após pagamento</option>
                  <option value="MANUAL_PER_PAYMENT">Manual por pagamento</option>
                  <option value="MANUAL_BATCH">Manual em lote</option>
                </select>
              </div>
            )}
          </>
        )}

        {currentKey === "profissional" && (
          <div>
            <label className="text-sm font-medium text-gray-700">Seu nome *</label>
            <input
              className={inputCls}
              value={form.profissionalNome}
              onChange={(e) => set("profissionalNome", e.target.value)}
              placeholder="Maria Silva"
            />
            <p className="mt-1 text-xs text-gray-500">
              Você poderá adicionar mais profissionais depois, nas configurações.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
          <button
            onClick={goBack}
            disabled={idx === 0 || submitting}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 disabled:opacity-40"
          >
            ← Voltar
          </button>
          {isLast ? (
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting ? "Configurando…" : "Concluir ✓"}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Continuar →
            </button>
          )}
        </div>
      </div>
    </SplitLayout>
  );
}
