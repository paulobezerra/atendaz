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

// F0002.6: onboarding de passo único (Identidade). Plano e Meio de Pagamento
// (Asaas) saíram daqui — escolha de plano é F0011, pagamento é F0002.7.
// Os enums acima permanecem exportados (usados por schemas/professional.ts).
export const onboardingSchema = z.object({
  nomeFantasia: z.string().min(2, "Nome fantasia muito curto."),
  slug: z.string().min(3, "Slug muito curto."),
  segmento: z.string().min(1, "Segmento obrigatório."),
  // Profissional inicial ("seu nome"):
  profissionalNome: z.string().min(2, "Nome do profissional muito curto."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
