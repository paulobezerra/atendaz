import { resolveBillingConfig } from "@/lib/billing";

describe("resolveBillingConfig (Guardrail 3)", () => {
  const businessPadrao = {
    billingConfigPadrao: { asaasApiKeyEncrypted: "enc-business", nfseStrategy: "AUTO_AFTER_PAYMENT" as const },
  };

  it("retorna o override do profissional quando preenchido", () => {
    const prof = { billingConfig: { asaasApiKeyEncrypted: "enc-prof", cpfCnpj: "123" } };
    const result = resolveBillingConfig(prof, businessPadrao);
    expect(result?.asaasApiKeyEncrypted).toBe("enc-prof");
    expect(result?.cpfCnpj).toBe("123");
  });

  it("herda o padrão do business quando o override é null", () => {
    const prof = { billingConfig: null };
    const result = resolveBillingConfig(prof, businessPadrao);
    expect(result?.asaasApiKeyEncrypted).toBe("enc-business");
  });

  it("herda o padrão do business quando o override é um objeto vazio", () => {
    const prof = { billingConfig: {} };
    const result = resolveBillingConfig(prof, businessPadrao);
    expect(result?.asaasApiKeyEncrypted).toBe("enc-business");
  });

  it("retorna null quando não há override nem padrão (plano sem cobrança/nfse)", () => {
    const prof = { billingConfig: null };
    const business = { billingConfigPadrao: null };
    expect(resolveBillingConfig(prof, business)).toBeNull();
  });

  it("é seguro com professional/business ausentes", () => {
    expect(resolveBillingConfig(null, null)).toBeNull();
    expect(resolveBillingConfig(undefined, businessPadrao)?.asaasApiKeyEncrypted).toBe("enc-business");
  });
});
