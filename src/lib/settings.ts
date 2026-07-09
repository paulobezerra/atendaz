import type { IBusiness, IModulos } from "@/models/Business";
import { validateAsaasKey } from "@/lib/asaas";
import { encrypt, decrypt } from "@/lib/crypto";
import { logAudit } from "@/models/AuditLog";
import { HttpError } from "@/lib/professionals";

/**
 * A tela/rota "Pagamentos e NFS-e" só existe quando o negócio tem cobrança ou
 * NFS-e (habilitação por módulo — Guardrail 2 / D1). Desabilitado → 404.
 */
export function billingModuleEnabled(modulos: IModulos): boolean {
  return modulos.cobranca || modulos.nfse;
}

/**
 * DTO seguro: nunca expõe a chave Asaas — só o estado da conexão e os últimos
 * 4 dígitos (Guardrail 3).
 */
export function serializeBillingStatus(business: IBusiness) {
  const enc = business.billingConfigPadrao?.asaasApiKeyEncrypted;
  let last4: string | null = null;
  if (enc) {
    try {
      last4 = decrypt(enc).slice(-4);
    } catch {
      /* chave ilegível — ignora */
    }
  }
  return { connected: Boolean(enc), last4 };
}

/**
 * Conecta ou **atualiza** (D3: sem desconectar) o token Asaas do negócio:
 * valida no Asaas (Guardrail 3 — não inventa endpoints), criptografa com
 * AES-256-GCM e faz merge em `billingConfigPadrao`, preservando
 * `nfseStrategy`/`codigosFiscais` já existentes. Auditado **sem** a chave.
 */
export async function saveBusinessBillingKey(business: IBusiness, apiKey: string) {
  if (!billingModuleEnabled(business.modulos)) {
    throw new HttpError(404, "Recurso não disponível.");
  }

  const check = await validateAsaasKey(apiKey);
  if (!check.valid) {
    throw new HttpError(400, check.error ?? "Chave Asaas inválida.");
  }

  const existing = business.billingConfigPadrao;
  business.billingConfigPadrao = {
    asaasApiKeyEncrypted: encrypt(apiKey),
    nfseStrategy: existing?.nfseStrategy,
    codigosFiscais: existing?.codigosFiscais,
  };
  await business.save();

  await logAudit({
    entidade: "business",
    entidadeId: String(business._id),
    acao: "connect_payment",
    businessId: String(business._id),
    payloadResumido: { connected: true }, // NUNCA a chave
  });

  return serializeBillingStatus(business);
}
