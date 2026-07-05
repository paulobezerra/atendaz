# SSD — Branches, Environments & Deploy

This is the board the game is played on. The mechanics below are **parameterizable**: SSD fixes
the *shape* (one trunk, one branch per feature, three environments, deploy driven by git
events), and each product fills in the concrete host and commands in `docs/project/`.

## Branches

- **Trunk** (`main`/`master`) — the **production** branch. Changed **only** by `ssd-done`
  (the feature merge). Must always stay green and deployable.
- **`feature/{ID}-{slug}`** — one per feature. **Created by `ssd-plan`**, **merged by
  `ssd-done`**, and **never deleted** (it preserves the feature's history/audit trail).

## Environments

Three environments, each answering a different question:

| Environment | Question it answers | Fed by |
| :--- | :--- | :--- |
| **local** | Does the logic hold in isolation? | The test suite against in-memory/mocked dependencies |
| **staging** | Does the deployed feature behave? | A **preview** deploy, produced on every push to the feature branch |
| **prod** | Is it correct for real users? | The **production** deploy, produced by the trunk merge |

Staging is where a feature is validated **while deployed** before it touches production. The
product binds "preview" and "production" to its actual host.

## Deploy triggers per command

| Command | Git / deploy effect |
| :--- | :--- |
| `ssd-doc` | Commit docs/specs straight to the trunk. **No deploy** (see [doc-only builds](#doc-only-commits-skip-the-build)). |
| `ssd-plan` | Create `feature/{ID}-{slug}` off the trunk; commit **only** the plan to it. No code. |
| `ssd-code` | Incremental commits on the branch; a push → **staging** deploy. Never touches the trunk. |
| `ssd-test` | Runs tests only. Changes no git state. |
| `ssd-done` | Requires green on `local` **and** `staging`. Merges into the trunk (keeping the branch) → **production** deploy → runs `ssd-test prod`. |

## Automatic commit & push

Commands that produce changes have **standing authorization** to version their output: at the
end of such a command, commit **and** push automatically, **without pausing to ask**.

- `ssd-doc` → commit + push on the trunk.
- `ssd-plan` → commit + push the plan on the feature branch.
- `ssd-code` → commit(s) + push on the feature branch (publishes to staging).
- `ssd-done` → merge + push on the trunk.
- `ssd-test` does not version (it only runs tests).

This does **not** loosen the integrity gates: the `ssd-code` push happens only with `ssd-test
local` green, and the `ssd-done` merge only with `local` and `staging` green. When the gate
passes, proceed with commit/push directly — no extra confirmation.

## The human review gate (between `ssd-code` and `ssd-done`)

After staging is published and **before** any `ssd-done`, the human: (1) tests manually on
staging against the spec, (2) reviews the branch diff, and (3) decides — **approve** → proceed
to `ssd-done`; **reject/adjust** → back to the correction cycle (`ssd-code`, or `ssd-doc` for a
spec gap) on the same branch. You never run `ssd-done` on your own. Treat this gate as the main
safeguard against off-track work — "the tests passed" is not "it is correct." (See
[commands.md](commands.md#the-human-review-gate-between-ssd-code-and-ssd-done).)

## The DOD gate & correction cycle

`ssd-done` marks the spec and roadmap as done (and archives the plan) **only if `ssd-test prod`
passes**. If production fails, the feature is **not** done: return to the
`ssd-code → ssd-test → ssd-done` cycle (or `ssd-doc` if the failure reveals a spec gap) on the
**same branch** until green. Since staging was already validated, production failures tend to be
environment-specific and fixed by *fix-forward*.

## Doc-only commits skip the build

So that **documentation-only** commits on the trunk (`ssd-doc`) do **not** trigger a production
deploy, the host is configured with an **ignored-build step**: a small versioned script that
**skips the build** when a commit only touched documentation/tooling paths. This is a
deterministic check — it belongs in a script, not in an agent's judgement (see
[automation.md](automation.md)).
