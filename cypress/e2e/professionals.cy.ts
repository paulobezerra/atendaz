// Smoke E2E da F2 (nível HTTP). Os fluxos autenticados (criar profissional,
// billing override) dependem de sessão Google e são validados manualmente no
// gate de revisão; aqui garantimos o contrato público: proteção de rotas e 401.
export {}; // isola o escopo do arquivo (evita colisão de globals entre specs)
const bypass = Cypress.env("VERCEL_BYPASS");
const headers: Record<string, string> = bypass
  ? { "x-vercel-protection-bypass": bypass }
  : {};

describe("F2 - Profissionais (smoke público)", () => {
  it("/dashboard/profissionais redireciona para a Home sem sessão", () => {
    cy.request({
      url: "/dashboard/profissionais",
      headers,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307]);
      // F0002.7: signIn agora é a Home (/), não mais /login.
      expect(new URL(res.redirectedToUrl).pathname).to.eq("/");
    });
  });

  it("GET /api/professionals retorna 401 sem sessão", () => {
    cy.request({
      url: "/api/professionals",
      headers,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("GET /api/professionals/validate-slug retorna 401 sem sessão", () => {
    cy.request({
      url: "/api/professionals/validate-slug?slug=teste",
      headers,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
