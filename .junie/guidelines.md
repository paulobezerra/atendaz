# Junie — Adaptador do P2S (JetBrains)

Este arquivo é **só uma referência**. O método deste projeto é o **P2S (Prototype-to-Spec)**, e a
**fonte da verdade é o framework em [`docs/p2s/`](../docs/p2s/)** — agnóstico de agente. Junie **não**
guarda regras próprias aqui; segue o framework.

## Comece por aqui

Leia [`docs/p2s/install.md`](../docs/p2s/install.md) e depois o framework na ordem indicada
(`README` → `principles` → `commands` → `workflow` → `quality` → `automation` → `agents` →
`project-structure`).

## Os comandos (regras em `docs/p2s/commands.md`)

O método roda por 8 comandos em 2 fases — as regras de **cada** um estão em
[`docs/p2s/commands.md`](../docs/p2s/commands.md); execute conforme lá:

- **Upstream (re-executável):** `p2s-discovery` (produto → constitution + roadmap) · `p2s-design` (UX).
- **Transversal:** `p2s-doc` (docs ↔ realidade).
- **Downstream:** `p2s-spec` → `p2s-plan` → `p2s-code` → `p2s-review` → `p2s-done`.

Para invocar, diga a intenção do comando (ex.: "rode o `p2s-spec` da F0002.8 conforme
`docs/p2s/commands.md`") — Junie segue a seção correspondente.

## Agente de apoio (opcional, padrão)

O **`summarizer`** (economia de contexto) está definido em
[`docs/p2s/agents.md`](../docs/p2s/agents.md#summarizer). Quando Junie não tiver subagente isolado,
aplique o **contrato de saída** dele à mão em varreduras amplas (resumo denso; nunca comprima a
fonte da verdade).

## Git flow & DOD

Agnósticos no framework; o **concreto** deste projeto está em
[`docs/project/base/workflow.md`](../docs/project/base/workflow.md). A IA **nunca** mergeia o tronco
por conta própria.
