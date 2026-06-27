// Header de bypass do Vercel Deployment Protection (Preview), lido de env:
// CYPRESS_VERCEL_BYPASS -> Cypress.env("VERCEL_BYPASS"). O secret nunca é
// versionado; em produção (sem proteção) o header simplesmente não é enviado.
export {}; // isola o escopo do arquivo (evita colisão de globals entre specs)
const bypass = Cypress.env("VERCEL_BYPASS");
const headers: Record<string, string> = bypass
  ? { "x-vercel-protection-bypass": bypass }
  : {};

describe("F0 - Health Check E2E", () => {
  it("Deve verificar se a API está online e conectada ao banco", () => {
    cy.request({ url: "/api/health", headers }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq("ok");
      expect(response.body.database).to.eq("connected");
    });
  });

  it("Deve garantir que os planos iniciais existem no banco", () => {
    // O Seed é idempotente, deve retornar count: 3 independente de quantas vezes rodar
    cy.request({ url: "/api/admin/seed", headers }).then((seedRes) => {
      expect(seedRes.status).to.eq(200);
      expect(seedRes.body.count).to.eq(3);
      expect(seedRes.body.message).to.contain("sucesso");
    });
  });
});

describe("F1 - Onboarding (smoke público)", () => {
  it("Página de login responde 200", () => {
    cy.request({ url: "/login", headers }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("validate-slug retorna disponibilidade para slug válido", () => {
    cy.request({
      url: "/api/onboarding/validate-slug?slug=barbearia-teste",
      headers,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("available");
      expect(res.body.slug).to.eq("barbearia-teste");
    });
  });

  it("validate-slug rejeita slug reservado", () => {
    cy.request({
      url: "/api/onboarding/validate-slug?slug=admin",
      headers,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.available).to.eq(false);
    });
  });

  it("rota protegida /dashboard redireciona para /login sem sessão", () => {
    cy.request({
      url: "/dashboard",
      headers,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307]);
      expect(res.redirectedToUrl).to.contain("/login");
    });
  });
});
