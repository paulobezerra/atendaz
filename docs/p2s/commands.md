# P2S — Comandos, Portões & Encadeamento

Esta é a estrutura de turnos do jogo. O P2S roda por **oito comandos prefixados**, em duas fases.
Cada comando é uma **fronteira rígida** sobre o que você (o agente) pode mudar, e cada um termina
passando o bastão por um **portão humano explícito**. Você executa dentro de um comando; o humano
decide quando avançar. Nunca funda dois comandos em um por conta própria.

- **Upstream — partida & manutenção** (re-executáveis ao longo do projeto): `p2s-discovery`
  (produto → constitution + roadmap) · `p2s-design` (linguagem visual/UX).
- **Transversal:** `p2s-doc` (docs ↔ realidade: engenharia reversa e reconciliação).
- **Downstream — por feature** (o loop): `p2s-spec` → `p2s-plan` → `p2s-code` → `p2s-review` →
  `p2s-done`.

Antes dos oito, há um **bootstrap** (`p2s-install`) que liga o P2S a um agente — ver
[`install.md`](install.md). Ele não é um comando do fluxo; prepara os adaptadores finos do agente.

> `{ID}` é o identificador da feature e `{slug}` um nome curto em kebab-case.

## Agnóstico de git flow (regra estrutural)

O P2S define o **fluxo lógico** — fases, portões (DOR/DOD), o que é durável vs descartável, ordem.
Ele **não** prescreve mecânica de git: **quando ramificar, trunk-based vs git-flow, merge local vs
PR, quem promove** é decisão do **projeto**, declarada em `docs/project/` (ver
[`workflow.md`](workflow.md)). Consequências duras:

- **A IA nunca muta o tronco por conta própria.** Num contexto corporativo, a promoção é um **PR**
  (Azure DevOps/GitHub) revisado por outros; num solo, pode ser um merge local. O agente **prepara**
  a mudança; **humano/automação promovem**, conforme o git flow do projeto.
- Comandos falam de "publicar", "promover", "fechar" em termos **lógicos**; o mapeamento para
  branch/PR/deploy concretos é do projeto.

## O comando como fronteira física

Trate o comando com que você foi invocado como um muro que não pode transpor:

| Comando | Pode mudar | NÃO pode |
| :--- | :--- | :--- |
| `p2s-discovery` | **constitution** + **roadmap** (domínio, regras, ordem das features) | Tocar código; fazer design; especificar/prototipar uma feature |
| `p2s-design` | A **linguagem visual/UX** — `templates/referencia/` + `design-system` | Tocar código; descoberta de produto; prototipar telas de feature (é do `p2s-spec`) |
| `p2s-doc` | Base docs por **reconciliação/engenharia reversa** (realidade → doc) | Fazer discovery/design/spec; inventar comportamento novo (só reflete o que já é) |
| `p2s-spec` | A **spec de uma feature** + seus **protótipos navegáveis** (UX, API, dados, integrações) | Tocar código; editar base docs; pular a aprovação do protótipo |
| `p2s-plan` | Apenas o plano de execução | Escrever/editar/deletar código; ramificar por conta própria (é do git flow do projeto) |
| `p2s-code` | Código-fonte (única porta de entrada) | Promover/mergear; agir fora do fluxo de branch do projeto |
| `p2s-review` | Nada (roda o script de testes, revisa, reporta achados) | Alterar estado do git; "aprovar" no lugar do humano |
| `p2s-done` | Fecha a feature **logicamente** (arquiva, marca concluído) | Mergear no tronco por conta própria; exigir um ambiente que o projeto não definiu |

### Fronteiras duras entre os comandos de doc

- **`p2s-discovery` × `p2s-doc`:** discovery é **intenção → doc** ("decidimos X"); doc é **realidade
  → doc** ("o código faz Y, a doc precisa refletir"). Direções opostas — não se sobrepõem.
