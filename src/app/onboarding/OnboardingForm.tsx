"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import SplitLayout from "@/components/SplitLayout";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormMessage,
} from "@/components/ui/form";
import { JargonLabel } from "@/components/JargonLabel";
import { JARGON } from "@/lib/copy/jargon";
import { onboardingSchema } from "@/lib/schemas/onboarding";
import { normalizeSlug } from "@/lib/slug";

export interface SegmentoDTO {
  slug: string;
  nome: string;
}

type FormValues = z.infer<typeof onboardingSchema>;

/**
 * F0002.6 — Onboarding de passo único (Identidade). Sem plano nem Asaas: o
 * usuário entra no trial com tudo liberado. Usa a fundação de UX da F0002.5.
 */
export default function OnboardingForm({
  segmentos,
  defaultProfissional,
}: {
  segmentos: SegmentoDTO[];
  defaultProfissional: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const slugTouched = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nomeFantasia: "",
      slug: "",
      segmento: "",
      profissionalNome: defaultProfissional,
    },
  });

  async function checkSlug(value: string) {
    if (!value) return;
    const res = await fetch(
      `/api/onboarding/validate-slug?slug=${encodeURIComponent(value)}`
    );
    const data = await res.json();
    if (!data.available) {
      form.setError("slug", {
        message: data.reason ?? "Endereço indisponível.",
      });
    } else {
      form.clearErrors("slug");
      if (data.slug) form.setValue("slug", data.slug);
    }
  }

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.status === 201) {
      toast("Tudo pronto! Bem-vindo ao Atendaz 🎉");
      router.push("/dashboard");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    toast(data.error ?? "Falha ao concluir o onboarding.", "error");
  }

  return (
    <SplitLayout
      mobileHeader={
        <>
          <span className="text-lg font-bold">◈ Atendaz</span>
          <span className="text-sm text-indigo-100">Vamos começar</span>
        </>
      }
      left={
        <>
          <p className="text-2xl font-bold">◈ Atendaz</p>
          <p className="mt-10 text-sm text-indigo-100">
            Leva menos de um minuto. Você entra com o sistema completo liberado no
            período de teste — plano e pagamento ficam para depois.
          </p>
        </>
      }
    >
      <h2 className="text-2xl font-bold text-foreground">
        Vamos configurar seu negócio
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Só o essencial para você já começar a usar.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <FormField
            control={form.control}
            name="nomeFantasia"
            render={({ field }) => (
              <FormItem>
                <JargonLabel required>Nome do negócio</JargonLabel>
                <FormControl>
                  <Input
                    placeholder="Barbearia do Zé"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!slugTouched.current) {
                        form.setValue("slug", normalizeSlug(e.target.value));
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <JargonLabel hint={JARGON.slug} required>
                  Endereço público
                </JargonLabel>
                <FormControl>
                  <Input
                    placeholder="barbearia-do-ze"
                    {...field}
                    onChange={(e) => {
                      slugTouched.current = true;
                      field.onChange(e);
                    }}
                    onBlur={() => checkSlug(field.value)}
                  />
                </FormControl>
                <FormDescription>
                  Seus clientes agendam em atendaz.com/agendar/
                  {field.value || "seu-endereco"}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="segmento"
            render={({ field }) => (
              <FormItem>
                <JargonLabel hint={JARGON.segmento} required>
                  Segmento
                </JargonLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu segmento…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {segmentos.map((s) => (
                      <SelectItem key={s.slug} value={s.slug}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profissionalNome"
            render={({ field }) => (
              <FormItem>
                <JargonLabel required>Seu nome</JargonLabel>
                <FormControl>
                  <Input placeholder="Maria Silva" {...field} />
                </FormControl>
                <FormDescription>
                  Criamos seu primeiro profissional automaticamente — você adiciona
                  mais depois.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Configurando…" : "Começar a usar"}
            </Button>
          </div>
        </form>
      </Form>
    </SplitLayout>
  );
}
