import type { IBillingConfig } from "@/models/Business";

/** Billing config resolvido — pode incluir `cpfCnpj` quando vem do override. */
export type ResolvedBillingConfig = (IBillingConfig & { cpfCnpj?: string }) | null;

interface HasBillingOverride {
  billingConfig?: (IBillingConfig & { cpfCnpj?: string }) | null;
}
interface HasBillingDefault {
  billingConfigPadrao?: IBillingConfig | null;
}

/**
 * Resolução central de billing (Guardrail 3). Única porta para obter a config
 * de cobrança/nota de um atendimento:
 * - retorna o override do `professional` se preenchido;
 * - senão, o `billingConfigPadrao` do `business`;
 * - senão, `null` (negócio sem cobrança/nfse — chamadores tratam como ausente).
 *
 * Nunca assume o token do business sem antes checar o override do profissional.
 */
export function resolveBillingConfig(
  professional: HasBillingOverride | null | undefined,
  business: HasBillingDefault | null | undefined
): ResolvedBillingConfig {
  const override = professional?.billingConfig;
  if (override && hasContent(override)) {
    return override;
  }
  return business?.billingConfigPadrao ?? null;
}

/** Considera o override "preenchido" se tiver chave Asaas ou códigos fiscais. */
function hasContent(cfg: IBillingConfig & { cpfCnpj?: string }): boolean {
  return Boolean(
    cfg.asaasApiKeyEncrypted ||
      cfg.nfseStrategy ||
      cfg.cpfCnpj ||
      (cfg.codigosFiscais && Object.keys(cfg.codigosFiscais).length > 0)
  );
}
