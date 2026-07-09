# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Atendaz** — a modular multi-tenant SaaS for appointment scheduling + automated billing (via Asaas) + Brazilian electronic invoices (NFS-e). The codebase is currently at **Phase 0 (skeleton)**; most features described in `docs/project/` are specced but not yet built. Docs and code are in Portuguese.

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # production build
npm run lint         # next lint (eslint)
npm test             # Jest integration tests (in-memory MongoDB)
npm run test:local   # alias for jest
npm run test:prod    # Cypress E2E against the deployed URL (headless)

# run a single Jest test file / name
npx jest tests/integration/seed.test.ts
npx jest -t "idempotência"

docker compose up -d # local MongoDB (:27017) + mongo-express (:8081)
```

Node **24** (`.nvmrc`). Husky runs `npm test` on pre-commit and `npm run test:local` on pre-push — a failing test blocks the push by design (see Guardrail 8).

## Testing model

- **Jest** tests live in `tests/integration/` and import route handlers directly (e.g. `import { GET } from "@/app/api/health/route"`), then call them as plain functions. There is no running server.
- `tests/setup.ts` spins up `mongodb-memory-server`, overrides `process.env.MONGODB_URI` so the `dbConnect` singleton uses it, and wipes all collections after each test. Tests are fully isolated and need no external DB.
- **Cypress** (`cypress/e2e/`) runs against `CYPRESS_BASE_URL` (defaults to the production Vercel URL) — it validates *deployed* behavior, which is why "Done" requires production evidence (see workflow below).

## Architecture

Next.js App Router (`src/app`). API routes only so far; all under `src/app/api/`.

- `src/lib/mongodb.ts` — Mongoose connection as a global singleton cached on `globalThis` (survives serverless/HMR reloads). Every route must `await dbConnect()` before touching models.
- `src/models/` — Mongoose models. Each guards against recompilation with `mongoose.models.X || mongoose.model(...)`. Interfaces are exported (e.g. `IPlano`).
- API routes that hit the DB must export `export const dynamic = "force-dynamic"` to prevent Next from statically caching them (needed for stable Vercel deploys).
- `@/*` path alias maps to `src/*` (configured in both `tsconfig.json` and `jest.config.js`).

### Three-layer tenancy (do not conflate these)

1. **Plataforma** — owned by Paulo; sells subscriptions. Its customer is the Tenant.
2. **Tenant / Business** — the paying company (barbershop, clinic). Owns the data.
3. **Cliente** — the Tenant's end customer (patient).

The `Plano` defines which **modules** (`agenda`, `agendaPublica`, `cobranca`, `nfse`) a Business gets; a Business copies `modulos` from its Plano on signup. The full data model (business, professional, service, appointment, payment, invoice, etc.) lives in `docs/project/base/data-model.md` and should be treated as the source of truth before adding models.

## Non-negotiable guardrails (`docs/project/base/constitution.md`)

These shape most feature code — read the full file before implementing, but the load-bearing ones:

- **Tenant isolation**: every DB query must scope by `businessId`. A Business must never read another's data.
- **Module gating**: never run an Agenda/Cobrança/NFS-e action without checking `business.modulos`. A disabled module's route returns **404** (not a hidden button).
- **Billing resolution**: all billing/invoice logic must go through `resolveBillingConfig(professional, business)` — a professional can override the business's Asaas config, else inherits it. Never assume the business token.
- **Encryption**: Asaas API keys are stored AES-256-GCM encrypted (`CRYPTO_MASTER_KEY`).
- **Idempotency**: all webhooks must be idempotent (don't emit two invoices for one payment); financial/scheduling writes append to `audit_log`. TDD is required for idempotency, slot math, subscription transitions, and billing resolution.
- **Asaas fidelity**: never invent Asaas fields or endpoints — check official docs or ask.
- **Zero vulnerabilities**: `npm audit` must be clean before pushing.
- **Privacy**: no clinical/health data stored. No WhatsApp Business API — use `wa.me` links only. Transactional email via Resend, logged in `notification_log`.

## Documentation-driven workflow (P2S)

This repo runs on **P2S (Prototype-to-Spec)** — a personal, tech/agent-agnostic framework whose rulebook lives in [`docs/p2s/`](docs/p2s/) (read `docs/p2s/README.md` first). Product-specific data lives in `docs/project/`: `base/` — a fixed manifest of `constitution.md` (domain, architecture, stack, guardrails, scope), `data-model.md` (with a Mermaid ER diagram), `roadmap.md`, `environment.md`, `design-system.md` (see `docs/p2s/project-structure.md`) — plus `spec/F{ID}-*.md` per-feature specs and `plans/{ID}-*.md` execution plans (`plans/archive/` once done). `docs/project/base/roadmap.md` is the ordered phase list and marks `[CONCLUÍDO]` features.

The workflow is **eight prefixed commands in two phases** — upstream (re-runnable): `p2s-discovery` (product → constitution + roadmap), `p2s-design` (visual/UX); transversal: `p2s-doc` (reverse-engineering / post-implementation reconciliation — docs↔reality, never product/design/spec's job); downstream loop: `p2s-spec` → `p2s-plan` → `p2s-code` → `p2s-review` → `p2s-done`. Surfaced as slash commands / skills (thin redirects in `.claude/commands/`); rules live **only** in `docs/p2s/commands.md`. Load-bearing constraints: every boundary (UX, API, persisted-data shape, external integrations) is prototyped and approved **before** code, and an **approved prototype becomes the spec** (`docs/p2s/principles.md` §2); `p2s-plan` produces the plan (BDD scenarios + create/modify/delete inventory) and must not modify code; `p2s-code` only implements after re-validating the DOR; `p2s-review` runs the test **script** + a holistic consistency review with severity-ranked findings (there is no `p2s-test`); `p2s-done` closes logically. **P2S is git-flow-agnostic**: branch/merge/PR/push mechanics are the project's (see `docs/project/base/workflow.md`) and the AI never merges to trunk on its own; DOD is the project-defined validation, not hardcoded production. Features are built in roadmap order; behavior/architecture changes go into the spec/docs before code.

The support pillar is **DRY & automation**: single source of truth (reference, don't duplicate) + deterministic work in scripts/git hooks. For context/token economy this repo ships a `summarizer` subagent (`.claude/agents/summarizer.md`) — delegate broad read-only sweeps (e.g. the `p2s-review` spec×plan×code×doc read, digesting long logs) to it so raw output stays out of the main context; it returns a dense gist. Hard rule: compress the transient (logs, tool output), **never** the source of truth (spec, approved contracts, guardrails, constitution).

## Environment variables

Defined in `docs/project/base/environment.md` with a per-phase requirement table. Phase 0 needs only `MONGODB_URI`. Later phases add Google OAuth + `AUTH_SECRET` (F1), `CRYPTO_MASTER_KEY` + `ASAAS_BASE_URL` (F1), `RESEND_API_KEY`/`EMAIL_FROM` (F5), `PLATFORM_ASAAS_API_KEY` (F11). Local config goes in `.env.local`; production in the Vercel panel.
