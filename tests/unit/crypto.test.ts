import { encrypt, decrypt } from "@/lib/crypto";

describe("crypto AES-256-GCM", () => {
  beforeAll(() => {
    process.env.CRYPTO_MASTER_KEY = "chave-mestre-de-teste-atendaz";
  });

  it("faz roundtrip encrypt -> decrypt", () => {
    const plain = "$aact_sandbox_chave_secreta_123";
    const enc = encrypt(plain);
    expect(enc).not.toContain(plain); // armazenado != texto plano
    expect(decrypt(enc)).toBe(plain);
  });

  it("gera ciphertext diferente a cada chamada (IV aleatório)", () => {
    expect(encrypt("mesmo-valor")).not.toBe(encrypt("mesmo-valor"));
  });

  it("falha ao decifrar payload adulterado (authTag GCM)", () => {
    const enc = encrypt("segredo");
    const [iv, tag] = enc.split(":");
    const tampered = [iv, tag, Buffer.from("outro").toString("base64")].join(":");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("falha com payload em formato inválido", () => {
    expect(() => decrypt("xpto")).toThrow("inválido");
  });
});
