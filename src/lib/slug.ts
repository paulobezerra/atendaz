/**
 * Palavras reservadas que não podem ser usadas como slug de Business
 * (rota pública `/agendar/{slug}`) nem colidir com rotas do sistema.
 */
export const RESERVED_SLUGS = new Set<string>([
  "admin", "api", "app", "auth", "dashboard", "onboarding", "agendar",
  "para", "login", "logout", "signin", "signout", "static", "public",
  "assets", "_next", "www", "mail", "atendaz", "sistema", "config",
  "settings", "billing", "webhook", "webhooks", "cron", "health", "seed",
]);

/** Normaliza um texto livre em um slug (sem acentos, kebab-case). */
export function normalizeSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isReservedSlug(input: string): boolean {
  return RESERVED_SLUGS.has(normalizeSlug(input));
}

export interface SlugValidation {
  valid: boolean;
  slug: string;
  reason?: string;
}

/** Valida tamanho e reserva; retorna o slug normalizado. */
export function validateSlug(input: string): SlugValidation {
  const slug = normalizeSlug(input);
  if (slug.length < 3) {
    return { valid: false, slug, reason: "Slug deve ter ao menos 3 caracteres." };
  }
  if (slug.length > 40) {
    return { valid: false, slug, reason: "Slug deve ter no máximo 40 caracteres." };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, slug, reason: "Slug reservado pelo sistema." };
  }
  return { valid: true, slug };
}
