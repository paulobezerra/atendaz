import { z } from "zod";

export const nfseStrategyEnum = z.enum([
  "AUTO_AFTER_PAYMENT",
  "MANUAL_PER_PAYMENT",
  "MANUAL_BATCH",
]);

export const codigosFiscaisSchema = z
  .object({
    municipalServiceCode: z.string().optional(),
    nbsCode: z.string().optional(),
    taxSituationCode: z.string().optional(),
    taxClassificationCode: z.string().optional(),
    operationIndicatorCode: z.string().optional(),
  })
  .optional();

export const onboardingSchema = z.object({
  nomeFantasia: z.string().min(2, "Nome fantasia muito curto."),
  slug: z.string().min(3, "Slug muito curto."),
  segmento: z.string().min(1, "Segmento obrigatório."),
  planoId: z.string().min(1, "Plano obrigatório."),
  cpfCnpj: z.string().optional().nullable(),
  // Campos de billing — exigidos apenas quando o plano tem cobranca/nfse:
  asaasApiKey: z.string().optional(),
  nfseStrategy: nfseStrategyEnum.optional(),
  codigosFiscais: codigosFiscaisSchema,
  // Profissional inicial:
  profissionalNome: z.string().min(2, "Nome do profissional muito curto."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
