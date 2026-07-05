# SSD — Comandos, Portões & Encadeamento

Esta é a estrutura de turnos do jogo. O SSD roda por **cinco comandos prefixados**. Cada um é
uma **fronteira rígida** sobre o que você (o agente) pode mudar, e cada um termina passando o
bastão para o próximo por um **portão humano explícito**. Você executa dentro de um comando; o
humano decide quando ir para o próximo. Nunca funda dois comandos em um por conta própria.

> Ao longo do texto, `{ID}` é o identificador da feature e `{slug}` um nome curto em kebab-case.
> "Tronco" é a branch de produção (comumente `main`/`master`). Nomes concretos de branch,
> ambientes e mecânica de deploy estão em [`workflow.md`](workflow.md).

## O comando como fronteira física

Trate o comando com que você foi invocado como um muro que não pode transpor:

| Comando | Pode mudar | NÃO pode |
| :--- | :--- | :--- |
| `ssd-doc` | Qualquer documentação & spec (incl. protótipos) | Tocar código-fonte |
| `ssd-plan` | Apenas o plano de execução | Escrever/editar/deletar código; rodar testes que mudem estado; corrigir código quebrado que encontrar (registra como débito) |
| `ssd-code` | Código-fonte (única porta de entrada para isso) | Trabalhar fora da branch da feature; mergear no tronco |
| `ssd-test` | Nada (roda testes, reporta) | Alterar estado do git |
| `ssd-done` | O tronco (apenas merge) | Rodar sem prova em produção |

## `ssd-doc {tópico | ID}` — documentação & specs

Governa **toda** a documentação: docs base, arquitetura, modelo de dados, decisões, **e** as
specs por feature (não existe comando "spec" separado — uma spec é documentação). Ao criar/editar
uma spec você deve:

- Alinhá-la às [políticas de qualidade](quality.md) e ao modelo de domínio do produto.
- Incluir uma **seção UX** (fluxos + telas) para qualquer feature com interface, apoiada no design
  system do produto.
- **Prototipar toda tela nova ou substancialmente refeita** e obter aprovação humana
  **explícita** **antes** de a spec ser considerada pronta — o protótipo aprovado é linkado na
  seção UX. A prototipação vive aqui, não no `ssd-plan`/`ssd-code` (ver
  [principles.md](principles.md) §2).

## `ssd-plan {ID}` — o plano de execução

Transforma uma spec **pronta** num plano passo a passo. Você deve:

1. **Portão de DOR primeiro (bloqueante).** Validar o [DOR](#dor--dod) da spec *antes* de planejar
   qualquer coisa. Se a spec tem UI sem protótipo aprovado e linkado — ou tem ambiguidade,
   conflito com guardrail ou necessidades de ambiente indefinidas — **pare imediatamente, não
   gere plano** e devolva ao `ssd-doc` para fechar a lacuna. Nunca planeje sobre um DOR
   incompleto.
2. Criar a branch da feature e, ao final, commitar **apenas** o documento do plano nela. Nunca
   tocar código. Problemas de código que você notar são registrados como **débito técnico no
   plano**, não corrigidos aqui.
3. Produzir: um checklist de tarefas atômicas, os arquivos a criar/modificar, a estratégia de
   testes da feature, um check de ambiente/infraestrutura e uma lista cronológica de **ações
   manuais** que o humano precisa tomar (e exatamente quando).

## `ssd-code {ID}` — implementação

A **única** porta de entrada para mudar código-fonte. Você deve:

1. **Pré-condição de branch (bloqueante).** Rodar apenas na branch da feature. Se estiver no
   tronco ou na branch errada, **pare** e oriente a rodar `ssd-plan {ID}` (que cria a branch).
2. **Revalidar o DOR (bloqueante).** Reconferir spec + protótipo aprovado (para telas) + plano.
   Em **qualquer** inconsistência (spec ambígua/desatualizada, protótipo faltando/divergente,
   plano incoerente com a spec), **não implemente** — devolva ao `ssd-doc` (lacuna de spec/UX) ou
   `ssd-plan` (lacuna de plano). *"Na dúvida, não codar."*
3. Implementar estritamente o que a spec e o plano descrevem — sem comportamento inventado. Seguir
   as [políticas de qualidade](quality.md): testes junto com a mudança, TDD nas áreas críticas,
   cobertura da superfície alterada, build de produção bem-sucedido.
4. Replicar protótipos aprovados **fielmente** para qualquer tela.
5. Um push publica no ambiente de stage; uma suíte de testes local falhando **bloqueia** o push.

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
- **Nunca** disparar o `ssd-done` por conta própria — é decisão do humano, tomada após o portão de
  revisão.

## DOR & DOD

- **DOR (Definition of Ready)** — uma spec está pronta só quando: (1) está completa e sem
  ambiguidade, alinhada às políticas de qualidade e ao modelo de domínio; (2) **toda tela
  nova/refeita tem protótipo aprovado e linkado**; (3) suas necessidades de ambiente/
  infraestrutura estão identificadas. O DOR é **validado como portão de entrada do `ssd-plan`** e
  **revalidado no `ssd-code`**. Qualquer item falho **para o comando** e retorna ao `ssd-doc`.
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
| `ssd-doc` | Ler e **validar a doc**. | `ssd-plan {ID}` — **se** houve alteração de spec que exige (re)planejar. Senão, encerra aqui. |
| `ssd-plan` | **Validar o plano** (tarefas, arquivos, DOR). | `ssd-code {ID}` |
| `ssd-code` | **Testar manualmente** no stage + revisar o diff (portão de revisão humana). | `ssd-test {alvo}` se necessário; e `ssd-done {ID}` para fechar. |
| `ssd-test` | Ler a evidência (verde/vermelho). | Volta ao `ssd-code` (se vermelho) ou segue para `ssd-done` (se o portão humano aprovou). |
| `ssd-done` | — (feature fechada). | Próxima feature na ordem do roadmap, via `ssd-doc` / `ssd-plan`. |

**Pré-condições que você reafirma ao sugerir o próximo comando:** `ssd-plan` exige DOR aprovado
(senão → `ssd-doc`); `ssd-code` exige branch da feature + DOR revalidado (senão para); `ssd-done`
exige um `ssd-code`/`ssd-test` anterior, branch da feature e o "pode ir" explícito do humano.

## O portão de revisão humana (entre `ssd-code` e `ssd-done`)

Depois que o `ssd-code` publica no stage e **antes** de qualquer `ssd-done`, há um **checkpoint
manual e obrigatório do humano**. É onde o trabalho do agente é conferido e o rumo corrigido —
você pode ter implementado a coisa errada, divergido da spec ou "viajado", e é aqui que isso é
pego. Passar nos testes **não** é o mesmo que estar correto. Nunca pule nem antecipe este portão.
