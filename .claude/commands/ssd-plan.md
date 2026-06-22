---
description: Gera o plano técnico de execução de uma feature em docs/plans/ (não toca código)
argument-hint: "{ID} [contexto adicional]"
---

Você recebeu o comando do projeto `/ssd-plan $ARGUMENTS`.

Siga estritamente o fluxo de PLANEJAMENTO definido em `docs/00-agent-instructions.md` e `docs/agent-plan-instructions.md`.

Limite físico de ação deste comando:
- PROIBIDO criar/editar/deletar código, rodar testes que alterem estado do banco, ou executar `git commit`/`git push`.
- Sua ÚNICA saída é o documento `docs/plans/$1-{slug}.md`.

Antes de escrever o plano:
- Leia a spec `docs/spec/F$1-*.md` e TODA a documentação base (`docs/01`–`docs/09`), validando contra os Guardrails (`docs/07`) e o Modelo de Dados (`docs/04`).
- Se houver ambiguidade ou conflito, interrompa e solicite clarificação via `/ssd-doc`.

O plano deve conter: contexto, decisões de arquitetura, tarefas técnicas (checklist), auditoria de segurança (`npm audit` zero), check de envs (local `.env.local` + Vercel) com passo a passo de onde obter cada variável (`docs/05`), cronograma de ações manuais do usuário, estratégia de testes e arquivos afetados.

Feature / argumento: $ARGUMENTS
