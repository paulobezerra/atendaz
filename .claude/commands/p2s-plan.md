---
description: Gera o plano técnico da feature (cenários BDD + inventário cria/altera/exclui) em docs/project/plans/
argument-hint: "{ID} [contexto adicional]"
---

Você recebeu o comando do projeto `/p2s-plan $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-plan`, o **portão de DOR (bloqueante)** e `## DOR & DOD`.
- Entrega **cenários testáveis (BDD)** + **inventário cria/altera/exclui**, guiando o TDD. **Não** altera código.
- **Git-flow agnóstico:** o comando produz o plano; **quando/se ramificar é o git flow do projeto** (`docs/project/base/workflow.md`), não uma ação hardcoded da IA.
- O plano vive em `docs/project/plans/{ID}-*.md`. A spec de entrada está em `docs/project/spec/F{ID}-*.md`.

Argumento (ID da feature + contexto): $ARGUMENTS
