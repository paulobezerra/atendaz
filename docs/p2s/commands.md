# P2S — Comandos, Portões & Encadeamento

Esta é a estrutura de turnos do jogo. O P2S roda por **seis comandos prefixados**. Cada um é uma
**fronteira rígida** sobre o que você (o agente) pode mudar, e cada um termina passando o bastão
para o próximo por um **portão humano explícito**. Você executa dentro de um comando; o humano
decide quando ir para o próximo. Nunca funda dois comandos em um por conta própria.

> Ao longo do texto, `{ID}` é o identificador da feature e `{slug}` um nome curto em kebab-case.
> "Tronco" é a branch de produção (comumente `main`/`master`). Nomes concretos de branch,
> ambientes e mecânica de deploy estão em [`workflow.md`](workflow.md).

## O comando como fronteira física

Trate o comando com que você foi invocado como um muro que não pode transpor:

| Comando | Pode mudar | NÃO pode |
| :--- | :--- | :--- |
| `p2s-doc` | Documentação **base/transversal** (visão, arquitetura, modelo de dados, decisões) | Tocar código; **criar/editar a spec de uma feature ou seus protótipos** |
| `p2s-spec` | A **spec de uma feature** + seus **protótipos navegáveis** (UX, API, dados, integrações) | Tocar código de produção; **editar a documentação base/transversal**; pular a aprovação do protótipo |
| `p2s-plan` | Apenas o plano de execução | Escrever/editar/deletar código; rodar testes que mudem estado; corrigir código quebrado (registra como débito) |
| `p2s-code` | Código-fonte (única porta de entrada para isso) | Trabalhar fora da branch da feature; mergear no tronco |
| `p2s-test` | Nada (roda testes, reporta) | Alterar estado do git |
| `p2s-done` | O tronco (apenas merge) | Rodar sem prova em produção |

### Fronteira dura entre `p2s-doc` e `p2s-spec`

A separação é **bidirecional e sem exceção**: **`p2s-doc` não altera spec, e `p2s-spec` não
altera doc base.** Cada um toca **só o seu artefato** — `p2s-doc` mexe na documentação
base/transversal (nunca numa spec de feature nem em protótipo); `p2s-spec` mexe na spec de uma
feature e seus protótipos (nunca na doc base). Se, trabalhando numa spec, você descobrir uma
lacuna na doc base (ou vice-versa), **pare e passe o bastão** para o outro comando — não
atravesse a fronteira "de passagem".

## `p2s-doc {tópico}` — documentação base & transversal

Governa a documentação que **não** é a spec de uma feature: visão de produto, arquitetura, modelo
de dados, guardrails, design system, decisões e o próprio framework. A spec por feature **saiu**
para o `p2s-spec` (é lá que a prototipação navegável acontece). Commit direto no tronco, sem
deploy.

## `p2s-spec {ID}` — a spec da feature (por prototipação navegável)

O que **diferencia a spec da documentação comum**: a spec **gera prototipação navegável** e a
**spec final emerge da interação** do humano com ela. A regra-mãe é que o humano tem **controle
total do que entra e sai da aplicação, testando tudo via protótipo antes de qualquer código
real** (ver [principles.md](principles.md) §2). Você deve:

1. **Prototipar cada fronteira da feature** (ver [principles.md](principles.md) §2), de forma
   **navegável/interativa** — a IA **propõe**, o humano **testa e aprova**:
   - **UX/UI** — um protótipo estático navegável (HTML/CSS + JS vanilla) de cada tela nova/refeita,
     em `templates/prototipos/{tela}.html`.
   - **Contrato de API** — para cada troca que a feature **expõe ou consome**: uma **doc OpenAPI**
     em `templates/prototipos/api/{feature}.yaml` e/ou uma **API fake executável** (mock server)
     que o humano consegue chamar e ver as requisições/respostas. Outros protocolos: o equivalente
     (gRPC → `.proto` + stub).
   - **Formato dos dados persistidos** — o schema/estrutura no armazenamento (tipos, relações,
     índices, invariantes), previsualizado antes de existir modelo real.
   - **Integrações externas** — o contrato de troca com cada terceiro, sempre contra a doc oficial
     (nunca presumido — [fidelidade a API externa](quality.md#fidelidade-a-api-externa)).
2. **Apresentar e iterar** até a **aprovação explícita** do humano — clicando na tela, chamando o
   endpoint fake. Silêncio não é aprovação.
3. **Registrar a spec** como o resultado do que foi aprovado — **todo protótipo aprovado vira
   spec**: fluxos, telas, **contratos de API**, **formato dos dados** e integrações (schemas de
   entrada/saída), com **links** para os protótipos versionados em `templates/…`. Alinhar aos
   guardrails/[políticas de qualidade](quality.md) e ao modelo de domínio.
4. Commit no tronco (spec + protótipos), **sem deploy**. Não cria branch — a branch é do
   `p2s-plan`.

**Baixo custo, descartável (regra dura).** O protótipo é barato e **descartável** — não gaste
tempo/tokens buscando perfeição, e **jamais** o reaproveite como código de produção. Ele deve ser
realista o bastante para dar uma **impressão nítida** do resultado final, e nada além disso (ver
[principles.md](principles.md) §2).

**Quando recomendar NÃO prototipar.** Se um protótipo barato não consegue dar essa impressão
nítida (um protótipo fiel custaria quase o mesmo que o código real, ou a fronteira não tem
superfície que valha previsualizar), **recomende explicitamente não prototipar** e **grave essa
decisão, com justificativa, no DOR da spec**. Isso torna a ausência de protótipo uma escolha
consciente e aprovada pelo humano — não uma lacuna.

Uma feature sem protótipo navegável aprovado de **cada fronteira que ela toca** (UX, API, dados
persistidos, integrações — conforme o caso) **— e sem essa justificativa registrada no DOR —**
**não passa no DOR** e não pode ir ao `p2s-plan`.

## `p2s-plan {ID}` — o plano de execução

Transforma uma spec **pronta** num plano passo a passo. Você deve:

1. **Portão de DOR primeiro (bloqueante).** Validar o [DOR](#dor--dod) da spec *antes* de planejar
   qualquer coisa. Se a feature tem alguma fronteira (UX, API, dados, integrações) sem protótipo navegável aprovado e
   linkado — ou tem ambiguidade, conflito com guardrail ou necessidades de ambiente indefinidas —
   **pare imediatamente, não gere plano** e devolva ao `p2s-spec` (lacuna de protótipo/spec) ou
   `p2s-doc` (lacuna de doc base). Nunca planeje sobre um DOR incompleto.
2. Criar a branch da feature e, ao final, commitar **apenas** o documento do plano nela. Nunca
   tocar código. Problemas de código que você notar viram **débito técnico no plano**.
3. Produzir: checklist de tarefas atômicas, arquivos a criar/modificar, estratégia de testes da
   feature, check de ambiente/infraestrutura e uma lista cronológica de **ações manuais** que o
   humano precisa tomar (e exatamente quando).

## `p2s-code {ID}` — implementação

A **única** porta de entrada para mudar código-fonte. Você deve:

1. **Pré-condição de branch (bloqueante).** Rodar apenas na branch da feature. Se estiver no
   tronco ou na branch errada, **pare** e oriente a rodar `p2s-plan {ID}` (que cria a branch).
2. **Revalidar o DOR (bloqueante).** Reconferir spec + protótipos aprovados (de cada fronteira: UX,
   API, dados, integrações) + plano. Em **qualquer** inconsistência (spec ambígua/desatualizada, protótipo
   faltando/divergente, plano incoerente), **não implemente** — devolva ao `p2s-spec` (lacuna de
   spec/protótipo) ou `p2s-plan` (lacuna de plano). *"Na dúvida, não codar."*
3. Implementar estritamente o que a spec e o plano descrevem — sem comportamento inventado.
   Replicar **fielmente** os protótipos: as telas e **os contratos de dados** (a API real deve
   casar com o OpenAPI/API fake aprovado). Seguir as [políticas de qualidade](quality.md): testes
   junto com a mudança, TDD nas áreas críticas, cobertura da superfície alterada, build de
   produção bem-sucedido.
4. Um push publica no ambiente de stage; uma suíte de testes local falhando **bloqueia** o push.

## `p2s-test {local | stage | prod}` — evidência

A **única** porta de entrada para execuções de teste. Reporta resultados como evidência para o
DOD. "Verde" só é evidência válida **se** as camadas certas cobrirem a **superfície alterada**
(ver [política de testes](quality.md#política-de-testes)); um verde que não exercita o que mudou é
um portão incompleto, reportado como lacuna — não uma aprovação.

## `p2s-done {ID}` — fechar a feature

O **único** comando que altera o tronco, e uma **decisão exclusivamente humana**. Você deve:

- Exigir verde em `local` **e** `stage`, então mergear a feature no tronco (preservando a branch)
  e validar com `p2s-test prod`.
- **Só se produção passar**: marcar a spec e o roadmap como concluídos e arquivar o plano. Se
  produção falhar, a feature **não** está pronta — voltar ao ciclo de correção na mesma branch.
- **Nunca** disparar o `p2s-done` por conta própria — é decisão do humano, após o portão de
  revisão.

## DOR & DOD

- **DOR (Definition of Ready)** — uma spec está pronta só quando: (1) foi produzida no `p2s-spec`,
  está completa e sem ambiguidade, alinhada às políticas de qualidade e ao modelo de domínio;
  (2) **toda fronteira nova/refeita (tela, contrato de API, formato de dados, integração)** tem
  **protótipo navegável aprovado e linkado** — **ou** uma **justificativa registrada no DOR** de que prototipar não agregaria
  (baixo valor / não daria impressão nítida a baixo custo); (3) suas necessidades de
  ambiente/infraestrutura estão identificadas. O DOR é
  **validado como portão de entrada do `p2s-plan`** e **revalidado no `p2s-code`**. Qualquer item
  falho **para o comando** e retorna ao `p2s-spec`/`p2s-doc`.
- **DOD (Definition of Done)** — uma feature está pronta só após verificada **em produção**,
  comprovada por evidência (logs de sucesso, um print, ou smoke/E2E automatizado contra produção).

## Encadeamento de comandos

O fluxo é uma **cadeia de portões**, cada um com um passo humano no meio. Ao **terminar qualquer
comando**, feche de forma **factual e prescritiva** — nunca com hype ou autoelogio.

**Proibido no fechamento** — declarar a feature "pronta/entregue" por conta própria, ou anunciar
o próximo trabalho como se já estivesse autorizado. **Não** diga coisas como *"Pronto, feature X
entregue!"* ou *"Tudo certo, seguindo para implementar a tela Y."* O humano decide avançar; você
não presume aprovação nem emenda um comando no outro sozinho.

**Obrigatório no fechamento** — encerre com estes três blocos, nesta ordem:

1. **O que foi feito** — factual, sem adjetivo de sucesso ("implementei X", não "entreguei X com
   sucesso"). Declare qualquer desvio/decisão.
2. **O que o humano precisa validar/decidir agora** — a ação humana deste portão.
3. **Próximo comando** — o comando exato a rodar *depois* da validação (ou "aguardando sua
   revisão" quando o próximo passo é 100% humano). **Um** próximo comando, não um roteiro inteiro.

### Próximo passo canônico por comando

| Terminou | Passo humano | Próximo comando |
| :--- | :--- | :--- |
| `p2s-doc` | Ler e **validar a doc base**. | `p2s-spec {ID}` (ao iniciar uma feature) — ou encerra aqui. |
| `p2s-spec` | **Interagir com o protótipo** (tela + API fake) e **aprovar a spec**. | `p2s-plan {ID}` |
| `p2s-plan` | **Validar o plano** (tarefas, arquivos, DOR). | `p2s-code {ID}` |
| `p2s-code` | **Testar manualmente** no stage + revisar o diff (portão de revisão humana). | `p2s-test {alvo}` se necessário; e `p2s-done {ID}` para fechar. |
| `p2s-test` | Ler a evidência (verde/vermelho). | Volta ao `p2s-code` (se vermelho) ou segue para `p2s-done` (se o portão humano aprovou). |
| `p2s-done` | — (feature fechada). | Próxima feature na ordem do roadmap, via `p2s-doc` / `p2s-spec`. |

**Pré-condições que você reafirma ao sugerir o próximo comando:** `p2s-plan` exige DOR aprovado
(spec + protótipo navegável de cada fronteira; senão → `p2s-spec`); `p2s-code` exige
branch da feature + DOR revalidado (senão para); `p2s-done` exige um `p2s-code`/`p2s-test`
anterior, branch da feature e o "pode ir" explícito do humano.

## O portão de revisão humana (entre `p2s-code` e `p2s-done`)

Depois que o `p2s-code` publica no stage e **antes** de qualquer `p2s-done`, há um **checkpoint
manual e obrigatório do humano**. É onde o trabalho do agente é conferido e o rumo corrigido —
você pode ter implementado a coisa errada, divergido da spec/contrato ou "viajado", e é aqui que
isso é pego. Passar nos testes **não** é o mesmo que estar correto. Nunca pule nem antecipe este
portão.
