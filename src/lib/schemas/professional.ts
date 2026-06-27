import { z } from "zod";
import { nfseStrategyEnum, codigosFiscaisSchema } from "./onboarding";

/**
 * Schema do profissional (F2). O bloco de billing é condicional:
 * - `inherit`: usa o padrão do business (`billingConfig = null`).
 * - `own`: exige `asaasApiKey`; e, quando o módulo nfse está ativo, também
 *   `nfseStrategy` + `codigosFiscais` + `cpfCnpj`. A obrigatoriedade fina
 *   (nfse) é validada na rota, que conhece `business.modulos`.
 */
export const professionalSchema = z.object({
  nome: z.string().min(2, "Nome muito curto."),
  slugInterno: z.string().min(3, "Slug muito curto.").optional(),
  whatsapp: z.string().optional(),
  bio: z.string().optional(),
  ativo: z.boolean().optional(),
  billingMode: z.enum(["inherit", "own"]).optional(),
  // Presentes apenas quando billingMode === "own":
  asaasApiKey: z.string().optional(),
  nfseStrategy: nfseStrategyEnum.optional(),
  codigosFiscais: codigosFiscaisSchema,
  cpfCnpj: z.string().optional(),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;
