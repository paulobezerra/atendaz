import { put, del } from "@vercel/blob";
import { HttpError } from "@/lib/professionals";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (dentro do limite de 4.5 MB das Vercel Functions)
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Valida (tipo + tamanho) e sobe a foto para o Vercel Blob com `access: 'public'`.
 * Porta central da integração (Guardrail de fidelidade — usa o `put` oficial, não inventa campos).
 * Retorna a URL pública. Lança HttpError(400) em arquivo inválido.
 */
export async function uploadFoto(
  businessId: string,
  professionalId: string,
  file: File
): Promise<string> {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new HttpError(400, "Arquivo ausente.");
  }
  if (!ALLOWED.includes(file.type)) {
    throw new HttpError(400, "Formato não permitido (use JPG, PNG ou WebP).");
  }
  if (file.size > MAX_BYTES) {
    throw new HttpError(400, "Arquivo maior que 2 MB.");
  }
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `professionals/${businessId}/${professionalId}-${Date.now()}.${ext}`;
  const blob = await put(name, file, { access: "public", addRandomSuffix: true });
  return blob.url;
}

/** Remove a foto do Blob. Best-effort: uma falha aqui não derruba a operação de negócio. */
export async function deleteFoto(url?: string | null): Promise<void> {
  if (!url) return;
  try {
    await del(url);
  } catch (e) {
    console.error("blob del falhou:", e);
  }
}
