# Plano de Execução: F2 — Profissionais e Billing Override

Este plano atende ao **DOR** da spec `docs/spec/F2-professionals-billing.md` e foi validado contra os Guardrails (`docs/07`), o Modelo de Dados (`docs/04`), o Design System (`docs/10`) e os Requisitos Técnicos (`docs/03`).

## Contexto
Primeira feature **interna** (pós-onboarding). Entrega:
- CRUD de `professional` dentro do `business` (escopo por `businessId`).
- **Billing override** por profissional (Asaas/fiscal próprio) vs herança do negócio, gated por `modulos.cobranca|nfse`.
- Função central `resolveBillingConfig(professional, business)` (Guardrail 3, **TDD**).
- Fundação visual da área logada: **App Shell** (sidebar desktop / bottom tab bar mobile — `docs/10`).
- Auditoria das escritas em `audit_log` (Guardrail 4).

## Decisões de Arquitetura
- **App Shell é layout de área autenticada** (`src/app/dashboard/layout.tsx`), reusável por F3+. Split Layout permanece exclusivo de `/login` e `/onboarding`.
- **`professional` não é gated por `agenda`**: existe em qualquer plano (é também identidade de faturamento). Apenas a **seção de billing** é gated por `cobranca|nfse`. Campos de agenda (service/availability) ficam no F3.
- **Recálculo da assinatura postergado ao F11** (decisão do usuário): no F2, ativar/desativar só altera `professional.ativo` + grava `audit_log`; `valorMensal`/`qtdAgendasAtivas` e sync Asaas são do F11 (env `PLATFORM_ASAAS_API_KEY` é de Fase 11). Já refletido em `docs/spec/F11`.
- **Chave Asaas nunca volta ao cliente**: GET expõe apenas `temAsaasProprio: boolean` (+ 4 últimos dígitos se viável). Para trocar, redigita.
- **Isolamento**: acesso a `professional` de outro business → **404** (não 403; não vazar existência) — Guardrail 1.
- **`resolveBillingConfig` é a única porta** para config de cobrança/nota; nenhum outro código assume o token do business.

## Estado atual relevante (análise de código)
- `src/models/Professional.ts` **já existe** com `businessId`, `nome`, `slugInterno`, `whatsapp`, `bio`, `fotoUrl`, `billingConfig` (Mixed, default null) e índice único `{ businessId, slugInterno }`. → **Reuso quase total**; só ajustar se faltar tipagem de `cpfCnpj` no billingConfig (já contemplado via `IBillingConfig & { cpfCnpj? }`).
- `src/lib/asaas.ts` (`validateAsaasKey`), `src/lib/crypto.ts` (`encrypt`/`decrypt`), `src/lib/slug.ts` (`normalizeSlug`/`validateSlug`/`RESERVED_SLUGS`) → **reuso direto**.
- `src/app/api/onboarding/validate-asaas` (POST autenticado) → **reuso** para validação inline da chave no override.
- `src/lib/auth.ts` (`getSession` → `googleId`) → padrão de resolução de tenant já usado em `dashboard/page.tsx`.
- **Não existe** `src/models/AuditLog.ts` → **criar** (primeira feature com escrita financeira/auditável).
- **Não existe** layout de área logada (App Shell) nem componentes de navegação → **criar**.

## Tarefas Técnicas

### Backend — libs e modelos
- [x] **T1** — `src/lib/billing.ts`: `resolveBillingConfig(professional, business)` (retorna override se preenchido; senão `billingConfigPadrao`; senão `null`). **TDD primeiro**.
- [x] **T2** — `src/models/AuditLog.ts`: `{ entidade, entidadeId, acao, payloadResumido, timestamp }` (conforme `docs/04`). Helper `logAudit(...)` (sem dados sensíveis no payload).
- [x] **T3** — `src/lib/schemas/professional.ts`: schemas Zod — base + billing condicional (`billingMode: "inherit"|"own"`). Reusa `nfseStrategyEnum`/`codigosFiscaisSchema` de `schemas/onboarding.ts`.
- [x] **T4** — `src/models/Professional.ts`: revisado — **no-op** (model já tinha `billingConfig`, `whatsapp`, `bio`, índice único `{businessId, slugInterno}`).

