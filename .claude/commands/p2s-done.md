---
description: Fecha a feature — arquiva plano/protótipos, marca concluído e entrega a promoção ao git flow do projeto
argument-hint: "{ID}"
---

Você recebeu o comando do projeto `/p2s-done $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-done`, `## DOR & DOD` e o **portão de revisão humana**.
- **Fecha logicamente:** arquiva plano/protótipos (ver ciclo de vida em `docs/p2s/workflow.md`), marca spec/roadmap concluídos **se a validação definida pelo projeto passou** (DOD **não** é "prod" hardcoded).
- **Git-flow agnóstico:** a IA **nunca** mergeia no tronco por conta própria. A **promoção** (PR no Azure/GitHub, merge, deploy) segue o git flow do projeto (`docs/project/base/workflow.md`).

Argumento (ID da feature): $ARGUMENTS
