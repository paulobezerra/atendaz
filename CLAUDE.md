# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Atendaz** — a modular multi-tenant SaaS for appointment scheduling + automated billing (via Asaas) + Brazilian electronic invoices (NFS-e). The codebase is currently at **Phase 0 (skeleton)**; most features described in `docs/` are specced but not yet built. Docs and code are in Portuguese.

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

The `Plano` defines which **modules** (`agenda`, `agendaPublica`, `cobranca`, `nfse`) a Business gets; a Business copies `modulos` from its Plano on signup. The full data model (business, professional, service, appointment, payment, invoice, etc.) lives in `docs/04-data-model.md` and should be treated as the source of truth before adding models.

## Non-negotiable guardrails (`docs/07-guardrails.md`)

These shape most feature code — read the full file before implementing, but the load-bearing ones:

- **Tenant isolation**: every DB query must scope by `businessId`. A Business must never read another's data.
- **Module gating**: never run an Agenda/Cobrança/NFS-e action without checking `business.modulos`. A disabled module's route returns **404** (not a hidden button).
- **Billing resolution**: all billing/invoice logic must go through `resolveBillingConfig(professional, business)` — a professional can override the business's Asaas config, else inherits it. Never assume the business token.
- **Encryption**: Asaas API keys are stored AES-256-GCM encrypted (`CRYPTO_MASTER_KEY`).
- **Idempotency**: all webhooks must be idempotent (don't emit two invoices for one payment); financial/scheduling writes append to `audit_log`. TDD is required for idempotency, slot math, subscription transitions, and billing resolution.
- **Asaas fidelity**: never invent Asaas fields or endpoints — check official docs or ask.
- **Zero vulnerabilities**: `npm audit` must be clean before pushing.
- **Privacy**: no clinical/health data stored. No WhatsApp Business API — use `wa.me` links only. Transactional email via Resend, logged in `notification_log`.

## Documentation-driven workflow

The README defines an agent workflow where **docs are the source of truth**. `docs/` is structured as `00`–`09` base docs, `spec/F{ID}-*.md` per-feature specs, and `plans/{ID}-*.md` execution plans (`plans/archive/` once done). `docs/06-implementation-roadmap.md` is the ordered phase list and marks `[CONCLUÍDO]` features.

The README's `/plan`, `/code`, `/doc`, `/test`, `/done` are a **convention from this repo's own agent process**, not Claude Code slash commands. If asked to act on them, follow `docs/00-agent-instructions.md`. Key constraints from that doc: a "plan" step must not modify code; "done" requires production-verified evidence; features are built strictly in roadmap order; logic/architecture changes go into `docs/` before code.

## Environment variables

Defined in `docs/05-environment-variables.md` with a per-phase requirement table. Phase 0 needs only `MONGODB_URI`. Later phases add Google OAuth + `AUTH_SECRET` (F1), `CRYPTO_MASTER_KEY` + `ASAAS_BASE_URL` (F1), `RESEND_API_KEY`/`EMAIL_FROM` (F5), `PLATFORM_ASAAS_API_KEY` (F11). Local config goes in `.env.local`; production in the Vercel panel.