### Backend — rotas (todas `force-dynamic`, autenticadas, escopadas por `businessId`)
- [x] **T5** — `GET/POST /api/professionals`: lista (sem expor chave) / cria. Zod; **gating** (rejeita billing se `!cobranca && !nfse` → 400); se `own`, valida chave no Asaas e **criptografa**; `audit_log` no create.
- [x] **T6** — `GET/PATCH/DELETE /api/professionals/[id]`: detalhe (mascara chave) / atualiza / remove. **Invariante ≥1 ativo** (409). Cross-tenant → **404**. `audit_log` em toda escrita.
- [x] **T7** — `GET /api/professionals/validate-slug?slug=`: disponibilidade de `slugInterno` no escopo do business (+ `exceptId` para edição).

### Frontend — App Shell + telas (Tailwind + tokens `docs/10`)
- [x] **T8** — `src/components/AppShell.tsx`: sidebar fixa (desktop) / bottom tab bar (mobile), **só módulos ativos**, item ativo destacado, topbar com nome do negócio + Sair.
- [x] **T9** — `src/app/dashboard/layout.tsx`: aplica o App Shell a tudo sob `/dashboard`; resolve `business` (server) e passa `modulos`. Mantém o gate de onboarding.
- [x] **T10** — `src/app/dashboard/profissionais/page.tsx` (server) + `ProfessionalsList.tsx` (client): lista, badge de billing (gated), toggle `ativo` (desabilitado no último), **+ Adicionar**.
- [x] **T11** — `novo/page.tsx` e `[id]/page.tsx` (+ `ProfessionalForm.tsx` client): dados básicos + faturamento condicional (rádio herdar/próprio; chave Asaas `password`+toggle+validação onBlur; `nfseStrategy`/`cpfCnpj` se `nfse`); validações inline; toasts.

### Testes
- [x] **T12** — Integração (Jest): `billing.test.ts` (5) + `professionals.test.ts` (11). Suíte total **37/37**.
- [ ] **T13** — E2E (Cypress) `stage`/`prod` conforme spec — pendente da validação no Preview.

## Status de Implementação (`/ssd-code 2`)
**Concluído e verde**: T1–T12. `npm test` = **37/37** (16 novos); `npm run build` OK (rotas `/api/professionals*` e `/dashboard/profissionais*` geradas); `npm run audit:prod` = **0**. Nenhuma dependência nova.

**Decisões/desvios registrados (para o gate de revisão):**
- **Navegação do App Shell** lista só destinos já implementados (Início, Profissionais) para evitar links mortos; itens por módulo (Serviços/Cobrança/Notas) entram em F3+ (o componente já suporta gating por `module`).
- **`serializeProfessional`** expõe `asaasKeyLast4` (via `decrypt` server-side) para UX, mas **nunca** a chave completa; teste cobre que a chave em texto plano não vaza no GET.
- **Helper `src/lib/professionals.ts`** (não previsto explicitamente no plano) centraliza `requireBusiness`/`buildBillingConfig`/`serializeProfessional` — DRY entre as 3 rotas; sem mudança de escopo.
- **`npm run lint`** falha por quirk do `next lint` no Next 16 (passa `lint` como diretório); o ESLint roda no `build`, que passou.

**Pendente (ação do usuário — gate de revisão):** validar o Preview (`/ssd-test stage`): App Shell desktop/mobile, criar 2º profissional herdando billing, criar com Asaas próprio (sandbox), alternar padrão↔próprio, bloqueio do último ativo.

## Arquivos Afetados
**Novos**: `src/lib/billing.ts`, `src/models/AuditLog.ts`, `src/lib/schemas/professional.ts`, `src/app/api/professionals/route.ts`, `src/app/api/professionals/[id]/route.ts`, `src/app/api/professionals/validate-slug/route.ts`, `src/components/AppShell.tsx` (+ sub-componentes), `src/app/dashboard/layout.tsx`, `src/app/dashboard/profissionais/{page,novo/page,[id]/page}.tsx`, `src/app/dashboard/profissionais/ProfessionalForm.tsx`, testes em `tests/integration/` e `cypress/e2e/`.
**Modificados**: `src/app/dashboard/page.tsx` (passa a viver sob o layout do App Shell; adicionar atalho para Profissionais), possivelmente `src/models/Professional.ts` (ajustes de tipagem se necessário).

