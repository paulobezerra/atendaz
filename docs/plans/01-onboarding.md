# Plano de Execução: F1 — Login Google + Onboarding

Este plano atende ao **DOR (Definition of Ready)** da spec `docs/spec/F1-onboarding.md` e foi validado contra os Guardrails (`docs/07`), o Modelo de Dados (`docs/04`) e os Requisitos Técnicos (`docs/03`).

## Contexto
Implementar autenticação Google (Auth.js v5) e o wizard de onboarding que cria o Tenant. Ao final do fluxo existe:
- um `business` com `modulos` copiados do `plano` escolhido e `onboardingStatus: COMPLETE`;
- um `professional` inicial (mínimo 1 por business);
- uma `platform_subscription` em `TRIAL` (30 dias).

Chaves Asaas só são solicitadas quando o plano tem `cobranca` ou `nfse`, e são validadas e criptografadas (AES-256-GCM) **antes** de persistir.

## Decisões de Arquitetura
- **Auth.js v5 com estratégia de sessão JWT.** `googleId` é a chave de ligação usuário→business; os callbacks `jwt`/`session` carregam `businessId` e `onboardingStatus` no token, permitindo que o middleware decida o redirecionamento sem consultar o banco a cada request.
- **Sem coleção `user` própria no MVP**: o vínculo é `business.googleId` (índice único). Evita adapter de banco e mantém o modelo de dados de `docs/04` intacto.
- `resolveBillingConfig` **não** entra na F1 (é F2). A F1 apenas grava `billingConfigPadrao` no business.

## Dependências
- Adicionar `next-auth@beta` (v5). `zod` já está presente. AES-256-GCM via módulo `crypto` nativo do Node (sem dependência nova).
- Rodar `npm audit` → **zero vulnerabilidades** antes do push (Guardrail 8 / Requisito Técnico 2).
- Confirmar Golden Stack: Node 24, Next 16+, React 19.

### ✅ Débito Técnico de DOR (T0) — RESOLVIDO no `/ssd-code` (2026-06-22)
O `npm audit` reportava vulns moderadas via `cypress` (uuid) e, ao tentar `--force`, a cadeia do Jest (`babel-plugin-istanbul → @istanbuljs/load-nyc-config → js-yaml 3.x`, *unmaintained*). Resolução:
- **Cypress 13→15** e **Jest 29→30** (+ ts-jest/jest-environment-node/@types) por upgrade dirigido (nunca `--force`, que rebaixa ts-jest). Testes seguem verdes.
- As ~18 moderadas remanescentes são **exclusivas de devDependencies de teste**, sem patch upstream. Decisão do usuário (registrada): **gate de produção** — `npm audit --omit=dev` = **0**. Guardrail 8 (`docs/07`) e Requisito Técnico 2 (`docs/03`) ajustados; script `audit:prod` adicionado.

## Tarefas Técnicas

### Infra de auth e libs
- [ ] **T1** — `src/lib/auth.ts`: config Auth.js v5 (Google provider, `session: { strategy: "jwt" }`, callbacks `signIn`/`jwt`/`session` carregando `googleId`, `businessId`, `onboardingStatus`).
- [ ] **T2** — `src/app/api/auth/[...nextauth]/route.ts`: handlers `GET`/`POST` exportados de `src/lib/auth.ts`.
- [ ] **T3** — `src/lib/crypto.ts`: `encrypt`/`decrypt` AES-256-GCM com `CRYPTO_MASTER_KEY` (IV aleatório + authTag; formato `iv:authTag:ciphertext`). **TDD**.
- [ ] **T4** — `src/lib/slug.ts`: normalização + validação contra lista de palavras reservadas (`admin`, `api`, `app`, `auth`, `dashboard`, `onboarding`, `agendar`, `para`, `login`, `static`, `_next`, etc.) + checagem de unicidade no escopo. **TDD**.
- [ ] **T5** — `src/lib/asaas.ts`: `validateAsaasKey(key)` chamando `ASAAS_BASE_URL` (endpoint de conta, ex. `/myAccount`). Fidelidade total à API oficial (Guardrail 3). Mockado nos testes.

