// Smoke E2E do onboarding (F0002.6, nível HTTP). O fluxo autenticado (concluir
// o onboarding de passo único e cair no Dashboard) depende de sessão Google e é
// validado no gate de revisão + nos testes de componente/integração locais.
// Aqui garantimos o contrato público: proteção de rota, 401 nas rotas com sessão
// e a rota pública de validação de slug.
export {}; // isola o escopo do arquivo (evita colisão de globals entre specs)
const bypass = Cypress.env("VERCEL_BYPASS");
const headers: Record<string, string> = bypass
  ? { "x-vercel-protection-bypass": bypass }
  : {};

describe("F0002.6 - Onboarding (smoke público)", () => {
  it("/onboarding redireciona para a Home sem sessão", () => {
    cy.request({
      url: "/onboarding",
      headers,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307]);
      // F0002.7: signIn agora é a Home (/), não mais /login.
      expect(new URL(res.redirectedToUrl).pathname).to.eq("/");
    });
  });

  it("POST /api/onboarding retorna 401 sem sessão", () => {
    cy.request({
      method: "POST",
      url: "/api/onboarding",
      headers,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("POST /api/onboarding/validate-asaas retorna 401 sem sessão", () => {
    cy.request({
      method: "POST",
      url: "/api/onboarding/validate-asaas",
      headers,
      body: { apiKey: "x" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("GET /api/onboarding/validate-slug é público e responde disponibilidade", () => {
    cy.request({
      url: "/api/onboarding/validate-slug?slug=barbearia-do-ze",
      headers,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("available");
    });
  });
});
