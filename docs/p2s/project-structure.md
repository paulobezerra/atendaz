# P2S — Estrutura do Produto (Manifesto)

Este é o **contrato** que o P2S impõe sobre a pasta `docs/project/` de **qualquer** produto. O
framework é agnóstico; este arquivo fixa **quais documentos existem e para quê**, de modo que abrir
o `project/` de um produto P2S seja **previsível e portável** — você sabe o que vai encontrar antes
de abrir. O framework define os **nomes e papéis**; o **conteúdo** é do produto (domínio, stack,
decisões).

> Regra de ouro: `project/base` é a **lei durável** do produto — nunca descartável, nunca por
> feature. `project/spec` é a **fonte da verdade por feature**. `project/plans` é **descartável**
> (ver [ciclo de vida](workflow.md#ciclo-de-vida-dos-artefatos-descartáveis)).

## `project/base/` — a lei durável

Um conjunto **fixo e enxuto** de arquivos. Consolidar aqui (em vez de espalhar em dezenas de docs)
é o que torna a estrutura previsível.

| Arquivo | Papel | O que **é** | O que **não é** |
| :--- | :--- | :--- | :--- |
| `constitution.md` | A **constituição** do produto: os invariantes que não mudam por feature | Modelo de domínio & tenancy, decisões de arquitetura, decisões de stack, guardrails (mapeados para [`quality.md`](quality.md)), postura de privacidade/segurança, o que está **fora de escopo** | Detalhe de uma feature; um tutorial de código |
| `data-model.md` | O **modelo de dados** durável | O schema consolidado, **gerado a partir de um protótipo ER navegável** (ex.: Mermaid `erDiagram`) aprovado no fluxo de spec | Um dump de migrations; DDL de produção |
| `roadmap.md` | A **ordem** das features | Lista de fases/features, marcando as concluídas | Planejamento técnico de uma feature (isso é `plans/`) |
| `environment.md` | As **variáveis de ambiente** por fase | Quais envs cada fase exige e onde configurá-las | Segredos (esses vivem só no ambiente) |
| `design-system.md` | A **fundação de UX** | Tokens, componentes e padrões — **saída do `p2s-design`** | Protótipo de uma tela específica (isso é `templates/prototipos/`) |
| `workflow.md` | O **git flow & ambientes** do projeto | Branches, ambientes reais, promoção (merge/PR), hooks, deploy — o **concreto** que o framework deixa aberto | O fluxo lógico (isso é do P2S, em `docs/p2s/workflow.md`) |

Um produto pode **acrescentar** um doc de base se um domínio realmente exigir, mas o default é
manter este conjunto — quanto mais previsível, mais portável.

### Por que `constitution.md`

Antes, políticas e decisões viviam espalhadas em muitos arquivos numerados, e ninguém sabia onde
procurar. A `constitution` centraliza **tudo que é invariante do produto** num só lugar: é o
primeiro arquivo que um agente (ou humano) lê para entender "as regras deste produto". Ela **mapeia**
para as políticas genéricas do framework em [`quality.md`](quality.md) em vez de **repeti-las** —
a política de qualidade é do P2S; a `constitution` só diz como o produto a encarna.

## `project/spec/` — a fonte da verdade por feature

Uma spec por feature (`F{ID}-{slug}.md`), produzida pelo `p2s-spec`. É **durável** e **nunca
arquivada por limpeza** (é o *fim*, não o *meio*). Carrega os **critérios de aceite como cenários
testáveis** da feature (o *método* é do framework; as instâncias moram aqui).

## `project/plans/` — descartável

Um plano por feature (`{ID}-{slug}.md`), produzido pelo `p2s-plan`. **Descartável**: vai para
`plans/archive/` quando a feature fecha e suas regras já estão consolidadas na spec/base, e
`archive/` é candidato a exclusão a qualquer momento (ver
[ciclo de vida](workflow.md#ciclo-de-vida-dos-artefatos-descartáveis)).

## Protótipos (fora de `docs/`, mas parte do contrato)

- `templates/referencia/` — a **linguagem visual** do produto (saída do `p2s-design`).
- `templates/prototipos/` — protótipos **por tela** de cada feature (`p2s-spec`), incluindo
  `templates/prototipos/api/` para contratos (OpenAPI/API fake). Ambos **descartáveis**.
