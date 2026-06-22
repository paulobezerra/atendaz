---
description: Finaliza uma feature (marca spec/roadmap como concluído e arquiva o plano)
argument-hint: "{ID}"
---

Você recebeu o comando do projeto `/ssd-done $ARGUMENTS`.

Conforme `docs/00-agent-instructions.md`, este é um comando de finalização:
- Confirme o DOD: feature validada em produção + build limpo na Vercel + `npm audit` zero.
- Marque a especificação `docs/spec/F$1-*.md` e o roadmap `docs/06-implementation-roadmap.md` como **[CONCLUÍDO]**.
- Mova o plano `docs/plans/$1-*.md` para `docs/plans/archive/`.

Feature / argumento: $ARGUMENTS
