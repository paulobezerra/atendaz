"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Info,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaymentHelp from "@/components/PaymentHelp";

const schema = z.object({
  apiKey: z.string().min(1, "Informe o token de API do Asaas."),
});
type FormValues = z.infer<typeof schema>;

export interface PaymentStatus {
  connected: boolean;
  last4: string | null;
}

export default function PaymentForm({ initial }: { initial: PaymentStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>(initial);
  const [editing, setEditing] = useState(!initial.connected);
  const [showKey, setShowKey] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur", // valida ao sair do campo (plano T7), não só no submit
    defaultValues: { apiKey: "" },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/settings/pagamentos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ apiKey: values.apiKey }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast(j.error ?? "Não foi possível conectar.", "error");
      return;
    }
    const j = (await res.json()) as PaymentStatus;
    setStatus(j);
    setEditing(false);
    setShowKey(false);
    form.reset({ apiKey: "" });
    toast("Meio de pagamento conectado.");
    router.refresh();
  }

  // Estado conectado (e não editando): resumo com últimos 4 dígitos + "Atualizar".
  if (status.connected && !editing) {
    return (
      <>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Meio de Pagamento e NFS-e</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3 w-3" /> Conectado
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">Cobranças e NFS-e estão ativas para este negócio.</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Token de API</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-gray-700">
                •••• •••• •••• {status.last4 ?? "••••"}
              </span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Atualizar token
              </button>
            </div>
          </div>
        </div>
        <PaymentHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      </>
    );
  }

  // Estado desconectado / editando: formulário.
  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Configurar Meio de Pagamento e NFS-e</h1>
            <p className="mt-1 text-sm text-gray-600">
              As cobranças (Pix, cartão e boleto) e a emissão de NFS-e são feitas pelo{" "}
              <span className="font-medium text-gray-800">Asaas</span>, nosso parceiro de pagamentos.
              Conecte sua conta para ativar esses recursos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
        >
          <BookOpen className="h-4 w-4" /> Como conectar: passo a passo
        </button>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="apiKey" className="mb-1 flex items-center gap-1.5">
              Token de API
              <span className="text-gray-400" title="A cobrança e a emissão de NFS-e são feitas através do Asaas, nosso parceiro de pagamentos.">
                <Info className="h-3.5 w-3.5" />
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  placeholder="$aact_..."
                  className="pr-3"
                  {...form.register("apiKey")}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                aria-label={showKey ? "Ocultar token" : "Mostrar token"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.apiKey && (
              <p className="mt-1.5 text-xs text-danger">{form.formState.errors.apiKey.message}</p>
            )}
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5" />
              Seu token é guardado com criptografia AES-256. Nunca o compartilhe por e-mail ou print.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {status.connected ? "Atualizar token" : "Salvar e conectar"}
            </Button>
          </div>
        </form>
      </div>

      <PaymentHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