### Modelos (conforme `docs/04-data-model.md`)
- [ ] **T6** — `src/models/Business.ts`: `googleId` (único), `nomeFantasia`, `slug` (único), `email`, `segmento`, `planoId`, `modulos`, `cpfCnpj` (nullable), `billingConfigPadrao` (nullable: `asaasApiKeyEncrypted`, `nfseStrategy`, `codigosFiscais`), `onboardingStatus`.
- [ ] **T7** — `src/models/Professional.ts`: `businessId`, `nome`, `slugInterno` (único no business), `ativo`.
- [ ] **T8** — `src/models/PlatformSubscription.ts`: `businessId` (único), `planoId`, `status` (TRIAL), `trialEndsAt`, `graceEndsAt`, `qtdAgendasAtivas`, `valorMensal`.

### Validação e rotas
- [ ] **T9** — `src/lib/schemas/onboarding.ts`: schemas Zod (identidade do business; seleção de plano; módulos/Asaas condicional; profissional inicial).
- [ ] **T10** — `src/app/api/onboarding/route.ts` (`POST`, `export const dynamic = "force-dynamic"`): exige sessão autenticada; valida payload com Zod; copia `modulos` do `Plano`; **gating**: só processa/criptografa Asaas se `modulos.cobranca || modulos.nfse`; cria **Business + Professional + PlatformSubscription** de forma idempotente (índice único `googleId`; em re-submit retorna/rejeita o existente). TRIAL = `now + 30 dias`, `valorMensal = plano.precoBase`, `qtdAgendasAtivas = 1`. **TDD**.
- [ ] **T11** — `src/app/api/onboarding/validate-slug/route.ts`: disponibilidade de slug em tempo real para o wizard.

### UI (App Router + Tailwind)
- [ ] **T12** — `src/app/login/page.tsx`: botão "Entrar com Google".
- [ ] **T13** — `src/app/onboarding/page.tsx`: wizard client-side de 4 passos (Identidade → Plano → Módulos *gated* → Profissional inicial). O passo de módulos é ocultado/simplificado para planos sem `cobranca`/`nfse`.
- [ ] **T14** — `src/app/dashboard/page.tsx`: placeholder (destino do redirect pós-onboarding).
- [ ] **T15** — `src/middleware.ts`: protege `/dashboard` e `/onboarding`; usuário sem business → `/onboarding`; com `onboardingStatus=COMPLETE` → `/dashboard`.

## Auditoria de Segurança (DOR)
- `npm audit` limpo após adicionar `next-auth@beta`; push bloqueado se houver vulnerabilidade (o hook Husky pre-push já roda os testes; manter tolerância zero).
- Chaves Asaas nunca trafegam nem são persistidas em texto plano (Guardrail 3).

## Check de Envs (Ação do Usuário — antes do `/ssd-code 1`)
Preencher em `.env.local` (local) **e** no painel da Vercel (Settings → Environment Variables):

| Variável | Origem |
| :--- | :--- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console (OAuth 2.0) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `CRYPTO_MASTER_KEY` | String de 32 caracteres (AES-256-GCM) |
| `ASAAS_BASE_URL` | `https://sandbox.asaas.com/api/v3` |
| `AUTH_URL` / `NEXTAUTH_URL` | URL base (se exigido pelo Auth.js v5 em produção) |

## Cronograma de Ações Manuais (ordenado)
1. **Antes do `/ssd-code 1`**: criar credenciais OAuth no Google Cloud Console. Em **URIs de redirecionamento autorizados** cadastrar três: `http://localhost:3000/api/auth/callback/google`, o alias de **Preview** da branch (`https://atendaz-git-feature-1-onboarding-<scope>.vercel.app/api/auth/callback/google`) e o domínio de **Produção**. Gerar `AUTH_SECRET` e `CRYPTO_MASTER_KEY`. Obter uma chave Asaas **sandbox** para teste. Preencher `.env.local` e o painel da Vercel.
2. **Durante o `/ssd-code 1`**: implementação TDD → `/ssd-test local` verde (pré-requisito para qualquer push da branch).
3. **Homologação (`stage`)**: cada push da branch gera um Preview → `/ssd-test stage` contra a URL do Preview.
4. **DOD (`/ssd-done 1`)**: merge na `master` → deploy de produção → `/ssd-test prod` verde → validação funcional → marca `[CONCLUÍDO]`.

