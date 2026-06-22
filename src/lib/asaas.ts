export interface AsaasValidation {
  valid: boolean;
  status?: number;
  error?: string;
}

/**
 * Valida uma chave de API do Asaas contra o endpoint oficial `/myAccount`
 * (autenticação via header `access_token`). Não inventa campos/endpoints
 * (Guardrail 3). A URL base vem de `ASAAS_BASE_URL` (sandbox ou produção).
 */
export async function validateAsaasKey(apiKey: string): Promise<AsaasValidation> {
  const baseUrl = process.env.ASAAS_BASE_URL;
  if (!baseUrl) {
    throw new Error("ASAAS_BASE_URL não definida no ambiente.");
  }
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "Chave Asaas vazia." };
  }

  try {
    const res = await fetch(`${baseUrl}/myAccount`, {
      method: "GET",
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      return { valid: true, status: res.status };
    }
    return {
      valid: false,
      status: res.status,
      error: "Chave Asaas inválida ou sem permissão.",
    };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Falha ao validar chave Asaas.",
    };
  }
}