- **doc/discovery/design × `p2s-spec`:** os primeiros mexem em base docs; `p2s-spec` mexe **só** na
  spec de uma feature e seus protótipos — nunca na base, e vice-versa. Se, trabalhando num, você
  descobre lacuna no outro, **pare e passe o bastão** — não atravesse "de passagem".

## `p2s-discovery` — descoberta de produto (constitution + roadmap)

O ponto de **partida** de um projeto (e re-executável depois). De forma **interativa**, descobre
com o humano **o que é o produto, sob quais regras e em que ordem construir** — e materializa isso
em dois artefatos duráveis:

1. **constitution** (`docs/project/base/constitution.md`) — domínio & tenancy, arquitetura, stack,
   guardrails (mapeados para [`quality.md`](quality.md)), escopo. A "lei" do produto.
2. **roadmap** (`docs/project/base/roadmap.md`) — as features em ordem.

**Re-executável:** roda de novo ao longo da vida do projeto para **crescer o roadmap** ou **evoluir
regras** (uma decisão nova de produto). Não toca código, design nem spec de feature.

## `p2s-design` — a linguagem visual & UX

Estabelece (e mantém) a **fundação visual** que todas as features seguem — feita para ser reusada,
não refeita por feature. É a resposta à lição mais cara do método: **definir UX direto no código,
ou a partir de ASCII, faz perder ciclos inteiros** até o humano *ver* e dizer "não é isso". O design
move essa decisão para **antes**, num protótipo navegável barato.

O que o diferencia do `p2s-spec`: **`p2s-design` olha para `templates/referencia/`** (a "cara" fixa
do produto — tokens, componentes, telas-âncora); **`p2s-spec` olha para `templates/prototipos/`**
(as telas **de cada feature**, construídas *sobre* essa referência). Design define a linguagem; spec
a aplica. De forma **interativa**:

1. **Receber referências** do humano — **links** (inspiração) e **imagens** (prints, mockups, marca).
2. **Produzir um protótipo navegável** da linguagem visual em `templates/referencia/` (HTML/CSS + JS
   vanilla): telas-âncora, tokens e componentes-base. **Barato e descartável** (pilar 2).
3. **Iterar até a aprovação explícita.**
4. **Consolidar** no `design-system` do produto. **Re-executável** para manutenção/evolução visual.

Uma feature não deveria ir ao `p2s-spec` sem uma referência visual aprovada — senão cada spec
reinventa a aparência e o gate de revisão vira loteria.

## `p2s-doc {tópico}` — docs ↔ realidade (reconciliação & engenharia reversa)

Governa os base docs **não** cobertos por discovery/design — mantendo-os fiéis à **realidade**.
Direção: **realidade → doc** (nunca decide comportamento novo; isso é discovery/spec). Dois usos:

- **Engenharia reversa (brownfield).** Analisar um código **já existente** e extrair/backfillar os
  base docs — o **on-ramp do P2S para projetos que já existem** (o resto do framework nasce
  greenfield; isto adota o método num projeto vivo).
- **Reconciliação pós-implementação.** Depois que uma feature sobe, sincronizar os base docs
  **duráveis** que emergem do build — `data-model`, `environment`, decisões de arquitetura — com o
  que foi realmente construído.

**Fronteira dura:** `doc` **nunca** faz descoberta de produto (`p2s-discovery`), design
(`p2s-design`) nem spec de feature (`p2s-spec`).

## `p2s-spec {ID}` — a spec da feature (por prototipação navegável)

O que **diferencia a spec da documentação comum**: a spec **gera prototipação navegável** e a
**spec final emerge da interação** do humano com ela. A regra-mãe é que o humano tem **controle
total do que entra e sai da aplicação, testando tudo via protótipo antes de qualquer código real**
(ver [principles.md](principles.md) §2). Você deve:

