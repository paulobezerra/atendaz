# SSD — Comandos, Portões & Encadeamento

Esta é a estrutura de turnos do jogo. O SSD roda por **seis comandos prefixados**. Cada um é uma
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
| `ssd-doc` | Documentação **base/transversal** (visão, arquitetura, modelo de dados, decisões) | Tocar código; criar/editar a spec de uma feature |
| `ssd-spec` | A **spec de uma feature** + seus **protótipos navegáveis** (UI + contrato de dados) | Tocar código de produção; pular a aprovação do protótipo |
| `ssd-plan` | Apenas o plano de execução | Escrever/editar/deletar código; rodar testes que mudem estado; corrigir código quebrado (registra como débito) |
| `ssd-code` | Código-fonte (única porta de entrada para isso) | Trabalhar fora da branch da feature; mergear no tronco |
| `ssd-test` | Nada (roda testes, reporta) | Alterar estado do git |
| `ssd-done` | O tronco (apenas merge) | Rodar sem prova em produção |

## `ssd-doc {tópico}` — documentação base & transversal

Governa a documentação que **não** é a spec de uma feature: visão de produto, arquitetura, modelo
de dados, guardrails, design system, decisões e o próprio framework. A spec por feature **saiu**
para o `ssd-spec` (é lá que a prototipação navegável acontece). Commit direto no tronco, sem
deploy.

## `ssd-spec {ID}` — a spec da feature (por prototipação navegável)

O que **diferencia a spec da documentação comum**: a spec **gera prototipação navegável** e a
**spec final emerge da interação** do humano com ela. A regra-mãe é que o humano tem **controle
total do que entra e sai da aplicação, testando tudo via protótipo antes de qualquer código
real** (ver [principles.md](principles.md) §2). Você deve:

1. **Prototipar as duas fronteiras da feature**, de forma **navegável/interativa**:
   - **UI** — um protótipo estático navegável (HTML/CSS + JS vanilla) de cada tela nova/refeita.
   - **Contrato de dados** — para cada troca que a feature **expõe ou consome**: uma **doc
     OpenAPI** e/ou uma **API fake executável** (mock server) que o humano consegue chamar e ver
     as requisições/respostas. Para outros protocolos, o equivalente (gRPC → `.proto` + stub).
2. **Apresentar e iterar** até a **aprovação explícita** do humano — clicando na tela, chamando o
   endpoint fake. Silêncio não é aprovação.
3. **Registrar a spec** como o resultado do que foi aprovado: fluxos, telas e **contratos de
   dados** (schemas de entrada/saída), com **links** para os protótipos versionados em
   `templates/…`. Alinhar aos guardrails/[políticas de qualidade](quality.md) e ao modelo de
   domínio.
4. Commit no tronco (spec + protótipos), **sem deploy**. Não cria branch — a branch é do
   `ssd-plan`.

Uma feature sem esse protótipo navegável aprovado (UI **e** contrato de dados, conforme a feature)
**não passa no DOR** e não pode ir ao `ssd-plan`.

## `ssd-plan {ID}` — o plano de execução

Transforma uma spec **pronta** num plano passo a passo. Você deve:

