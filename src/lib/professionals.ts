import mongoose from "mongoose";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Business, { IBillingConfig, IModulos } from "@/models/Business";
import Professional, { type IProfessional } from "@/models/Professional";
import { validateAsaasKey } from "@/lib/asaas";
import { encrypt, decrypt } from "@/lib/crypto";
import type { ProfessionalInput } from "@/lib/schemas/professional";

/** Erro de domínio com status HTTP associado (tratado nas rotas). */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Resolve o business da sessão (tenant). Lança 401 se não autenticado. */
export async function requireBusiness() {
  const session = await getSession();
  const googleId = session?.user?.googleId;
  if (!googleId) throw new HttpError(401, "Não autenticado.");
  await dbConnect();
  const business = await Business.findOne({ googleId });
  if (!business || business.onboardingStatus !== "COMPLETE") {
    throw new HttpError(404, "Negócio não encontrado.");
  }
  return business;
}

/**
 * Busca um profissional garantindo o escopo do tenant: 404 se o id for inválido
 * ou se o profissional for de outro business (nunca vaza existência — Guardrail 1).
 */
export async function findOwnedProfessional(
  businessId: mongoose.Types.ObjectId,
  id: string
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "Profissional não encontrado.");
  }
  const prof = await Professional.findOne({ _id: id, businessId });
  if (!prof) throw new HttpError(404, "Profissional não encontrado.");
  return prof;
}

type OwnBillingConfig = IBillingConfig & { cpfCnpj?: string };

/**
 * Constrói o `billingConfig` do profissional a partir do input, aplicando
 * gating de módulo (Guardrail 2), validação de chave no Asaas e criptografia
 * AES-256-GCM (Guardrail 3). Retorna `null` quando herda do business.
 *
 * `existing` permite manter a chave já criptografada quando o usuário edita
 * sem redigitar a chave.
 */
export async function buildBillingConfig(
  input: ProfessionalInput,
  modulos: IModulos,
  existing?: OwnBillingConfig | null
): Promise<OwnBillingConfig | null> {
  const billingEnabled = modulos.cobranca || modulos.nfse;

  // Se o negócio não tem cobrança/nfse, qualquer billing enviado é rejeitado.
  if (!billingEnabled) {
    if (input.billingMode === "own" || input.asaasApiKey) {
      throw new HttpError(400, "Este negócio não possui módulo de cobrança/nota.");
    }
    return null;
  }

  if (input.billingMode !== "own") {
    return null; // herda o padrão do business
  }

  // Faturamento próprio: resolve a chave (nova validada+criptografada ou a já existente)
  let asaasApiKeyEncrypted = existing?.asaasApiKeyEncrypted;
  if (input.asaasApiKey) {
    const check = await validateAsaasKey(input.asaasApiKey);
    if (!check.valid) {
      throw new HttpError(400, check.error ?? "Chave Asaas inválida.");
    }
    asaasApiKeyEncrypted = encrypt(input.asaasApiKey);
  }
  if (!asaasApiKeyEncrypted) {
    throw new HttpError(400, "Chave Asaas obrigatória para faturamento próprio.");
  }

  const config: OwnBillingConfig = { asaasApiKeyEncrypted };

  if (modulos.nfse) {
    if (!input.nfseStrategy) {
      throw new HttpError(400, "Estratégia de NFS-e obrigatória.");
    }
    config.nfseStrategy = input.nfseStrategy;
    config.codigosFiscais = input.codigosFiscais;
    config.cpfCnpj = input.cpfCnpj;
  }

  return config;
}

/** DTO seguro: nunca expõe a chave Asaas em texto plano (Guardrail 3). */
export function serializeProfessional(prof: IProfessional) {
  const cfg = prof.billingConfig as OwnBillingConfig | null | undefined;
  let asaasKeyLast4: string | undefined;
  if (cfg?.asaasApiKeyEncrypted) {
    try {
      asaasKeyLast4 = decrypt(cfg.asaasApiKeyEncrypted).slice(-4);
    } catch {
      /* chave ilegível — ignora */
    }
  }
  return {
    id: String(prof._id),
    nome: prof.nome,
    slugInterno: prof.slugInterno,
    whatsapp: prof.whatsapp ?? null,
    bio: prof.bio ?? null,
    fotoUrl: prof.fotoUrl ?? null,
    redesSociais: prof.redesSociais ?? null,
    ativo: prof.ativo,
    billingMode: cfg?.asaasApiKeyEncrypted ? "own" : "inherit",
    temAsaasProprio: Boolean(cfg?.asaasApiKeyEncrypted),
    asaasKeyLast4,
    nfseStrategy: cfg?.nfseStrategy ?? null,
    codigosFiscais: cfg?.codigosFiscais ?? null,
    cpfCnpj: cfg?.cpfCnpj ?? null,
  };
}
