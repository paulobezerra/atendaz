"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MaskedInput } from "@/components/MaskedInput";
import { PessoaTipoField, type TipoPessoa } from "@/components/PessoaTipoField";
import { JargonLabel } from "@/components/JargonLabel";
import { JARGON } from "@/lib/copy/jargon";
import { normalizeSlug } from "@/lib/slug";

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

const formSchema = z.object({
  nome: z.string().min(2, "Informe o nome (mín. 2 caracteres)."),
  slugInterno: z.string().min(3, "Endereço interno muito curto."),
  whatsapp: z.string().optional(),
  bio: z.string().optional(),
  billingMode: z.enum(["inherit", "own"]),
  asaasApiKey: z.string().optional(),
  nfseStrategy: z.string().optional(),
  tipoPessoa: z.enum(["FISICA", "JURIDICA"]),
  cpfCnpj: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

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

  const slugTouched = useRef(false);
  const [showKey, setShowKey] = useState(false);
  const [asaasState, setAsaasState] =
    useState<"idle" | "checking" | "valid" | "invalid">("idle");

  const inferredTipo: TipoPessoa =
    (initial?.cpfCnpj ?? "").replace(/\D/g, "").length > 11
      ? "JURIDICA"
      : "FISICA";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initial?.nome ?? "",
      slugInterno: initial?.slugInterno ?? "",
      whatsapp: initial?.whatsapp ?? "",
      bio: initial?.bio ?? "",
      billingMode: (initial?.billingMode as "inherit" | "own") ?? "inherit",
      asaasApiKey: "",
      nfseStrategy: initial?.nfseStrategy ?? "AUTO_AFTER_PAYMENT",
      tipoPessoa: inferredTipo,
      cpfCnpj: initial?.cpfCnpj ?? "",
    },
  });

  const billingMode = form.watch("billingMode");

  async function checkSlug(value: string) {
    if (!value) return;
    const qs = new URLSearchParams({ slug: value });
    if (initial?.id) qs.set("exceptId", initial.id);
    const res = await fetch(`/api/professionals/validate-slug?${qs}`);
    const j = await res.json();
    if (!j.available) {
      form.setError("slugInterno", {
        message: j.reason ?? "Endereço indisponível.",
      });
    } else {
      form.clearErrors("slugInterno");
      if (j.slug) form.setValue("slugInterno", j.slug);
    }
  }

  async function checkAsaas(value: string) {
    if (billingMode !== "own" || !value) return;
    setAsaasState("checking");
    const res = await fetch("/api/onboarding/validate-asaas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ apiKey: value }),
    });
    const j = await res.json();
    setAsaasState(j.valid ? "valid" : "invalid");
  }

  async function onSubmit(values: FormValues) {
    const payload: Record<string, unknown> = {
      nome: values.nome,
      slugInterno: values.slugInterno,
      whatsapp: values.whatsapp,
      bio: values.bio,
    };
    if (billingEnabled) {
      payload.billingMode = values.billingMode;
      if (values.billingMode === "own") {
        if (values.asaasApiKey) payload.asaasApiKey = values.asaasApiKey;
        if (nfseEnabled) {
          payload.nfseStrategy = values.nfseStrategy;
          payload.cpfCnpj = values.cpfCnpj;
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
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast(j.error ?? "Não foi possível salvar.", "error");
      return;
    }
    toast(isEdit ? "Profissional atualizado." : "Profissional criado.");
    router.push("/dashboard/profissionais");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <nav className="text-xs text-muted-foreground">
        Profissionais › {isEdit ? "Editar" : "Novo"}
      </nav>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Maria Silva"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugTouched.current) {
                      form.setValue("slugInterno", normalizeSlug(e.target.value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slugInterno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço interno (slug) *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    slugTouched.current = true;
                    field.onChange(e);
                  }}
                  onBlur={() => checkSlug(field.value)}
                />
              </FormControl>
              <FormDescription>
                Identificador único do profissional dentro do seu negócio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <MaskedInput
                  kind="phone"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="(11) 99999-9999"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Breve descrição"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {billingEnabled && (
          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Faturamento
            </legend>

            <FormField
              control={form.control}
              name="billingMode"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      checked={field.value === "inherit"}
                      onChange={() => field.onChange("inherit")}
                    />
                    Usar faturamento padrão do negócio
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      checked={field.value === "own"}
                      onChange={() => field.onChange("own")}
                    />
                    Configurar faturamento próprio
                  </label>
                </FormItem>
              )}
            />

            {billingMode === "own" && (
              <div className="space-y-3 pt-1">
                <FormField
                  control={form.control}
                  name="asaasApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <JargonLabel hint={JARGON.meioPagamento}>
                        Token do meio de pagamento{" "}
                        {isEdit && initial?.temAsaasProprio
                          ? "(deixe em branco para manter)"
                          : "*"}
                      </JargonLabel>
                      <p className="mb-2 text-xs text-muted-foreground">
                        É a Chave de API da conta Asaas do profissional (painel
                        Asaas → Configurações → Integrações → Chaves de API).
                      </p>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type={showKey ? "text" : "password"}
                            placeholder={
                              isEdit && initial?.temAsaasProprio
                                ? `····${initial.asaasKeyLast4 ?? ""}`
                                : "$aact_..."
                            }
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setAsaasState("idle");
                            }}
                            onBlur={() => checkAsaas(field.value ?? "")}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowKey((s) => !s)}
                          aria-label={showKey ? "Ocultar" : "Mostrar"}
                        >
                          {showKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {asaasState === "checking" && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" /> Validando…
                        </p>
                      )}
                      {asaasState === "valid" && (
                        <p className="flex items-center gap-1 text-xs text-emerald-600">
                          <Check className="h-3 w-3" /> Token validado
                        </p>
                      )}
                      {asaasState === "invalid" && (
                        <p className="flex items-center gap-1 text-xs text-destructive">
                          <X className="h-3 w-3" /> Token inválido
                        </p>
                      )}
                      <FormDescription>
                        Guardado com criptografia AES-256. Nunca compartilhamos.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {nfseEnabled && (
                  <>
                    <FormField
                      control={form.control}
                      name="nfseStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <JargonLabel hint={JARGON.nfseStrategy} required>
                            Estratégia de NFS-e
                          </JargonLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NFSE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label>CPF/CNPJ *</Label>
                      <PessoaTipoField
                        tipo={form.watch("tipoPessoa")}
                        onTipoChange={(t) => form.setValue("tipoPessoa", t)}
                        documento={form.watch("cpfCnpj") ?? ""}
                        onDocumentoChange={(v) => form.setValue("cpfCnpj", v)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </fieldset>
        )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard/profissionais")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
