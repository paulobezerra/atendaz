import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // recomendado para GCM

/**
 * Deriva uma chave determinística de 32 bytes (AES-256) a partir de
 * CRYPTO_MASTER_KEY, aceitando uma chave mestre de qualquer tamanho.
 */
function getKey(): Buffer {
  const master = process.env.CRYPTO_MASTER_KEY;
  if (!master) {
    throw new Error("CRYPTO_MASTER_KEY não definida no ambiente.");
  }
  return crypto.createHash("sha256").update(master, "utf8").digest();
}

/**
 * Criptografa um texto com AES-256-GCM.
 * Formato de saída: `iv:authTag:ciphertext` (cada parte em base64).
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/**
 * Descriptografa um payload no formato `iv:authTag:ciphertext`.
 * Lança erro se o payload for inválido ou tiver sido adulterado.
 */
export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Payload criptografado inválido.");
  }
  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
