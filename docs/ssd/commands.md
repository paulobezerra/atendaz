# SSD — Commands, Gates & Chaining

This is the turn structure of the game. SSD runs through **five prefixed commands**. Each is a
**hard boundary** on what you (the agent) may change, and each ends by handing off to the next
through an **explicit human gate**. You execute inside a command; the human decides when to move
to the next one. Never collapse two commands into one on your own.

> Throughout, `{ID}` is the feature identifier and `{slug}` a short kebab-case name.
> "Trunk" is the production branch (commonly `main`/`master`). Concrete branch names,
> environments and deploy mechanics are in [`workflow.md`](workflow.md).

## The command as a physical boundary

Treat the command you were invoked with as a wall you cannot climb over:

| Command | May change | Must NOT do |
| :--- | :--- | :--- |
| `ssd-doc` | Any documentation & spec (incl. prototypes) | Touch source code |
| `ssd-plan` | The execution plan only | Write/edit/delete code; run state-changing tests; fix code it finds broken (record as debt instead) |
| `ssd-code` | Source code (the only entry point for it) | Work off the feature branch; merge to trunk |
| `ssd-test` | Nothing (runs tests, reports) | Change git state |
| `ssd-done` | The trunk (merge only) | Run without production proof |

## `ssd-doc {topic | ID}` — documentation & specs

Owns **all** documentation: base docs, architecture, data model, decisions, **and** per-feature
specs (there is no separate "spec" command — a spec is documentation). When creating/editing a
spec you must:

- Align it with the [quality policies](quality.md) and the product's domain model.
- Include a **UX section** (flows + screens) for any feature with an interface, grounded in the
  product's design system.
- **Prototype every new or substantially reworked screen** and get **explicit** human approval
  **before** the spec is considered ready — the approved prototype is linked from the UX
  section. Prototyping lives here, not in `ssd-plan`/`ssd-code` (see
  [principles.md](principles.md) §2).

## `ssd-plan {ID}` — the execution plan

Turns a **ready** spec into a step-by-step plan. You must:

1. **DOR gate first (blocking).** Validate the spec's [Definition of Ready](#dor--dod) *before*
   planning anything. If the spec has UI without an approved, linked prototype — or has
   ambiguity, a guardrail conflict, or undefined environment needs — **stop immediately, produce
   no plan**, and hand back to `ssd-doc` to close the gap. Never plan on an incomplete DOR.
2. Create the feature branch and, at the end, commit **only** the plan document to it. Never
   touch code. Code problems you notice are recorded as **technical debt in the plan**, not
   fixed here.
3. Produce: a checklist of atomic tasks, the files to create/modify, the test strategy for the
   feature, an environment/infrastructure check, and a chronological list of any **manual
   actions** the human must take (and exactly when).

## `ssd-code {ID}` — implementation

The **only** entry point for changing source code. You must:

1. **Branch precondition (blocking).** Run only on the feature branch. If on the trunk or the
   wrong branch, **stop** and direct to `ssd-plan {ID}` (which creates the branch).
2. **Re-validate the DOR (blocking).** Re-check spec + approved prototype (for screens) + plan.
   On **any** inconsistency (ambiguous/stale spec, missing/divergent prototype, plan incoherent
   with the spec), **do not implement** — hand back to `ssd-doc` (spec/UX gap) or `ssd-plan`
   (plan gap). *"When in doubt, don't code."*
3. Implement strictly what the spec and plan describe — no invented behavior. Follow the
   [quality policies](quality.md): tests with the change, TDD in critical areas, coverage of the
   changed surface, a successful production build.
4. Replicate approved prototypes **faithfully** for any screen.
5. A push publishes to the staging environment; a failing local test suite **blocks** the push.

## `ssd-test {local | staging | prod}` — evidence

The **only** entry point for test runs. Reports results as evidence for the DOD. "Green" is
valid evidence **only** if the right layers cover the **changed surface** (see the
[testing policy](quality.md#testing-policy)); a green run that doesn't exercise what changed is
an incomplete gate, reported as a gap — not an approval.

## `ssd-done {ID}` — close the feature

The **only** command that changes the trunk, and a **human-only decision**. You must:

- Require green on `local` **and** `staging`, then merge the feature into the trunk (preserving
  the branch) and validate with `ssd-test prod`.
- **Only if production passes**: mark the spec and the roadmap as done and archive the plan. If
  production fails, the feature is **not** done — return to the correction cycle on the same
  branch.
- **Never** trigger `ssd-done` on your own — it is the human's call, made after the review gate.

## DOR & DOD

- **DOR (Definition of Ready)** — a spec is ready only when: (1) it is complete and unambiguous,
  aligned to the quality policies and domain model; (2) **every new/reworked screen has an
  approved, linked prototype**; (3) its environment/infrastructure needs are identified. The DOR
  is **validated as the entry gate of `ssd-plan`** and **re-validated in `ssd-code`**. Any failed
  item **stops the command** and returns to `ssd-doc`.
- **DOD (Definition of Done)** — a feature is done only after it is verified **in production**,
  proven by evidence (success logs, a screenshot, or automated smoke/E2E against production).

## Command chaining

The flow is a **chain of gates**, each with a human step in the middle. When you **finish any
command**, close **factually and prescriptively** — never with hype or self-congratulation.

**Forbidden at close** — declaring the feature "done/shipped" on your own, or announcing the
next work as if already authorized. Do **not** say things like *"Done, feature X shipped!"* or
*"All good, moving on to implement screen Y."* The human decides to advance; you do not presume
approval or chain one command into the next by yourself.

**Required at close** — end with these three blocks, in order:

1. **What was done** — factual, no success adjectives ("I implemented X", not "successfully
   delivered X"). Declare any deviation/decision.
2. **What the human must validate/decide now** — the human action at this gate.
3. **Next command** — the exact command to run *after* validation (or "awaiting your review"
   when the next step is purely human). **One** next command, not a whole roadmap.

### Canonical next step per command

| Finished | Human step | Next command |
| :--- | :--- | :--- |
| `ssd-doc` | Read and **validate the docs**. | `ssd-plan {ID}` — **if** a spec change requires (re)planning. Otherwise it ends here. |
| `ssd-plan` | **Validate the plan** (tasks, files, DOR). | `ssd-code {ID}` |
| `ssd-code` | **Test manually** on staging + review the diff (human review gate). | `ssd-test {target}` if warranted; then `ssd-done {ID}` to close. |
| `ssd-test` | Read the evidence (green/red). | Back to `ssd-code` (if red) or on to `ssd-done` (if the human gate approved). |
| `ssd-done` | — (feature closed). | Next feature in roadmap order, via `ssd-doc` / `ssd-plan`. |

**Preconditions you restate when suggesting the next command:** `ssd-plan` needs an approved DOR
(else → `ssd-doc`); `ssd-code` needs a feature branch + re-validated DOR (else it stops);
`ssd-done` needs a prior `ssd-code`/`ssd-test`, a feature branch, and the human's explicit
go-ahead.

## The human review gate (between `ssd-code` and `ssd-done`)

After `ssd-code` publishes to staging and **before** any `ssd-done`, there is a **mandatory,
manual human checkpoint**. This is where the agent's work is checked and course-corrected — you
may have implemented the wrong thing, diverged from the spec, or "hallucinated," and this is
where that is caught. Passing tests is **not** the same as being correct. Never skip or
pre-empt this gate.
