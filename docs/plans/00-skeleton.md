# Plano de Execução: F0 — Esqueleto (Cronograma Detalhado)

Este plano atende aos critérios de **DOR (Definition of Ready)**. A execução é manual, sequencial e sem margem para ambiguidades.

## ⏳ Cronograma Passo a Passo

### Fase A: Preparação Local (DOR - Ready)
1. **Docker**: Criar `docker-compose.yml` com imagem `mongo:7.0` e `mongo-express`.
    - Validar: `docker-compose up -d` deve resultar em containers rodando.
2. **Dependências**: Criar `package.json` com:
    - `next@15.0.0`, `react@19.0.0-rc...`, `mongoose`, `tailwindcss`.
    - Instalar via `npm install`.
3. **Configurações**: Criar `tsconfig.json` (com paths `@/*`), `next.config.ts`, `postcss.config.js` e `tailwind.config.ts`.
4. **Estrutura de Pastas**:
    - `mkdir -p src/app/api/health src/app/api/admin/seed src/lib src/models`.
5. **Singleton MongoDB**: Criar `src/lib/mongodb.ts` usando `global` para preservar conexão em Hot Reload do Next.js.
6. **Modelo de Dados**: Criar `src/models/Plano.ts` com Schema: `slug, nome, modulos (agenda, agendaPublica, cobranca, nfse), precoBase, precoPorAgendaAdicional, ativo`.
7. **API Health**: Criar `src/app/api/health/route.ts` que retorna `{ status: "ok", database: connectionState }`.
8. **API Seed**: Criar `src/app/api/admin/seed/route.ts` para inserir os 3 planos iniciais (Agenda Simples, Cobrança + Nota, Completo).
9. **Testes Automatizados**: Criar script de teste (ex: `test-f0.ts`) que valida o Health Check e a existência dos planos no banco.

### Fase B: Sincronização & Deploy Inicial
10. **Git**: `git add .`, `git commit -m "feat: f0 skeleton infrastructure"`, `git push origin master`.
11. **Ação do Usuário**: Conectar o repositório na Vercel (Hobby Plan).

### Fase C: Infraestrutura Produtiva (Ação do Usuário)
12. No painel da Vercel: **Storage > MongoDB Atlas > Create M0 Free Cluster**.
13. Aguardar a injeção automática da `MONGODB_URI`.

### Fase D: Validação do DOD (Definition of Done)
14. **Teste Local**: Executar `/test local` (deve passar com Docker rodando).
15. **Redeploy**: Disparar deploy na Vercel para ler a nova `MONGODB_URI`.
16. **Teste de Produção**: Executar `/test prod` (apontando para a URL da Vercel).
    - **Evidência de DOD**: O comando `/test prod` deve retornar sucesso total.
17. **Ação do Usuário**: Digitar `/done 0` para encerrar a feature.

---

## 🛠 Checklist Técnico
- [ ] `npm run build` passa sem erros (Compilação).
- [ ] Teste automatizado local passou.
- [ ] Teste automatizado produção passou.
- [ ] Planos inseridos corretamente no Atlas.

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
