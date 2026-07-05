# SSD — Quality Controls & Engineering Policies

These are the **rules of the game for quality**. They are technology-neutral: SSD states the
*policy*; each product maps it to its concrete stack in `docs/project/`. Some of these policies
**constrain technology choices** — not by naming a technology, but by setting the quality bar a
choice must clear (e.g. "latest stable/LTS only"). Where a rule says "the product defines X",
that binding lives in `docs/project/`, but the rule itself is non-negotiable.

---

## Testing policy

The test gate has **three layers**; none substitutes for another. "Green" counts **only** when
the right layers cover the **surface the change touched**.

1. **Integration / API** — exercise the real units of behavior (route handlers, services,
   critical logic) against **in-memory or mocked** dependencies, so runs are fast, isolated, and
   hook-runnable.
2. **Component / render (UI)** — **every UI unit with logic** (conditional rendering, form
   state, sections revealed by a control, input masking, branching by data type) needs a test
   that **(a)** mounts without throwing and **(b)** exercises the **interactive branches**. A
   component with conditional rendering is **not** done without it.
3. **End-to-end** — the public contract (status / redirect / auth) against staging/prod.
   **Critical authenticated flows** get E2E when feasible; the rest fall to the manual review
   gate.

**Hard rules:**
- **Cover the changed surface.** Green tests do **not** satisfy the gate if they don't exercise
  what the change touched. A render crash that still "passes" is a **testing-policy failure**,
  not bad luck — the fix is to close the coverage gap, not just patch the symptom.
- **Critical logic is test-first (TDD).** Anything where correctness is subtle — money math,
  scheduling math, idempotency, state transitions, permission/isolation, config resolution —
  gets its test written **before** the implementation.
- **A bug fix starts with the failing test** that reproduces it, in the appropriate layer, then
  the fix. A regression test is mandatory.

See also [principles.md](principles.md) §1.

---

## Dependency & versioning policy

This is where quality **drives technology decisions**.

- **Runtime on LTS.** Always run on the runtime's **LTS** line. Non-LTS is not an option — it is
  a quality decision, not a preference.
- **Latest stable only.** Use the most recent **stable** release (the `latest` dist-tag /
  equivalent), close to LTS. Using a `beta`/`preview`/`rc`/`alpha`/`canary`/prerelease is
  **forbidden**, in dev *and* prod — treat a prerelease as **worse than a known vulnerability**.
- **Zero known vulnerabilities in production dependencies** before any push. The gate audits
  **production** dependencies and must report **zero**. Vulnerabilities exclusive to
  development/test tooling with **no non-breaking fix** and that **never ship** are recorded as
  **known debt** (re-evaluated when a patch lands) — they do not block the push.
- **Never "fix" an audit by downgrading.** Do not resolve a vulnerability by rolling a critical
  dependency backward or forcing a break. Prefer the latest **patched stable**.
- **Minimal, vetted dependencies.** Prefer proven, maintained libraries; avoid unmaintained or
  single-purpose bloat. Every dependency is a liability you are choosing to own.

The product lists its concrete pinned stack ("golden stack") and its audit command in
`docs/project/`; the policy above governs how that list is allowed to move.

---

## Build & integrity gate

- **Commit/deploy only on a successful production build.** A type/compile error is a blocker,
  not a warning — run the real build, not just the unit tests.
- **A red suite blocks the push.** Enforced by a git hook, not by memory (see
  [automation.md](automation.md)).

---

## Secrets & security

- **Secrets live in environment variables**, never in code or the repo.
- **Encrypt secrets at rest.** Third-party API keys / tokens are stored with **authenticated
  encryption** (e.g. AES-256-GCM) derived from a master key held only in the environment —
  encrypted **before** they are persisted.
- **Never expose a secret in plaintext** — not in responses, logs, audit entries, or error
  messages. Serialize only a safe fingerprint (e.g. last-4).

---

## External API fidelity

- **Never invent** fields, endpoints, or behaviors of a third-party API. Verify against the
  official documentation, or **ask** — do not simulate what you have not confirmed exists.
- Resolve all access to an external capability through a **single, central function**, so
  overrides/inheritance and credentials are decided in one place, never assumed ad hoc.

---

## Reliability: idempotency & auditability

- **Idempotent event handling.** Webhooks and event processors must be idempotent: a re-delivered
  event must not duplicate effects (e.g. never emit two invoices for one payment). Check whether
  the event was already handled before acting.
- **Audit every meaningful state write.** Create/update/delete on financial, scheduling, or
  otherwise consequential entities appends a record to an **audit log** — best-effort, never
  containing secrets, never allowed to break the business operation.

---

## Isolation & gating patterns

For products where they apply, these are non-negotiable:

- **Owner isolation (multi-tenant).** If data is owned per tenant/account, **every** query is
  scoped by the owner id; one owner can **never** read another's data.
- **Capability gating.** A disabled feature/module returns a **not-found (404)** at the route,
  not merely a hidden button. Absence must be indistinguishable from "never existed."
- **Identifier hygiene.** Public identifiers/slugs are validated against a reserved list and
  unique within their scope.

---

## Privacy by default

- Store **only** what the feature strictly needs. Avoid whole classes of sensitive data the
  product does not require (e.g. health/clinical records for a scheduling-and-billing tool).
- Prefer the most privacy-preserving option by default; do not put personal data where it does
  not belong (URLs, logs, third parties not asked for).
