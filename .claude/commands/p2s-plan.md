---
description: Cria a branch da feature e gera o plano técnico em docs/project/plans/
argument-hint: "{ID} [contexto adicional]"
---

Você recebeu o comando do projeto `/p2s-plan $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-plan`, o **portão de DOR (bloqueante)** e `## DOR & DOD`.
- `docs/p2s/workflow.md` → cria `feature/{ID}-{slug}` a partir do tronco; commita **apenas** o plano; nunca toca código.
- O plano vive em `docs/project/plans/{ID}-*.md`. A spec de entrada está em `docs/project/spec/F{ID}-*.md`.

Argumento (ID da feature + contexto): $ARGUMENTS
