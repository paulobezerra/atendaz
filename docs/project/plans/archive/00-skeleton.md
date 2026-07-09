# Plano de Execução: F0 — Esqueleto (Cronograma Detalhado)

Este plano atende aos critérios de **DOR (Definition of Ready)**. A execução foca em infraestrutura sólida e testes profissionais.

## ⏳ Cronograma Passo a Passo

### Fase A: Preparação Local (DOR - Ready)
1. **Docker**: Criar `docker-compose.yml` (Apenas para desenvolvimento manual e persistente).
2. **Ambiente de Teste (Padrão Testcontainers)**:
    - Instalar `mongodb-memory-server`.
    - Configurar `tests/setup.ts` para levantar um MongoDB em memória em porta aleatória e isolada.
    - Isso garante que o `npm run test:local` rode de forma 100% autônoma, sem conflito de portas ou necessidade de banco externo.
3. **Setup Next.js & Husky**:
    - Garantir Node LTS.
    - Configurar Husky com pre-push hook rodando `/test local`.
4. **Implementação de Testes de Integração (OBRIGATÓRIO)**:
    - `tests/integration/health.test.ts` (Usando banco em memória).
    - `tests/integration/seed.test.ts` (Usando banco em memória).
5. **Estrutura de Pastas**: `src/app`, `src/lib`, `src/models`, `tests/integration`, `cypress/e2e`.
6. **Singleton MongoDB**: Implementar `src/lib/mongodb.ts`.
7. **Modelo de Dados**: Implementar `src/models/Plano.ts`.
8. **API Endpoints**:
    - `GET /api/health`: Status do banco.
    - `GET /api/admin/seed`: População inicial (idempotente).

### Fase B: Sincronização & Deploy Inicial
8. **Validação Verde**: Executar `npm run test:local` e garantir 100% de sucesso.
9. **Git**: Commit (apenas se os testes passarem).
10. **Bloqueio de Segurança**: O agente só fará o `git push` após comprovar o sucesso local.
11. **Ação do Usuário**: Conectar repositório na Vercel.

### Fase C: Infraestrutura Produtiva (Ação do Usuário)
10. No painel da Vercel: Adicionar **MongoDB Atlas** (Tier M0 Free).

### Fase D: Validação do DOD (Definition of Done)
11. **Purificação de Dependências (Tolerância Zero)**:
    - Tarefa (via /code): Remover `node_modules` e `package-lock.json`.
    - Tarefa (via /code): Atualizar `package.json` para **Next.js 15.1.3** (patch de segurança) e **React 19.0.0**.
    - Tarefa (via /code): Executar `npm install` e garantir `npm audit` limpo.
    - Tarefa (via /code): Commitar e realizar Push do estado purificado.
12. **Bloqueio de Infraestrutura (Ação do Usuário - OBRIGATÓRIO)**:
    - Antes do próximo passo, você **DEVE** garantir que o MongoDB Atlas foi adicionado no painel da Vercel (Fase C). Sem isso, as APIs continuarão retornando erro 500 mesmo com build sucesso.
13. **Redeploy Limpo**:
    - Ação do Usuário: No painel da Vercel, selecione "Redeploy" com a opção "Clear Build Cache" marcada.
14. **Teste Local (`/test local`)**: Executar Jest para validar APIs e conexão com Docker.
15. **Teste de Produção (`/test prod`)**: Executar Cypress (headless) contra a URL da Vercel.
15. **Evidência**: O agente deve anexar o report resumido dos testes.
16. **Ação do Usuário**: Digitar `/done 0`.

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
