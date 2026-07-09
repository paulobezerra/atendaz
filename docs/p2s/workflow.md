# P2S — Fluxo Lógico (agnóstico de git & ambiente)

Este é o *formato* do jogo, não o tabuleiro concreto. O P2S fixa o **fluxo lógico** — fases,
portões, o que é durável vs descartável, ordem — e deixa a **mecânica concreta de git e ambiente**
para cada projeto declarar em [`docs/project/`](../project) (tipicamente
`docs/project/base/workflow.md`). O que é do framework **nunca** amarra você a um gitflow.

## O que é lógico (framework) vs concreto (projeto)

| Lógico — do P2S | Concreto — do projeto (declara em `docs/project/`) |
| :--- | :--- |
| Fases upstream/downstream; ordem dos comandos; portões DOR/DOD | Se é trunk-based, git-flow, ou PR-based; nomes de branch |
| "Publicar", "promover", "fechar" como **eventos lógicos** | O mapeamento para branch/merge/**PR** (Azure DevOps/GitHub)/deploy |
| Ciclo de vida do descartável; revisão humana obrigatória | Ambientes reais (local, homologação, QA, produção) e seus hosts |
| A IA **nunca** muta o tronco por conta própria | Quem promove: humano via PR, CI, ou merge — e com qual gate |

## Ambientes (lógicos)

Três **perguntas**, não três hosts fixos — o projeto liga cada uma ao seu ambiente real:

| Pergunta | Respondida por |
| :--- | :--- |
| A lógica se sustenta isolada? | A suíte de testes contra dependências em memória/mockadas |
| A mudança integrada se comporta? | Um ambiente de **validação** (preview/homologação/QA — o que o projeto tiver) |
| Está correto para o uso real? | O **ambiente designado pelo projeto** como alvo de validação final |

O P2S **não** exige que exista "produção testável" — projetos onde isso não é possível designam
outro ambiente de validação (é decisão do projeto; ver [DOD](commands.md#dor--dod)).

## Promoção é do git flow do projeto

O P2S define **quando** uma feature está logicamente pronta para promover (portão de revisão humana
aprovado + `p2s-review` sem bloqueantes + validação do projeto verde). **Como** promover é do
projeto:

- Solo/trunk-based: pode ser um merge local.
- Corporativo/multi-dev: quase sempre um **PR** revisado por outros (Azure DevOps/GitHub), com CI e
  homologação no caminho.

Em **todos** os casos, **a IA prepara a mudança; humano/automação promovem**. O agente nunca
executa o merge no tronco por conta própria nem presume o caminho de promoção.

## Versionar a saída dos comandos

Comandos que produzem artefatos **commitam a própria saída** — mas o **destino do push e a
promoção seguem o git flow do projeto**, não uma regra do framework:

- Comandos de **doc/discovery/design/spec** produzem artefatos duráveis/descartáveis versionados; o
  projeto decide se isso vai direto ao tronco (solo) ou via PR (corporativo).
- **`p2s-code`** versiona na branch/fluxo do projeto; publicar num ambiente de validação é efeito do
  git flow do projeto, não do comando.
- **`p2s-review`** não versiona (roda testes, reporta).
- **`p2s-done`** fecha logicamente e **entrega** a promoção ao fluxo do projeto.

> Auto-commit/auto-push sem confirmação é uma **política de projeto** (faz sentido para um solo com
> tronco direto; num fluxo de PR, não). Onde adotada, os portões de integridade continuam valendo
> (não versionar com testes vermelhos).

## O portão de revisão humana (entre `p2s-review` e `p2s-done`)

Depois do `p2s-review` e **antes** de qualquer `p2s-done`, o humano: (1) confere a evidência e os
achados por severidade, (2) revisa o diff, e (3) decide — **aprovar** → segue para `p2s-done`;
**reprovar/ajustar** → volta ao ciclo de correção. Você nunca roda `p2s-done` por conta própria.
"Os testes passaram" não é "está correto". (Ver
[commands.md](commands.md#o-portão-de-revisão-humana-entre-p2s-review-e-p2s-done).)

## Ciclo de vida dos artefatos descartáveis

Protótipos (`templates/prototipos/`, `templates/referencia/`), planos (`plans/`) e **reviews**
(`reviews/`) são **descartáveis por design** (pilar 2):

1. **Vivos** — enquanto a feature está em construção, são a referência do gate de revisão humana.
2. **Arquiváveis** — quando a feature fecha (DOD) **e** suas regras já foram **consolidadas na
   spec/base**, o artefato cumpriu seu papel. Planos e reviews vão para `plans/archive/` /
   `reviews/archive/`; protótipos podem ir para um `archive/` equivalente.
3. **Deletáveis** — **`archive/` = candidato a exclusão a qualquer momento.** Arquivar é declarar
   "isto não é mais fonte da verdade de nada". Pré-condição única: **a regra já vive na spec/base**.

**A spec não entra neste ciclo** — é a fonte da verdade, nunca arquivada "por limpeza". Arquiva-se o
*meio* (protótipo, plano, review), nunca o *fim* (a spec).

## Não deployar por mudança só-de-doc

Se o projeto tem deploy automático, é sensato **não** deployar quando um commit só tocou
documentação/protótipos/tooling. Isso é um **mecanismo concreto do projeto** (ex.: um *ignored-build
step* versionado) — determinístico, então pertence a um script, não ao julgamento do agente (ver
[automation.md](automation.md)). O projeto declara o quê e como em `docs/project/`.
