---
description: Implementa a feature na branch e publica em homologação (stage/Preview)
argument-hint: "{ID}"
---

Você recebeu o comando do projeto `/p2s-code $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-code` (pré-condição de branch + **revalidação de DOR**, "na dúvida, não codar").
- `docs/p2s/quality.md` → política de testes (TDD nas áreas críticas, cobrir a superfície alterada) e portão de build.
- `docs/p2s/workflow.md` → commits na branch; um push → deploy de stage; suíte vermelha bloqueia o push.
- Guardrails e stack do produto: `docs/project/base/`.

Argumento (ID da feature): $ARGUMENTS
