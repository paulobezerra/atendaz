---
description: Implementa uma feature com base na spec e no plano aprovado
argument-hint: "{ID}"
---

Você recebeu o comando do projeto `/ssd-code $ARGUMENTS`.

Siga `docs/00-agent-instructions.md` e `docs/agent-code-instructions.md`.

Regras:
- Leia `docs/spec/F$1-*.md` e `docs/plans/$1-*.md` antes de codar. Revalide os Guardrails (`docs/07`).
- Esta é a ÚNICA porta de entrada para modificar código-fonte e correções técnicas.
- A Fonte da Verdade é a Spec + o Plano; não implemente nada fora deles (se surgir necessidade não prevista, pare e atualize o plano via `/ssd-doc`).
- Aplique TDD nas áreas críticas (idempotência, cálculos, criptografia, resolução de billing) e marque as tarefas do plano conforme avança.
- Bloqueio de integridade: PROIBIDO `git push` com testes locais falhando — rode `/ssd-test local` e garanta verde primeiro.

Feature / argumento: $ARGUMENTS
