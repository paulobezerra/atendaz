import { normalizeSlug, isReservedSlug, validateSlug } from "@/lib/slug";

describe("slug", () => {
  it("normaliza acentos, espaços e maiúsculas", () => {
    expect(normalizeSlug("Barbearia do Zé!!")).toBe("barbearia-do-ze");
    expect(normalizeSlug("  Clínica   Vida  ")).toBe("clinica-vida");
  });

  it("rejeita palavras reservadas", () => {
    for (const r of ["admin", "api", "dashboard", "onboarding", "Agendar"]) {
      expect(isReservedSlug(r)).toBe(true);
      expect(validateSlug(r).valid).toBe(false);
    }
  });

  it("aceita slug válido e retorna normalizado", () => {
    const v = validateSlug("Clínica Vida");
    expect(v.valid).toBe(true);
    expect(v.slug).toBe("clinica-vida");
  });

  it("rejeita slug muito curto", () => {
    expect(validateSlug("ab").valid).toBe(false);
  });
});
