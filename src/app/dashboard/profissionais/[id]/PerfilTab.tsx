"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Upload, Trash2, Loader2, AtSign, Share2, Music2, Globe, Phone } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  bio: z.string().max(280, "A bio deve ter no máximo 280 caracteres.").optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  site: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export interface PerfilInitial {
  id: string;
  fotoUrl?: string | null;
  bio?: string | null;
  redesSociais?: { instagram?: string; facebook?: string; tiktok?: string; site?: string } | null;
}

const REDES = [
  { name: "instagram" as const, icon: AtSign, ph: "instagram.com/seu-perfil" },
  { name: "facebook" as const, icon: Share2, ph: "facebook.com/seu-perfil" },
  { name: "tiktok" as const, icon: Music2, ph: "tiktok.com/@seu-perfil" },
  { name: "site" as const, icon: Globe, ph: "https://seu-site.com" },
];

export default function PerfilTab({ initial }: { initial: PerfilInitial }) {
  const router = useRouter();
  const { toast } = useToast();
  const [fotoUrl, setFotoUrl] = useState<string | null>(initial.fotoUrl ?? null);
  const [busyFoto, setBusyFoto] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      bio: initial.bio ?? "",
      instagram: initial.redesSociais?.instagram ?? "",
      facebook: initial.redesSociais?.facebook ?? "",
      tiktok: initial.redesSociais?.tiktok ?? "",
      site: initial.redesSociais?.site ?? "",
    },
  });

  async function onPickFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo
    if (!file) return;
    setBusyFoto(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/professionals/${initial.id}/foto`, { method: "POST", body: fd });
    setBusyFoto(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast(j.error ?? "Não foi possível enviar a foto.", "error");
      return;
    }
    const j = await res.json();
    setFotoUrl(j.fotoUrl);
    toast("Foto atualizada.");
    router.refresh();
  }

  async function onRemoveFoto() {
    setBusyFoto(true);
    const res = await fetch(`/api/professionals/${initial.id}/foto`, { method: "DELETE" });
    setBusyFoto(false);
    if (!res.ok) {
      toast("Não foi possível remover a foto.", "error");
      return;
    }
    setFotoUrl(null);
    toast("Foto removida.");
    router.refresh();
  }

  async function onSubmit(v: FormValues) {
    const redesSociais = {
      instagram: v.instagram || undefined,
      facebook: v.facebook || undefined,
      tiktok: v.tiktok || undefined,
      site: v.site || undefined,
    };
    const res = await fetch(`/api/professionals/${initial.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bio: v.bio ?? "", redesSociais }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast(j.error ?? "Não foi possível salvar.", "error");
      return;
    }
    toast("Perfil salvo.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* FOTO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Foto do profissional</h2>
        <p className="mt-0.5 text-sm text-gray-500">Aparece na página pública de agendamento. JPG, PNG ou WebP, até 2 MB.</p>
        <div className="mt-4 flex items-center gap-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gray-100 text-gray-400">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt="Foto do profissional" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {busyFoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Trocar foto
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onPickFoto} disabled={busyFoto} />
            </label>
            {fotoUrl && (
              <button type="button" onClick={onRemoveFoto} disabled={busyFoto}
                className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5">
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BIO + REDES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="bio" className="mb-1 block">Bio</Label>
            <Textarea id="bio" rows={3} maxLength={280} placeholder="Uma breve descrição do seu perfil público." {...form.register("bio")} />
            {form.formState.errors.bio && <p className="mt-1 text-xs text-danger">{form.formState.errors.bio.message}</p>}
            <p className="mt-1 text-xs text-gray-400">Até 280 caracteres.</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Redes sociais <span className="font-normal text-gray-400">(opcionais)</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              {REDES.map(({ name, icon: Icon, ph }) => (
                <div key={name} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <input aria-label={name} placeholder={ph} className="h-10 w-full text-sm placeholder:text-gray-400 focus:outline-none" {...form.register(name)} />
                </div>
              ))}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500"><Phone className="h-3.5 w-3.5" /> O WhatsApp fica na aba <b>Dados</b> (é usado para confirmações).</p>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={form.formState.isSubmitting}>Salvar perfil</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
