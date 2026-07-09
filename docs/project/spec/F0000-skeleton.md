# [CONCLUÍDO] Especificação: F0000 — Esqueleto

## Escopo
- Inicialização do projeto e infraestrutura base utilizando Next.js 15 e TypeScript.
- Configuração de conexão com MongoDB via Mongoose.
- Seed de planos no banco de dados para garantir a base comercial do sistema.

## Detalhes de Implementação

### 1. Inicialização & Infraestrutura
- Gerar projeto com `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir`.
- **Vercel & GitHub**: O projeto deve ser vinculado a um repositório GitHub para deploy automático na Vercel.
- **Configuração de Envs**: Configurar `MONGODB_URI` localmente e na Vercel.

### 2. Banco de Dados & Modelos Iniciais
- Criar schema do `plano` conforme `docs/project/base/04-data-model.md`.
- Implementar utilitário de conexão com MongoDB (singleton para evitar múltiplas conexões em serverless).

### 3. Seed de Dados
- Script ou endpoint temporário (protegido) para inserir os 3 planos iniciais:
    - **Agenda Simples**: `slug: "agenda-simples"`, `nome: "Agenda Simples"`, `modulos: { agenda: true, agendaPublica: true, cobranca: false, nfse: false }`, `precoBase: 29`, `precoPorAgendaAdicional: 15`.
    - **Cobrança + Nota**: `slug: "cobranca-nota"`, `nome: "Cobrança + Nota"`, `modulos: { agenda: false, agendaPublica: false, cobranca: true, nfse: true }`, `precoBase: 39`, `precoPorAgendaAdicional: 0`.
    - **Completo**: `slug: "completo"`, `nome: "Completo"`, `modulos: { agenda: true, agendaPublica: true, cobranca: true, nfse: true }`, `precoBase: 59`, `precoPorAgendaAdicional: 25`.

### 4. Health Check
- Endpoint: `GET /api/health`.
- Deve retornar JSON: `{ status: "ok", database: "connected", timestamp: "..." }`.

## Verificação
- **Local**: Executar `npm run build` e verificar se não há erros.
- **Integração**: Chamar `/api/health` e validar resposta 200 com conexão ao banco.

## Critério de Aceite
- Projeto compila sem erros.
- `/api/health` retorna OK e status da conexão com banco em produção.
- Os 3 planos base existem na coleção `plano` do MongoDB.
