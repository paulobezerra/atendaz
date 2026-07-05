# SSD — Automation: Scripts Over AI

**Repetitive, deterministic work belongs in scripts and git hooks — not in an agent's prompt.**
The agent *orchestrates and reasons*; the machinery *enforces the invariants* the same way every
time. This keeps the agent cheap and fast, and makes it **impossible to "forget" a gate**: a
human or an AI can skip a checklist item, but a pre-commit hook cannot.

## The dividing line

Ask of any step: *"Does this need judgement, or just execution?"*

| Do it in a **script / hook** (deterministic) | Do it with the **agent** (judgement) |
| :--- | :--- |
| Run the test suite | Decide *what* to test and write the tests |
| Lint / format | Resolve a design or architecture question |
| Audit dependencies for vulnerabilities | Choose which dependency to adopt |
| Run the production build / type-check | Interpret a build failure and fix the cause |
| Skip the deploy build for doc-only commits | Write the documentation |
| Block a push when the suite is red | Diagnose *why* the suite went red |

If a step is the same every time and has a binary pass/fail, it should be a script. The agent's
job is to react to the script's verdict, not to re-perform the check by hand.

## Where the checks live

- **Pre-commit hook** — the fast integrity checks (at minimum, the test suite). A red result
  aborts the commit.
- **Pre-push hook** — the gate that protects shared branches (the suite, and the
  production-dependency vulnerability audit). A failure **blocks the push by design**.
- **Ignored-build step** — a versioned script that tells the host to **skip the build** when a
  commit only touched documentation/tooling paths, so `ssd-doc` commits don't deploy.
- **CI (optional)** — the same scripts, re-run on the server as a backstop.

Every hook is just a thin wrapper that calls a **versioned script** in the repo, so the logic is
reviewable, testable, and identical for every contributor and every agent.

## Prefer hooks over doing it in a command

A command like `ssd-done` should **not** re-implement CI/CD by hand in the agent's reasoning.
It should **rely on the hooks/scripts** to have already enforced the invariants, and concern
itself only with the judgement part (is this the right thing to merge? did production actually
behave?). Concretely: push the checks **down** into husky/CI wherever they are deterministic, and
let the commands assume them. The less the agent re-derives a mechanical check, the less it can
get it wrong.

## Rules

1. **A new repetitive check is a script first.** If you find yourself doing the same mechanical
   verification across features, propose moving it into a hook/script (via `ssd-code`, since
   scripts are code) rather than baking it into a prompt.
2. **Hooks are load-bearing, not advisory.** A failing gate blocks the action; it is never
   "warn and continue."
3. **Scripts are versioned and reviewable.** No hidden local-only automation — the whole team
   (and every agent) runs the identical checks.
4. **The agent trusts the script's verdict.** On green, proceed; on red, diagnose the cause —
   do not re-run the check manually to "double-check" what the script already decided.
