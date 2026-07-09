# P2S — Agentes de Apoio (agnóstico de agente)

O P2S é **multiagente e agnóstico**: nenhuma parte do método depende de Claude, Codex, Cursor,
Junie ou de qualquer harness específico. Os **agentes de apoio** abaixo são definidos **aqui, no
framework** — sua função, contrato e regras. Cada ferramenta de agente apenas **liga** (adapta) essa
definição no seu próprio formato; a definição nunca vive dentro de `.claude/`, `.junie/` & cia.

> Adaptadores são só referências. Ver [`install.md`](install.md) para como cada agente é ligado, e o
> pilar 3 em [`principles.md`](principles.md) (a config do agente não é a fonte da verdade).

## `summarizer` — agente de economia de contexto (padrão, opcional)

A implementação da família "multiagente-sumarizador" (ver
[economia de tokens](automation.md#economia-de-tokens--compactação-de-contexto-opcional)). **Padrão
numa instalação, mas não obrigatório** — um projeto pode desligá-lo.

- **Função.** Fazer varreduras **amplas e read-only** cuja saída bruta não deve poluir o contexto
  principal: ler spec×plan×código×doc para o `p2s-review`, digerir logs/saídas longas, mapear onde
  algo está em muitos arquivos, pesquisa exploratória.
- **Como roda.** Em **modelo barato**, **isolado** do thread principal, **read-only** (não edita,
  move ou versiona). A saída bruta fica nele; ao orquestrador volta **só o resumo**.
- **Contrato de saída (denso, não bruto).** (1) **Resposta** em 1–3 frases; (2) **fatos-chave** em
  bullets, cada um com `arquivo:linha` quando verificável; (3) **lacunas/riscos** em uma linha cada.
  Nunca cola arquivos inteiros nem dumps.
- **Regra dura — nunca comprima a fonte da verdade.** Comprime-se o **transitório** (logs, tool
  output, histórico); **jamais** a spec, os contratos aprovados, os guardrails ou a constitution
  (viola o pilar 3). Fatos load-bearing — nomes exatos, valores, invariantes — são **preservados**,
  não resumidos ao ponto de distorcer.

**Quando NÃO usar.** Para editar código, ou para decisões que exijam o contexto completo da
conversa. O sumarizador **informa**; quem decide e muda é o orquestrador.

## Ligando num agente

A definição acima é o contrato. O adaptador de cada agente é **fino** e só aponta para cá:

| Agente | Onde vive o adaptador (só referência) |
| :--- | :--- |
| Claude Code | `.claude/agents/summarizer.md` (frontmatter mínimo → "siga `docs/p2s/agents.md#summarizer`") |
| Junie (JetBrains) | `.junie/guidelines.md` descreve o papel e aponta para cá |
| Outro | O mecanismo de subagente/perfil da ferramenta, sempre **referenciando** este arquivo |

Se uma ferramenta não tem subagentes, o próprio orquestrador aplica o contrato "à mão" (roda a
varredura, resume segundo o contrato) — o método não quebra; só perde o isolamento barato.
