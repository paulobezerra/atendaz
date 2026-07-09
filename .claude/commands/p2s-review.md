---
description: QA da feature — roda os testes (script) e revisa consistência (spec×plan×código×doc); achados por severidade
argument-hint: "{ID}"
---

Você recebeu o comando do projeto `/p2s-review $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-review` (roda o script de testes + revisão holística).
- Confere spec × plan × código × doc × framework; reporta achados classificados (**bloqueante / major / medium / minor**) com **corrigir-ou-postergar** (postergado = débito registrado).
- Rodar a suíte é **script/hook** (pilar de apoio — `docs/p2s/automation.md`); você lê o veredito e julga a consistência.
- A validação de ambiente exigida é a **definida pelo projeto** (ver `docs/project/base/workflow.md`), não hardcoded.

Argumento (ID da feature): $ARGUMENTS