## Verificação e Testes

### `local` (Jest, banco em memória via `tests/setup.ts`)
- [ ] `crypto`: roundtrip encrypt→decrypt; ciphertext diferente do plaintext no banco.
- [ ] `slug`: rejeita reservados (`admin`, `api`, …) e duplicados; aceita válidos.
- [ ] `onboarding`: cria Business + Professional + PlatformSubscription corretos; copia `modulos`; criptografa Asaas somente quando o módulo está ativo; idempotência em re-submit do mesmo `googleId`.
- [ ] `asaas`: validação de chave (mockada) — caminho válido e inválido.

### `stage` (Cypress contra a URL de Preview da Vercel) — homologação
- [ ] Onboarding completo com plano gratuito (sem Asaas).
- [ ] Onboarding completo com plano pago (validando chave Asaas em sandbox).
- [ ] Redirecionamento correto pós-login.

### `prod` (Cypress contra a Produção, no `/ssd-done`)
- [ ] Smoke dos mesmos fluxos acima na URL de produção (evidência soberana do DOD).

### Critério Soberano (DOD — `docs/08`)
Build limpo na Vercel + `npm audit` zero + `/ssd-test prod` verde + aprovação funcional do usuário (`/ssd-done 1`).

## Arquivos Afetados
**Novos**: `src/lib/{auth,crypto,slug,asaas}.ts`, `src/lib/schemas/onboarding.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/onboarding/route.ts`, `src/app/api/onboarding/validate-slug/route.ts`, `src/models/{Business,Professional,PlatformSubscription}.ts`, `src/app/{login,onboarding,dashboard}/page.tsx`, `src/middleware.ts`, testes em `tests/integration/` e `cypress/e2e/`.
**Modificados**: `package.json` (next-auth), possivelmente `next.config.ts`.

## Débitos Técnicos / Fora do Escopo da F1
- `resolveBillingConfig` e override de billing por profissional → **F2**.
- Recálculo da assinatura por agenda adicional → **F11**.
- Gating 404 de rotas de módulo aplica-se plenamente nas features de Agenda/Cobrança (F3+); na F1 o gating se manifesta no passo condicional de Asaas.

## Status de Implementação (`/ssd-code 1` — 2026-06-22)
**Concluído e verde**: T0–T15 implementados; `npm test` = 19/19; `npm run build` OK (Next 16 + next-auth v5); `npm run audit:prod` = 0.
- Libs: `crypto` (AES-256-GCM), `slug` (reservados), `asaas` (validação `/myAccount`) — todas com testes unitários.
- Models: `Business`, `Professional`, `PlatformSubscription` (+ `Plano` existente).
- Auth.js v5 JWT (`src/lib/auth.ts`) + rota + augmentação de tipos.
- Rotas: `POST /api/onboarding` (idempotente, gating Asaas, cria Business+Professional+PlatformSubscription TRIAL) e `GET /api/onboarding/validate-slug`; teste de integração cobre idempotência, gating e criptografia.
- UI: `/login`, wizard `/onboarding` (4 passos, billing condicional), `/dashboard`; `middleware.ts`.

**Desvios/decisões em relação ao plano (registrados para revisão)**:
- **Middleware**: faz apenas o *gate de login* (edge-safe — `auth` não importa mongoose). O redirect fino PENDING↔COMPLETE ficou nas server components (`/dashboard`, `/onboarding`), que podem consultar o banco. Motivo: mongoose não roda no runtime Edge.
- **Sem transação MongoDB**: criação sequencial protegida pelo índice único `googleId` (mongodb-memory-server standalone não suporta transações). Débito: possível estado parcial em falha intermediária — endereçar com replica-set/transação ou cleanup em F2+.
- **Auth**: migrada para **next-auth v4 estável** (ver "Migração para stack estável" abaixo). O hack `.npmrc legacy-peer-deps` foi removido; não há mais conflito de peers.