## Auditoria de Segurança (DOR)
- `npm audit --omit=dev` = **0** confirmado no início do plano (gate de produção, Guardrail 8). Nenhuma dependência nova prevista (CRUD usa libs nativas + o que já existe).
- Chave Asaas: validada → criptografada (AES-256-GCM) → nunca retornada/logada (Guardrail 3 e 4).

## Check de Envs (Fase 2)
**Nenhuma env nova.** Reusa as de F1 já configuradas (`.env.local` + Vercel): `CRYPTO_MASTER_KEY`, `ASAAS_BASE_URL` (validação de chave override em **sandbox**), além das de auth (`GOOGLE_*`, `AUTH_SECRET`, `NEXTAUTH_URL`). Confirmar que seguem presentes em Preview e Produção.

## Cronograma de Ações Manuais (ordenado)
1. **Antes do `/ssd-code 2`**: ter uma 2ª chave Asaas **sandbox** à mão (para testar o cenário de override próprio distinto do padrão do negócio). Nenhuma config de infra nova.
2. **Durante o `/ssd-code 2`**: TDD (`resolveBillingConfig` primeiro) → `/ssd-test local` verde antes de qualquer push.
3. **Homologação (`stage`)**: push da branch gera Preview → `/ssd-test stage`.
4. **Gate de revisão humana**: validar o Preview manualmente (App Shell desktop/mobile, override, invariante ≥1 ativo) + revisão de diff.
5. **DOD (`/ssd-done 2`)**: merge na `master` → prod → `/ssd-test prod` verde → aprovação → `[CONCLUÍDO]`.

## Verificação e Testes

### `local` (Jest, banco em memória)
- [ ] `resolveBillingConfig` (TDD): override → override; null → padrão; sem padrão → null.
- [ ] Isolamento de tenant: business A não lê/edita/exclui professional de B (404).
- [ ] `slugInterno`: único no business; mesmo slug ok em businesses distintos; reservados rejeitados.
- [ ] Criptografia: chave salva ≠ texto plano; GET nunca retorna chave; roundtrip ok.
- [ ] Module gating: `billingConfig` rejeitado (400) quando `cobranca` e `nfse` ambos false.
- [ ] Validação de chave inválida no override → rejeitado.
- [ ] Invariante ≥1 ativo: desativar/excluir último ativo → 409.
- [ ] `audit_log`: create/update/activate/deactivate/delete geram registro sem chave no payload.

### `stage` (Cypress no Preview)
- [ ] Adicionar 2º profissional herdando billing do negócio.
- [ ] Adicionar profissional com Asaas próprio (chave sandbox validada).
- [ ] Editar alternando padrão ↔ próprio.
- [ ] Desativar (não o último); bloqueio do último na UI.
- [ ] App Shell em 1280/1024/375px; bottom tab bar no mobile; só módulos ativos.

### `prod` (Cypress na Produção, no `/ssd-done`)
- [ ] Smoke dos fluxos acima na URL de produção (evidência soberana do DOD).

### Critério Soberano (DOD — `docs/08`)
Build limpo na Vercel + `npm audit --omit=dev` = 0 + `/ssd-test prod` verde + aprovação funcional (`/ssd-done 2`). Dois modelos de faturamento coexistindo no mesmo negócio em produção.

## Débitos Técnicos / Fora do Escopo da F2
- Recálculo da assinatura por agenda adicional + sync Asaas da plataforma → **F11** (já anotado em `docs/spec/F11`).
- `service`/`availability` e demais campos de agenda do profissional (fotoUrl/redesSociais) → **F3**.
- Transação MongoDB nas escritas: segue como no F1 (sequencial + índices); reavaliar se F2 introduzir escritas multi-documento que exijam atomicidade.
- Gating 404 pleno de rotas de módulo (Cobrança/NFS-e) → F7/F9+; no F2 o gating se manifesta na seção de billing do profissional.
