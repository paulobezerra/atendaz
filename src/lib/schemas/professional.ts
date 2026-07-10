import { z } from "zod";
import { nfseStrategyEnum, codigosFiscaisSchema } from "./onboarding";

/**
 * Schema do profissional (F2). O bloco de billing é condicional:
 * - `inherit`: usa o padrão do business (`billingConfig = null`).
 * - `own`: exige `asaasApiKey`; e, quando o módulo nfse está ativo, também
 *   `nfseStrategy` + `codigosFiscais` + `cpfCnpj`. A obrigatoriedade fina
 *   (nfse) é validada na rota, que conhece `business.modulos`.
 */
/** Redes sociais do perfil (F3.1) — todas opcionais. */
export const redesSociaisSchema = z
  .object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    site: z.string().optional(),
  })
  .optional();

export const professionalSchema = z.object({
  nome: z.string().min(2, "Nome muito curto."),
  slugInterno: z.string().min(3, "Slug muito curto.").optional(),
  whatsapp: z.string().optional(),
  bio: z.string().max(280, "A bio deve ter no máximo 280 caracteres.").optional(),
  redesSociais: redesSociaisSchema,
  ativo: z.boolean().optional(),
  billingMode: z.enum(["inherit", "own"]).optional(),
  // Presentes apenas quando billingMode === "own":
  asaasApiKey: z.string().optional(),
  nfseStrategy: nfseStrategyEnum.optional(),
  codigosFiscais: codigosFiscaisSchema,
  cpfCnpj: z.string().optional(),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;
