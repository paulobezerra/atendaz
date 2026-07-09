---
description: Cria/atualiza a spec da feature via prototipação navegável (UX, API, dados, integrações)
argument-hint: "{ID} [contexto adicional]"
---

Você recebeu o comando do projeto `/p2s-spec $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-spec` e a **fronteira dura entre `p2s-doc` e `p2s-spec`** (spec não altera doc base).
- `docs/p2s/principles.md` → §2 (prototipação da fronteira inteira; todo protótipo aprovado vira spec).
- `docs/p2s/workflow.md` → commit da spec + protótipos no tronco, sem deploy, sem criar branch.
- A spec vive em `docs/project/spec/F{ID}-*.md`; os protótipos em `templates/prototipos/` (UI) e `templates/prototipos/api/` (OpenAPI/API fake).

Argumento (ID da feature + contexto): $ARGUMENTS