1. **Prototipar cada fronteira da feature** (ver [principles.md](principles.md) §2), de forma
   **navegável/interativa** — a IA **propõe**, o humano **testa e aprova**:
   - **UX/UI** — protótipo estático navegável (HTML/CSS + JS vanilla) de cada tela nova/refeita, em
     `templates/prototipos/{tela}.html`, **seguindo a linguagem visual do `p2s-design`**
     (`templates/referencia/`) — não reinvente a aparência aqui.
   - **Contrato de API** — para cada troca que a feature expõe ou consome: **doc OpenAPI** em
     `templates/prototipos/api/{feature}.yaml`, um **viewer navegável** (`{feature}.html`, ex.: Redoc)
     **e** uma **API fake EXECUTÁVEL** — um mock que o humano **chama de verdade** e vê os
     status/corpos (ex.: `npx @stoplight/prism-cli mock {feature}.yaml`). Um `.yaml` cru, ou só o
     viewer, **não** cumpre o "navegável": o humano tem de conseguir **invocar** e receber
     200/400/404 com exemplos. **Valide o artefato antes de servir** (o YAML tem de parsear, senão o
     viewer quebra). Outros protocolos: o equivalente (gRPC → `.proto` + stub executável).
   - **Formato dos dados persistidos** — o schema previsualizado como **diagrama ER navegável** (ex.:
     Mermaid `erDiagram`) antes de existir modelo real. **Informe explicitamente** o que **já existe**
     (leia os models/tabelas reais) vs o que a feature **cria/altera** — o humano precisa saber o
     delta, não adivinhar.
   - **Integrações externas** — o contrato com cada terceiro, contra a doc oficial (nunca presumido —
     [fidelidade a API externa](quality.md#fidelidade-a-api-externa)).
2. **Validar UMA fronteira por vez.** Apresente e itere **cada** fronteira (ordem natural: dados →
   API → UX → integração) e **espere o "ok" explícito de cada uma** antes de passar à próxima.
   **Nunca empacote** tudo numa aprovação só — um "ok" a um item **não** é aprovação do resto (foi
   assim que uma spec passou com o protótipo de API quebrado). Silêncio não é aprovação; dê ao humano
   **tempo e oportunidade de validar cada ponto**.
3. **Registrar a spec** como o resultado do que foi aprovado — **todo protótipo aprovado vira spec**:
   fluxos, telas, contratos de API, formato dos dados e integrações, com **links** para os protótipos
   versionados em `templates/…`. Alinhar aos [guardrails/qualidade](quality.md) e ao modelo de domínio.

**Baixo custo, descartável (regra dura).** O protótipo é barato e **descartável** — não busque
perfeição, e **jamais** o reaproveite como código de produção. Realista o bastante para dar uma
**impressão nítida**, e nada além (ver [principles.md](principles.md) §2).

**Quando recomendar NÃO prototipar.** Se um protótipo barato não dá essa impressão nítida (um fiel
custaria quase o mesmo que o código, ou a fronteira não tem superfície que valha previsualizar),
**recomende explicitamente não prototipar** e **grave a decisão, com justificativa, no DOR da spec**.

Uma feature sem protótipo navegável aprovado de **cada fronteira que ela toca** (UX, API, dados,
integrações) **— e sem essa justificativa no DOR —** **não passa no DOR** e não vai ao `p2s-plan`.

## `p2s-plan {ID}` — o plano de execução

Transforma uma spec **pronta** num plano passo a passo. Você deve:

1. **Portão de DOR primeiro (bloqueante).** Validar o [DOR](#dor--dod) *antes* de planejar. Se há
   fronteira sem protótipo aprovado, ambiguidade, conflito com guardrail ou ambiente indefinido —
   **pare, não gere plano** e devolva ao `p2s-spec`/`p2s-discovery`.
2. Produzir **apenas o plano** (nunca tocar código; problemas de código viram **débito** no plano).
   **Não ramifique por conta própria** — quando/se abrir branch é o git flow do projeto
   ([`workflow.md`](workflow.md)); você registra o plano onde o fluxo do projeto manda.
3. O plano entrega:
   - **Cenários testáveis (BDD, `Given/When/Then`)** derivados da spec — guiam o TDD do `p2s-code`
     (cada cenário vira teste **antes** do código). Raciocine em *comportamento verificável*.
   - **Inventário de código: o que será criado, alterado e excluído** — para o humano ver o impacto
     antes de qualquer linha.
   - Estratégia de testes por camada (ver [política de testes](quality.md#política-de-testes)), check
     de ambiente/infra e uma lista cronológica de **ações manuais** do humano (e quando).
   Não repita princípios/qualidade — **referencie**. O plano é *o que muda e como se prova*.

## `p2s-code {ID}` — implementação

A **única** porta de entrada para mudar código-fonte. Você deve:

1. **Revalidar o DOR (bloqueante).** Reconferir spec + protótipos aprovados + plano. Em **qualquer**
   inconsistência, **não implemente** — devolva ao `p2s-spec`/`p2s-plan`. *"Na dúvida, não codar."*
2. **Trabalhar dentro do git flow do projeto** ([`workflow.md`](workflow.md)) — na branch/fluxo que o
   projeto define. Não promova nem mergeie por conta própria.
3. Implementar **estritamente** o que spec e plano descrevem — sem comportamento inventado. Replicar
   **fielmente** os protótipos (a API real casa com o OpenAPI/API fake aprovado). Seguir as
   [políticas de qualidade](quality.md): testes junto com a mudança, **TDD nas áreas críticas**,
   cobertura da superfície alterada, build de produção bem-sucedido.

## `p2s-review {ID}` — QA da feature (testes + revisão holística)

O portão de qualidade antes do fechamento. Você deve:

1. **Rodar o script de testes** e **ler o veredito** — rodar a suíte é trabalho **determinístico**,
   é do script/hook (pilar de apoio — [automation.md](automation.md)), **não** seu para reimplementar
   à mão. "Verde" só vale se as camadas certas cobrem a **superfície alterada**
   ([política de testes](quality.md#política-de-testes)).
2. **Revisar a consistência holística** — comparar **spec × plano × código × doc × framework** e
   pegar **o que fugiu do previsto** para a feature (comportamento a mais, desvio de contrato,
   guardrail arranhado, doc desatualizada).
3. **Reportar achados classificados por severidade** — **bloqueante / major / medium / minor** — com
   a decisão **corrigir agora ou postergar**: bloqueante **trava** o `p2s-done`; o resto pode virar
   **débito registrado** (na spec/plano) por escolha do humano.
4. Você **não aprova no lugar do humano** — reporta evidência e achados; a aprovação é do portão de
   revisão humana. A **validação de ambiente** exigida é a **definida pelo projeto**
   ([`workflow.md`](workflow.md)), não uma fixa.
5. **Registrar o review num `.md`** — evidência, achados por severidade e desfecho ficam num
   documento versionado (ex.: `docs/project/reviews/{ID}-*.md`), para o **histórico**. É um
   **artefato descartável** (mesmo ciclo de vida de plano/protótipo — arquivável após o `p2s-done`,
   podendo ser descartado; ver [ciclo de vida](workflow.md#ciclo-de-vida-dos-artefatos-descartáveis)).

## `p2s-done {ID}` — fechar a feature

Fecha a feature **logicamente** — e é uma **decisão exclusivamente humana**. Você deve:

- **Só com o `p2s-review` sem bloqueantes** e com a **validação definida pelo projeto** passando:
  **arquivar** o plano e os protótipos (ver [ciclo de vida](workflow.md#ciclo-de-vida-dos-artefatos-descartáveis))
  e **marcar spec/roadmap como concluídos**.
- **Entregar a promoção ao git flow do projeto** — abrir o PR, ou sinalizar que o humano/CI promove
  (merge/deploy). **A IA nunca mergeia no tronco por conta própria.**
- **Nunca** disparar o `p2s-done` sozinho — é decisão do humano, após o portão de revisão.

## DOR & DOD

- **DOR (Definition of Ready)** — uma spec está pronta só quando: (1) foi produzida no `p2s-spec`,
  completa e sem ambiguidade, alinhada a qualidade e ao domínio; (2) **toda fronteira nova/refeita**
  (tela, contrato de API, formato de dados, integração) tem **protótipo navegável aprovado e
  linkado** — **ou** justificativa registrada de não prototipar; (3) suas necessidades de ambiente
  estão identificadas. Validado no `p2s-plan` e revalidado no `p2s-code`; item falho **para o
  comando**.
- **DOD (Definition of Done)** — **agnóstico de ambiente**: a feature está pronta quando o
  `p2s-review` não tem bloqueantes **e** a **validação definida pelo projeto** passou. Essa validação
  é **escolha do projeto** (`docs/project/base/workflow.md`) — pode ser produção (quando há), ou
  QA/homologação, ou stage — comprovada por evidência. O P2S **não** hardcoda "verificado em produção".

## Encadeamento de comandos

O fluxo é uma **cadeia de portões**, cada um com um passo humano no meio. Ao **terminar qualquer
comando**, feche de forma **factual e prescritiva** — nunca com hype ou autoelogio.

**Proibido no fechamento** — declarar a feature "pronta/entregue" por conta própria, ou anunciar o
próximo trabalho como se já autorizado. **Não** diga *"Pronto, feature X entregue!"*. O humano decide
avançar.

**Obrigatório no fechamento** — encerre com três blocos: (1) **o que foi feito** (factual, sem
adjetivo de sucesso), (2) **o que o humano precisa validar/decidir agora**, (3) **próximo comando**
(um só, ou "aguardando sua revisão").

### Próximo passo canônico por comando

| Terminou | Passo humano | Próximo comando |
| :--- | :--- | :--- |
| `p2s-discovery` | **Validar constitution + roadmap.** | `p2s-design` (se falta linguagem visual) / `p2s-spec {ID}` (1ª feature do roadmap). |
| `p2s-design` | **Navegar a referência** e **aprovar a linguagem/UX**. | `p2s-spec {ID}` |
| `p2s-doc` | Ler e **validar a reconciliação/reverse-eng**. | Retoma o loop de onde estava. |
| `p2s-spec` | **Interagir com o protótipo** e **aprovar a spec**. | `p2s-plan {ID}` |
| `p2s-plan` | **Validar o plano** (cenários BDD, inventário, DOR). | `p2s-code {ID}` |
| `p2s-code` | **Testar no ambiente do projeto** + revisar o diff (portão humano). | `p2s-review {ID}` |
| `p2s-review` | Ler evidência + achados; decidir corrigir/postergar. | Volta ao `p2s-code` (se bloqueante) ou `p2s-done {ID}` (se o humano aprovou). |
| `p2s-done` | — (feature fechada; promoção segue o git flow do projeto). | Próxima feature do roadmap, via `p2s-spec` (ou `p2s-discovery` para crescer o roadmap). |

**Pré-condições que você reafirma:** `p2s-plan` exige DOR aprovado (senão → `p2s-spec`); `p2s-code`
exige DOR revalidado; `p2s-done` exige `p2s-review` sem bloqueantes, validação do projeto verde e o
"pode ir" explícito do humano.

## O portão de revisão humana (entre `p2s-review` e `p2s-done`)

Depois do `p2s-review` e **antes** de qualquer `p2s-done`, há um **checkpoint manual e obrigatório
do humano**. É onde o trabalho do agente é conferido e o rumo corrigido — você pode ter implementado
a coisa errada, divergido da spec/contrato ou "viajado". Passar nos testes **não** é o mesmo que
estar correto. Nunca pule nem antecipe este portão.
