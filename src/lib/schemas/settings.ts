import { z } from "zod";

/**
 * Conexão do meio de pagamento (F0002.8). Nesta fase, só o token Asaas (D2);
 * os códigos fiscais de NFS-e ficam para fase posterior.
 */
export const paymentConfigSchema = z.object({
  apiKey: z.string().min(1, "Informe o token de API do Asaas."),
});

export type PaymentConfigInput = z.infer<typeof paymentConfigSchema>;
