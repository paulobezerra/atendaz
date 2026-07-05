# SSD — The Three Non-Negotiable Pillars

These three rules are the reason SSD exists. They are **inviolable**: no deadline, no "just this
once", and no agent convenience overrides them. If a situation seems to require breaking one,
the situation is wrong — stop and fix the situation, not the rule.

Everything else in the framework (commands, gates, branch flow, automation) exists to **enforce**
these three.

---

## 1. Tests before touching code

**Rule.** Code is not written and then tested; behavior is pinned by tests **first**, at the
level of rigor the project already holds.

- **Critical logic is test-first (TDD).** Anything where correctness is subtle — money math,
  scheduling/slot math, idempotency, state transitions, permission/tenancy checks — gets its
  test written *before* the implementation.
- **A bug fix starts with the failing test** that reproduces it. The test goes red, then the
  fix makes it green. A fix with no reproducing test is not accepted.
- **Coverage travels with the change.** UI with logic ships with a render/interaction test of
  the touched surface. "Green" that does not exercise the changed code is **not** "done" — it is
  an untested change that happens to pass old tests.
- **Determinism.** Tests must run without external services (in-memory / mocked dependencies)
  so they are fast, isolated, and runnable by a git hook on every commit.

**Why.** Tests are the executable half of the spec. They are how an agent's change is proven to
match intended behavior instead of merely "looking right." They also make the git hooks
(pillar-adjacent automation) meaningful — a hook that runs tests only protects you if the tests
are real.

---

## 2. Interface prototyping before implementation

**Rule.** No **new** screen, and no **substantially reworked** screen, reaches production code
without a **static prototype that the human approved first**.

- The prototype is built in a **cheap, fast medium** (plain HTML/CSS + a little vanilla JS —
  no framework, no build, no real data or APIs). It captures layout, states, and interaction —
  not production wiring.
- It is **presented to the human and iterated** until an **explicit** approval ("approved",
  "ship it"). Silence, or "looks better", is **not** approval.
- The approved prototype is **versioned** and **linked from the spec's UX section**. It — not
  the agent's intuition — is what the implementation must faithfully replicate, and what the
  human review compares against.
- Prototyping is part of the **spec** (it happens in `ssd-doc`) and is a **DOR requirement**: a
  spec with UI but no approved prototype cannot enter `ssd-plan`.

**Why.** Deciding visuals in production code is the most expensive place to iterate: every
"that's ugly, redo it" round costs a full code + test + deploy cycle. Prototyping moves the
visual decision *before* any production line is written, where a round costs seconds.

---

## 3. Spec as the source of truth — not the code

**Rule.** Behavior and architecture are decided in the **spec** first. The code is the spec made
executable. When code and spec disagree, the **spec is right** and the code has a bug.

- **Documentation before code.** No feature is implemented before its spec (`project/spec`) and
  execution plan (`project/plans`) are aligned. Any change to business logic or architecture is
  reflected in the docs **first**, then in code.
- **The spec is where ambiguity is resolved.** If an agent hits an unforeseen question mid-code,
  it **stops** and sends the question back to the spec (`ssd-doc`) — it does not improvise a
  decision in code.
- **The code never becomes the authority by default.** "The code does X, so X must be right" is
  the failure mode SSD exists to prevent. If X isn't in the spec, X is unreviewed drift.
- **Agent config is not the source of truth.** Command shortcut files (`.claude/`, IDE configs)
  only redirect to these docs. Rules live here; switching agents loses nothing.

**Why.** An AI agent will confidently generate plausible behavior that no one asked for. The
only durable defense is a human-owned, human-readable statement of intent that outranks whatever
the code happens to do — reviewed *before* the code exists, not reverse-engineered from it
afterward.

---

## How the pillars are enforced

| Pillar | Enforced by |
| :--- | :--- |
| Tests before code | `ssd-code` writes tests with the change; git hooks run the suite on commit/push; a red suite blocks the push ([`automation.md`](automation.md)). |
| Prototype before implementation | DOR gate in `ssd-plan` (stops if UI unprototyped); human approval gate before `ssd-code` replicates a screen ([`commands.md`](commands.md)). |
| Spec as source of truth | `ssd-doc` owns all behavior decisions; `ssd-plan`/`ssd-code` re-validate against the spec and refuse to proceed on inconsistency. |
