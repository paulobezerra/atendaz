# SSD — Spec-Sourced Development

> **SSD** is a personal, technology- and agent-agnostic framework for building software
> **with** AI agents without losing control of the codebase. It works the same whether the
> agent is Claude, Junie, Gemini, Cursor, or a human, and whether the stack is Next.js, Rails,
> or Go. This folder (`docs/ssd/`) is the framework itself — copy it into any repository to run
> the method. Everything specific to a given product lives elsewhere (see
> [Repository layout](#repository-layout)).
>
> **Read this as the rulebook.** If SSD were a tabletop RPG, `docs/ssd/` is the **Game Master's
> guide**: it tells the AI *how the game is played* — how to build the docs, the specs, the
> plans, and the implementation, in what order, through which gates, under which quality
> policies. It deliberately says **nothing about which technology does what** (that is the
> product's call, in `docs/project/`). It *does* constrain **how** technology is chosen when the
> choice is really a quality decision — e.g. "always the latest stable/LTS release, never a
> prerelease" is a quality rule, not a stack preference, so it lives here.

> ℹ️ **Name — needs your confirmation.** "SSD" is used throughout as the command prefix
> (`ssd-plan`, `ssd-code`, …). The expansion *"Spec-Sourced Development"* is a **placeholder**
> chosen to match the pillars below — swap it for the real one if you already have a name in
> mind.

## Why SSD exists

Coding agents are fast, but left unsupervised they drift: they invent behavior the spec never
described, refactor things nobody asked for, and declare features "done" that were never
verified. SSD keeps the human in control by making **the specification — not the code — the
source of truth**, and by forcing every change through a small set of **named commands** with
**explicit gates** between them. The agent executes; the human validates at each gate.

## The three non-negotiable pillars

These are the load-bearing rules. Everything else in the framework serves them. They do not
bend for deadlines. See [`principles.md`](principles.md) for the full statement of each.

1. **Tests before touching code.** Critical logic is written test-first; a bug fix starts with
   the failing test that reproduces it. "Green" that doesn't cover the changed surface is not
   done.
2. **Interface prototyping before implementation.** No new or reworked screen reaches
   production code without an approved static prototype. Visual decisions are made in a cheap,
   fast medium — not in framework code after a deploy.
3. **Spec as the source of truth, not the code.** Behavior is decided in the spec first; code
   is the spec made executable. When they disagree, the spec is right and the code is a bug.

## The commands

SSD is driven by five prefixed commands. Each is a **hard boundary** on what may change, and
each ends by handing off to the next with an explicit human gate in between. Full definitions
in [`commands.md`](commands.md).

| Command | Owns | Produces |
| :--- | :--- | :--- |
| `ssd-doc` | All documentation & specs (incl. prototypes) | Updated docs / spec on the trunk |
| `ssd-plan` | The execution plan | Feature branch + plan (no code) |
| `ssd-code` | Source code | Commits on the feature branch → staging deploy |
| `ssd-test` | Test runs | Evidence (local / staging / prod) |
| `ssd-done` | The trunk merge | Feature closed after production proof |

The canonical chain and the "how to close a command" rules (no hype, always name the next
step) are in [`commands.md`](commands.md#command-chaining).

## What SSD automates vs. what the agent does

Repetitive, deterministic checks belong in **scripts and git hooks**, not in an agent's prompt.
The agent orchestrates and reasons; husky/CI enforce the invariants (lint, tests, audit,
build-skip rules) the same way every time. This keeps the agent cheap, fast, and unable to
"forget" a gate. See [`automation.md`](automation.md).

## Governance gates

- **DOR (Definition of Ready)** — a spec may enter `ssd-plan` only when it is unambiguous, its
  UI is prototyped and approved, and its environment needs are known.
- **DOD (Definition of Done)** — a feature is "done" only after it is verified **in
  production**, with evidence.

## Quality policies

The framework carries the **quality controls and engineering policies** that every product
must obey regardless of stack — the testing policy, the dependency/versioning rules
(latest stable/LTS only, no prerelease, zero known vulnerabilities in production dependencies),
secrets & external-API discipline, idempotency & auditability, and the isolation/gating
patterns. These are stated technology-neutrally in [`quality.md`](quality.md); a product maps
each to its concrete stack in `docs/project/`.

## Repository layout

```
docs/
├── ssd/          ← THIS framework (agnostic, English, copy into any repo)
│   ├── README.md      — what SSD is (this file)
│   ├── principles.md  — the three non-negotiable pillars, in full
│   ├── commands.md    — command definitions, gates, chaining, closing rules
│   ├── workflow.md    — branches, environments, deploy (parameterizable)
│   ├── quality.md     — testing policy, dependency/versioning & security policies
│   └── automation.md  — scripts/hooks over AI for repetitive checks
└── project/      ← the specific product instance (may be in any language)
    ├── base/          — vision, architecture, data model, guardrails, design system…
    ├── spec/          — one spec per feature (source of truth)
    └── plans/         — one execution plan per feature
```

The framework is **agnostic**; the `project/` folder is where a concrete product (its domain,
stack, and rules) plugs in. Agent shortcut files (`.claude/`, IDE configs) only **redirect** to
these documents — they never hold rules of their own.
