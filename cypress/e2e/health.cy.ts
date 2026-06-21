describe("F0 - Health Check E2E", () => {
  it("Deve verificar se a API está online e conectada ao banco", () => {
    cy.request("/api/health").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq("ok");
      expect(response.body.database).to.eq("connected");
    });
  });

  it("Deve garantir que os planos iniciais existem no banco", () => {
    // O Seed é idempotente, deve retornar count: 3 independente de quantas vezes rodar
    cy.request("/api/admin/seed").then((seedRes) => {
      expect(seedRes.status).to.eq(200);
      expect(seedRes.body.count).to.eq(3);
      expect(seedRes.body.message).to.contain("sucesso");
    });
  });
});
