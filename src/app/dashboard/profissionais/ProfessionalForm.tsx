"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export interface ProfessionalFormData {
  id?: string;
  nome?: string;
  slugInterno?: string;
  whatsapp?: string | null;
  bio?: string | null;
  billingMode?: string;
  temAsaasProprio?: boolean;
  asaasKeyLast4?: string;
  nfseStrategy?: string | null;
  cpfCnpj?: string | null;
}

const NFSE_OPTIONS = [
  { value: "AUTO_AFTER_PAYMENT", label: "Automática após o pagamento" },
  { value: "MANUAL_PER_PAYMENT", label: "Manual por cobrança" },
  { value: "MANUAL_BATCH", label: "Manual em lote" },
];

export default function ProfessionalForm({
  initial,
  billingEnabled,
  nfseEnabled,
}: {
  initial?: ProfessionalFormData;
  billingEnabled: boolean;
  nfseEnabled: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(initial?.id);

  const [nome, setNome] = useState(initial?.nome ?? "");
  const [slugInterno, setSlugInterno] = useState(initial?.slugInterno ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");

  const [billingMode, setBillingMode] = useState<"inherit" | "own">(
    (initial?.billingMode as "inherit" | "own") ?? "inherit"
  );
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [asaasState, setAsaasState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [nfseStrategy, setNfseStrategy] = useState(initial?.nfseStrategy ?? "AUTO_AFTER_PAYMENT");
  const [cpfCnpj, setCpfCnpj] = useState(initial?.cpfCnpj ?? "");
  const [saving, setSaving] = useState(false);

  // slug derivado do nome enquanto o usuário não o editou manualmente
  function onNomeChange(v: string) {
    setNome(v);
    if (!slugTouched) {
      setSlugInterno(
        v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      );
    }
  }

  async function checkSlug() {
    if (!slugInterno) return;
    const qs = new URLSearchParams({ slug: slugInterno });
    if (initial?.id) qs.set("exceptId", initial.id);
    const res = await fetch(`/api/professionals/validate-slug?${qs}`);
    const j = await res.json();
    setSlugError(j.available ? null : j.reason ?? "Slug indisponível.");
    if (j.slug) setSlugInterno(j.slug);
  }

  async function checkAsaas() {
    if (billingMode !== "own" || !asaasApiKey) return;
    setAsaasState("checking");
    const res = await fetch("/api/onboarding/validate-asaas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ apiKey: asaasApiKey }),
    });
    const j = await res.json();
    setAsaasState(j.valid ? "valid" : "invalid");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (slugError) return;
    setSaving(true);

    const payload: Record<string, unknown> = { nome, slugInterno, whatsapp, bio };
    if (billingEnabled) {
      payload.billingMode = billingMode;
      if (billingMode === "own") {
        if (asaasApiKey) payload.asaasApiKey = asaasApiKey;
        if (nfseEnabled) {
          payload.nfseStrategy = nfseStrategy;
          payload.cpfCnpj = cpfCnpj;
        }
      }
    }

    const res = await fetch(
      isEdit ? `/api/professionals/${initial!.id}` : "/api/professionals",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast(j.error ?? "Não foi possível salvar.", "error");
      return;
    }
    toast(isEdit ? "Profissional atualizado." : "Profissional criado.");
    router.push("/dashboard/profissionais");
    router.refresh();
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <nav className="text-xs text-gray-500">Profissionais › {isEdit ? "Editar" : "Novo"}</nav>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Nome *</label>
        <input className={inputCls} value={nome} onChange={(e) => onNomeChange(e.target.value)} required minLength={2} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Endereço interno (slug) *</label>
        <input
          className={inputCls}
          value={slugInterno}
          onChange={(e) => { setSlugTouched(true); setSlugInterno(e.target.value); }}
          onBlur={checkSlug}
          required
        />
        {slugError && <p className="mt-1 text-xs text-red-600">{slugError}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">WhatsApp</label>
          <input className={inputCls} value={whatsapp ?? ""} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Bio (opcional)</label>
          <input className={inputCls} value={bio ?? ""} onChange={(e) => setBio(e.target.value)} />
        </div>
      </div>

      {billingEnabled && (
        <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-semibold text-gray-700">Faturamento</legend>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="radio" checked={billingMode === "inherit"} onChange={() => setBillingMode("inherit")} />
            Usar faturamento padrão do negócio
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="radio" checked={billingMode === "own"} onChange={() => setBillingMode("own")} />
            Configurar faturamento próprio
          </label>

          {billingMode === "own" && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Chave API Asaas {isEdit && initial?.temAsaasProprio ? "(deixe em branco para manter)" : "*"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    className={inputCls}
                    value={asaasApiKey}
                    onChange={(e) => { setAsaasApiKey(e.target.value); setAsaasState("idle"); }}
                    onBlur={checkAsaas}
                    placeholder={isEdit && initial?.temAsaasProprio ? `····${initial.asaasKeyLast4 ?? ""}` : "$aact_..."}
                  />
                  <button type="button" onClick={() => setShowKey((s) => !s)} className="text-xs text-gray-500">
                    {showKey ? "ocultar" : "ver"}
                  </button>
                </div>
                {asaasState === "checking" && <p className="mt-1 text-xs text-gray-500">Validando…</p>}
                {asaasState === "valid" && <p className="mt-1 text-xs text-emerald-600">✓ Chave validada</p>}
                {asaasState === "invalid" && <p className="mt-1 text-xs text-red-600">✗ Chave inválida</p>}
                <p className="mt-1 text-xs text-gray-400">Chave criptografada com AES-256; nunca compartilhamos.</p>
              </div>

              {nfseEnabled && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Estratégia de NFS-e *</label>
                    <select className={inputCls} value={nfseStrategy ?? ""} onChange={(e) => setNfseStrategy(e.target.value)}>
                      {NFSE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">CPF/CNPJ *</label>
                    <input className={inputCls} value={cpfCnpj ?? ""} onChange={(e) => setCpfCnpj(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}
        </fieldset>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.push("/dashboard/profissionais")} className="text-sm text-gray-500 hover:text-gray-900">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !nome || !slugInterno || Boolean(slugError)}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
