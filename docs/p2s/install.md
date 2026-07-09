# P2S — Instalação (bootstrap agnóstico de agente)

Este guia liga o método P2S a um repositório **para qualquer agente** (Claude, Junie, Cursor,
Codex, …) ou humano. A ideia central: **o framework (`docs/p2s/`) é a única fonte da verdade**; cada
agente ganha apenas **adaptadores finos** que *referenciam* o framework — nunca cópias das regras.
Trocar de agente (ex.: acabaram os tokens do Claude, seguir no Junie) **não perde nada**: é só gerar
os adaptadores do novo agente.

> Não há comando "mágico" embutido em nenhum agente. Instalar é: **um agente lê este arquivo e
> prepara o que for preciso.** Onde houver slash commands, um atalho `p2s-install` só aponta para cá.

## O que o P2S é (para o agente que está instalando)

Leia, nesta ordem: [`README.md`](README.md) → [`principles.md`](principles.md) →
[`commands.md`](commands.md) → [`workflow.md`](workflow.md) → [`quality.md`](quality.md) →
[`automation.md`](automation.md) → [`agents.md`](agents.md) → [`project-structure.md`](project-structure.md).

O método roda por **8 comandos em 2 fases** (definidos em `commands.md`):

- **Upstream (re-executável):** `p2s-discovery` (produto → constitution + roadmap) · `p2s-design` (UX).
- **Transversal:** `p2s-doc` (docs ↔ realidade).
- **Downstream:** `p2s-spec` → `p2s-plan` → `p2s-code` → `p2s-review` → `p2s-done`.

## Passos da instalação (o agente executa)

1. **Ler o framework** inteiro (ordem acima) — é ele que você vai seguir, não os adaptadores.
2. **Garantir a estrutura do produto** (se ainda não existe): `docs/project/{base,spec,plans}` e
   `templates/{referencia,prototipos}` — ver [`project-structure.md`](project-structure.md). Num
   greenfield, o primeiro comando real é `p2s-discovery`.
3. **Gerar os adaptadores DESTE agente** (só referências — ver tabela abaixo): um atalho por comando
   que aponta para a seção certa de `commands.md`, e (padrão, opcional) o adaptador do `summarizer`
   apontando para [`agents.md`](agents.md#summarizer).
4. **Conferir a fronteira:** nenhum adaptador guarda regra própria — só ponteiros. Se um adaptador
   "explica" o que o comando faz, ele está errado; corte para uma referência.
5. **Declarar o git flow do projeto** em `docs/project/base/workflow.md` (branches, ambientes,
   promoção) — o framework é agnóstico disso.

## Mapa de adaptadores por agente (só referências)

| Agente | Comandos | Summarizer (opcional) |
| :--- | :--- | :--- |
| **Claude Code** | `.claude/commands/p2s-*.md` (frontmatter mínimo + ponteiro para `commands.md#<cmd>`) | `.claude/agents/summarizer.md` → `agents.md#summarizer` |
| **Junie (JetBrains)** | `.junie/guidelines.md` aponta para `docs/p2s/` e lista os comandos | descrito no mesmo `guidelines.md` |
| **Cursor / outro** | O mecanismo de "rules/commands" da ferramenta, sempre **referenciando** `docs/p2s/` | perfil/subagente da ferramenta → `agents.md#summarizer` |
| **Sem suporte a atalhos** | Nenhum — o humano invoca "rode o p2s-spec conforme `docs/p2s/commands.md`" | orquestrador aplica o contrato à mão |

## O summarizer é padrão, não obrigatório

Uma instalação **inclui** o adaptador do `summarizer` por padrão (economia de contexto — ver
[`agents.md`](agents.md#summarizer)). Um projeto pode **não** instalá-lo, ou removê-lo: o método
continua íntegro, só sem o isolamento barato de varreduras. Ferramentas de compressão externas
(ex.: LLMLingua) são **opcionais** e ficam a critério do projeto.
