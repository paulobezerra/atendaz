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

## Check de Envs (Ação do Usuário — antes do `/code 1`)
Preencher em `.env.local` (local) **e** no painel da Vercel (Settings → Environment Variables):

| Variável | Origem |
| :--- | :--- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console (OAuth 2.0) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `CRYPTO_MASTER_KEY` | String de 32 caracteres (AES-256-GCM) |
| `ASAAS_BASE_URL` | `https://sandbox.asaas.com/api/v3` |
| `AUTH_URL` / `NEXTAUTH_URL` | URL base (se exigido pelo Auth.js v5 em produção) |

## Cronograma de Ações Manuais (ordenado)
1. **Antes do `/code 1`**: criar credenciais OAuth no Google Cloud Console com redirect URIs autorizados para `http://localhost:3000/api/auth/callback/google` **e** o domínio da Vercel. Gerar `AUTH_SECRET` e `CRYPTO_MASTER_KEY`. Obter uma chave Asaas **sandbox** para teste. Preencher `.env.local` e o painel da Vercel.
2. **Durante o `/code 1`**: implementação TDD → `/test local` verde (pré-requisito para qualquer push).
3. **Após push e deploy**: confirmar/atualizar o redirect URI do Google com a URL final da Vercel.
4. **DOD**: `/test prod` (Cypress) → validação funcional na URL da Vercel → usuário digita `/done 1`.

## Verificação e Testes

### Local (Jest, banco em memória via `tests/setup.ts`)
- [ ] `crypto`: roundtrip encrypt→decrypt; ciphertext diferente do plaintext no banco.
- [ ] `slug`: rejeita reservados (`admin`, `api`, …) e duplicados; aceita válidos.
- [ ] `onboarding`: cria Business + Professional + PlatformSubscription corretos; copia `modulos`; criptografa Asaas somente quando o módulo está ativo; idempotência em re-submit do mesmo `googleId`.
- [ ] `asaas`: validação de chave (mockada) — caminho válido e inválido.

### Produção (Cypress, contra a URL da Vercel)
- [ ] Onboarding completo com plano gratuito (sem Asaas).
- [ ] Onboarding completo com plano pago (validando chave Asaas em sandbox).
- [ ] Redirecionamento correto pós-login.

### Critério Soberano (DOD — `docs/08`)
Build limpo na Vercel + `npm audit` zero + aprovação funcional do usuário (`/done 1`).

## Arquivos Afetados
**Novos**: `src/lib/{auth,crypto,slug,asaas}.ts`, `src/lib/schemas/onboarding.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/onboarding/route.ts`, `src/app/api/onboarding/validate-slug/route.ts`, `src/models/{Business,Professional,PlatformSubscription}.ts`, `src/app/{login,onboarding,dashboard}/page.tsx`, `src/middleware.ts`, testes em `tests/integration/` e `cypress/e2e/`.
**Modificados**: `package.json` (next-auth), possivelmente `next.config.ts`.

## Débitos Técnicos / Fora do Escopo da F1
- `resolveBillingConfig` e override de billing por profissional → **F2**.
- Recálculo da assinatura por agenda adicional → **F11**.
- Gating 404 de rotas de módulo aplica-se plenamente nas features de Agenda/Cobrança (F3+); na F1 o gating se manifesta no passo condicional de Asaas.