1. **Portão de DOR primeiro (bloqueante).** Validar o [DOR](#dor--dod) da spec *antes* de planejar
   qualquer coisa. Se a feature tem UI e/ou contrato de dados sem protótipo navegável aprovado e
   linkado — ou tem ambiguidade, conflito com guardrail ou necessidades de ambiente indefinidas —
   **pare imediatamente, não gere plano** e devolva ao `ssd-spec` (lacuna de protótipo/spec) ou
   `ssd-doc` (lacuna de doc base). Nunca planeje sobre um DOR incompleto.
2. Criar a branch da feature e, ao final, commitar **apenas** o documento do plano nela. Nunca
   tocar código. Problemas de código que você notar viram **débito técnico no plano**.
3. Produzir: checklist de tarefas atômicas, arquivos a criar/modificar, estratégia de testes da
   feature, check de ambiente/infraestrutura e uma lista cronológica de **ações manuais** que o
   humano precisa tomar (e exatamente quando).

## `ssd-code {ID}` — implementação

A **única** porta de entrada para mudar código-fonte. Você deve:

1. **Pré-condição de branch (bloqueante).** Rodar apenas na branch da feature. Se estiver no
   tronco ou na branch errada, **pare** e oriente a rodar `ssd-plan {ID}` (que cria a branch).
2. **Revalidar o DOR (bloqueante).** Reconferir spec + protótipos aprovados (UI **e** contrato de
   dados) + plano. Em **qualquer** inconsistência (spec ambígua/desatualizada, protótipo
   faltando/divergente, plano incoerente), **não implemente** — devolva ao `ssd-spec` (lacuna de
   spec/protótipo) ou `ssd-plan` (lacuna de plano). *"Na dúvida, não codar."*
3. Implementar estritamente o que a spec e o plano descrevem — sem comportamento inventado.
   Replicar **fielmente** os protótipos: as telas e **os contratos de dados** (a API real deve
   casar com o OpenAPI/API fake aprovado). Seguir as [políticas de qualidade](quality.md): testes
   junto com a mudança, TDD nas áreas críticas, cobertura da superfície alterada, build de
   produção bem-sucedido.
4. Um push publica no ambiente de stage; uma suíte de testes local falhando **bloqueia** o push.

## `ssd-test {local | stage | prod}` — evidência

A **única** porta de entrada para execuções de teste. Reporta resultados como evidência para o
DOD. "Verde" só é evidência válida **se** as camadas certas cobrirem a **superfície alterada**
(ver [política de testes](quality.md#política-de-testes)); um verde que não exercita o que mudou é
um portão incompleto, reportado como lacuna — não uma aprovação.

## `ssd-done {ID}` — fechar a feature

O **único** comando que altera o tronco, e uma **decisão exclusivamente humana**. Você deve:

- Exigir verde em `local` **e** `stage`, então mergear a feature no tronco (preservando a branch)
  e validar com `ssd-test prod`.
- **Só se produção passar**: marcar a spec e o roadmap como concluídos e arquivar o plano. Se
  produção falhar, a feature **não** está pronta — voltar ao ciclo de correção na mesma branch.
- **Nunca** disparar o `ssd-done` por conta própria — é decisão do humano, após o portão de
  revisão.

## DOR & DOD

- **DOR (Definition of Ready)** — uma spec está pronta só quando: (1) foi produzida no `ssd-spec`,
  está completa e sem ambiguidade, alinhada às políticas de qualidade e ao modelo de domínio;
  (2) **toda tela nova/refeita e todo contrato de dados** têm **protótipo navegável aprovado e
  linkado**; (3) suas necessidades de ambiente/infraestrutura estão identificadas. O DOR é
  **validado como portão de entrada do `ssd-plan`** e **revalidado no `ssd-code`**. Qualquer item
  falho **para o comando** e retorna ao `ssd-spec`/`ssd-doc`.
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
| `ssd-doc` | Ler e **validar a doc base**. | `ssd-spec {ID}` (ao iniciar uma feature) — ou encerra aqui. |
| `ssd-spec` | **Interagir com o protótipo** (tela + API fake) e **aprovar a spec**. | `ssd-plan {ID}` |
| `ssd-plan` | **Validar o plano** (tarefas, arquivos, DOR). | `ssd-code {ID}` |
| `ssd-code` | **Testar manualmente** no stage + revisar o diff (portão de revisão humana). | `ssd-test {alvo}` se necessário; e `ssd-done {ID}` para fechar. |
| `ssd-test` | Ler a evidência (verde/vermelho). | Volta ao `ssd-code` (se vermelho) ou segue para `ssd-done` (se o portão humano aprovou). |
| `ssd-done` | — (feature fechada). | Próxima feature na ordem do roadmap, via `ssd-doc` / `ssd-spec`. |

**Pré-condições que você reafirma ao sugerir o próximo comando:** `ssd-plan` exige DOR aprovado
(spec + protótipo navegável de UI e contrato de dados; senão → `ssd-spec`); `ssd-code` exige
branch da feature + DOR revalidado (senão para); `ssd-done` exige um `ssd-code`/`ssd-test`
anterior, branch da feature e o "pode ir" explícito do humano.

## O portão de revisão humana (entre `ssd-code` e `ssd-done`)

Depois que o `ssd-code` publica no stage e **antes** de qualquer `ssd-done`, há um **checkpoint
manual e obrigatório do humano**. É onde o trabalho do agente é conferido e o rumo corrigido —
você pode ter implementado a coisa errada, divergido da spec/contrato ou "viajado", e é aqui que
isso é pego. Passar nos testes **não** é o mesmo que estar correto. Nunca pule nem antecipe este
portão.