**✅ Migração para stack estável — CONCLUÍDA (`/ssd-code`, 2026-06-22)** (política "somente estável", Guardrail 8):
- `next` 16.3.0-preview.3 → **16.2.9**; `react`/`react-dom` → **19.2.7** (todas estáveis `latest`).
- `next-auth` 5-beta → **4.24.14** (estável). Auth reescrita para a API v4: `authOptions` + `getServerSession` (helper `getSession()`), rota `NextAuth(authOptions)`, `middleware.ts` com `withAuth`, `login` e `SignOutButton` client (`next-auth/react`).
- **`.npmrc` removido** (sem conflito de peer/prerelease).
- `overrides` adicionados em `package.json` (`postcss ^8.5.10`, `uuid ^11.1.1`) para zerar 4 moderadas transitivas (do Next e do next-auth v4) **sem downgrade** → `audit:prod` = **0**.
- Revalidado: `npm test` 19/19, `npm run build` OK, `audit:prod` 0.
- **Ação do usuário**: o NextAuth v4 usa `NEXTAUTH_URL` para montar a callback — garantir `NEXTAUTH_URL` (Preview e Produção) no painel da Vercel, além de `AUTH_SECRET` (reusado via `authOptions.secret`).

**Pendente (ação do usuário, fluxo `stage`/`prod`)**: validar o fluxo de onboarding no Preview (`/ssd-test stage`) e, no `/ssd-done 1`, em produção.

## Refinamento do gate de revisão (2026-06-22): Segmento controlado (sem campo aberto)
**Requisito (usuário):** no wizard, `segmento` é hoje um **input de texto livre** — inadmissível. Deve ser uma **seleção (dropdown)** a partir de uma **lista controlada vinda do banco**. A plataforma controla os segmentos atendidos. A versão final da F1 **não pode** ter campo aberto de segmento. *Futuro (F12):* ligar segmentos aos hotsites por nicho — fora do escopo agora.

**Lacuna de documentação a formalizar via `/ssd-doc` (antes/junto do `/ssd-code`):**
- `docs/04-data-model.md`: adicionar a coleção **`segmento`** (`slug` único, `nome`, `ativo`, `ordem`).
- `docs/spec/F1-onboarding.md`: registrar que o segmento é **selecionado de lista controlada** (sem texto livre).

**Decisões de design:**
- Novo model `Segmento` `{ slug (único), nome, ativo, ordem }`. Campos de hotsite (hero, features…) ficam em `marketing_page` (F12), **não** aqui.
- `business.segmento` passa a guardar o **slug** validado (alinha com `marketing_page.segmento` para o vínculo futuro da F12).
- A lista é carregada no **server component** `onboarding/page.tsx` (`Segmento.find({ ativo: true }).sort({ ordem })`) e passada ao wizard — sem endpoint novo (um `GET /api/segmentos` é opcional/futuro).
- `segmento` torna-se **obrigatório**; a rota `POST /api/onboarding` valida que o slug **existe e está ativo** (400 caso contrário). UI vira `<select>`.
- **Seed idempotente** de segmentos (lista curada, ~40–60, expansível para 100–200): estender `/api/admin/seed` ou seed dedicado. Ex.: barbearia, salão de beleza, estética, clínica médica, odontologia, fisioterapia, psicologia, nutrição, personal trainer, pilates, academia, petshop, veterinária, advocacia, contabilidade, consultoria, fotografia, design, etc.

**Tarefas técnicas (para o `/ssd-code`):**
- [ ] **T16** — `src/models/Segmento.ts` (índice único em `slug`).
- [ ] **T17** — Seed idempotente de segmentos (curada/expansível).
- [ ] **T18** — Carregar segmentos ativos em `onboarding/page.tsx` e passar ao `OnboardingWizard`.
- [ ] **T19** — Passo 1 do wizard: trocar o `<input>` de segmento por `<select>` (obrigatório).
- [ ] **T20** — `schema/onboarding.ts` + rota: `segmento` obrigatório e validado contra segmentos ativos (slug ∈ lista).
- [ ] **T21** — Testes: rota rejeita segmento inválido/inativo (400) e aceita válido; (opcional) E2E smoke do `<select>`.

**Fora do escopo agora:** vínculo segmento ↔ hotsite/marketing_page (F12).
