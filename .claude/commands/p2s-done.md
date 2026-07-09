---
description: Mergeia a feature na master, valida em prod e finaliza (portão do DOD)
argument-hint: "{ID}"
---

Você recebeu o comando do projeto `/p2s-done $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-done`, `## DOR & DOD` e o **portão de revisão humana**.
- `docs/p2s/workflow.md` → único comando que altera o tronco; exige verde em `local` **e** `stage`; merge `--no-ff` preservando a branch.
- `docs/p2s/automation.md` → confie nos hooks/scripts; não reimplemente CI/CD no comando.

Argumento (ID da feature): $ARGUMENTS
