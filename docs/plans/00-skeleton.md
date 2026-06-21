# Plano de Execução: F0 — Esqueleto (Cronograma Detalhado)

Este plano atende aos critérios de **DOR (Definition of Ready)**. A execução foca em infraestrutura sólida e testes profissionais.

## ⏳ Cronograma Passo a Passo

### Fase A: Preparação Local (DOR - Ready)
1. **Docker**: Criar `docker-compose.yml` (Mongo 7 + Mongo Express).
2. **Setup Next.js**: Manter/Ajustar `package.json` e arquivos de config.
3. **Setup de Testes Profissionais**:
    - Instalar **Jest** e **Supertest** para testes de API/Integração.
    - Instalar **Cypress** para testes E2E de Produção.
    - Configurar `jest.config.js` e `cypress.config.ts`.
4. **Estrutura de Pastas**: `src/app`, `src/lib`, `src/models`, `tests/integration`, `cypress/e2e`.
5. **Singleton MongoDB**: Implementar `src/lib/mongodb.ts`.
6. **Modelo de Dados**: Implementar `src/models/Plano.ts`.
7. **API Endpoints**:
    - `GET /api/health`: Status do banco.
    - `GET /api/admin/seed`: População inicial (idempotente).

### Fase B: Sincronização & Deploy Inicial
8. **Git**: Commit e Push para o repositório remoto.
9. **Ação do Usuário**: Conectar repositório na Vercel.

### Fase C: Infraestrutura Produtiva (Ação do Usuário)
10. No painel da Vercel: Adicionar **MongoDB Atlas** (Tier M0 Free).

### Fase D: Validação do DOD (Definition of Done)
11. **Teste Local (`/test local`)**: Executar Jest para validar APIs e conexão com Docker.
12. **Teste de Produção (`/test prod`)**: Executar Cypress (headless) contra a URL da Vercel para validar o Health Check real.
13. **Evidência**: O agente deve anexar o report resumido dos testes.
14. **Ação do Usuário**: Digitar `/done 0`.

---

## 🛠 Checklist de Ferramentas
- [ ] Jest + Supertest (Testes de integração de API)
- [ ] Cypress (Testes de aceitação em Produção)
- [ ] Mongoose (ORM/ODM)
- [ ] Docker Compose (Ambiente isolado)

---

## 🧪 Estratégia de Testes
1. **Compilação**: O comando `npm run build` deve passar sem erros de TypeScript ou Lint.
2. **Health Check**: Chamar `/api/health` localmente e validar o JSON de resposta.
3. **Database**: Verificar via MongoDB Compass ou Atlas se a coleção `planos` foi criada e populada corretamente.

## 📂 Arquivos Modificados/Criados
- `src/lib/mongodb.ts`
- `src/models/Plano.ts`
- `src/app/api/health/route.ts`
- `src/app/api/admin/seed/route.ts` (ou script de seed)
- `package.json` (dependências)
