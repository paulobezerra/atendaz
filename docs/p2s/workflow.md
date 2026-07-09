# P2S — Branches, Ambientes & Deploy

Este é o tabuleiro onde o jogo acontece. A mecânica abaixo é **parametrizável**: o P2S fixa o
*formato* (um tronco, uma branch por feature, três ambientes, deploy dirigido por eventos de
git), e cada produto preenche o host e os comandos concretos em `docs/project/`.

## Branches

- **Tronco** (`main`/`master`) — a branch de **produção**. Alterada **apenas** pelo `p2s-done`
  (o merge da feature). Deve permanecer sempre verde e deployável.
- **`feature/{ID}-{slug}`** — uma por feature. **Criada pelo `p2s-plan`**, **mergeada pelo
  `p2s-done`**, e **nunca deletada** (preserva o histórico/auditoria da feature).

## Ambientes

Três ambientes, cada um respondendo a uma pergunta diferente:

| Ambiente | Pergunta que responde | Alimentado por |
| :--- | :--- | :--- |
| **local** | A lógica se sustenta isolada? | A suíte de testes contra dependências em memória/mockadas |
| **stage** | A feature deployada se comporta? | Um deploy de **preview**, gerado a cada push na branch da feature |
| **prod** | Está correto para usuários reais? | O deploy de **produção**, gerado pelo merge no tronco |

O stage é onde uma feature é validada **enquanto deployada**, antes de tocar a produção. O produto
liga "preview" e "produção" ao seu host real.

## Gatilhos de deploy por comando

| Comando | Efeito de git / deploy |
| :--- | :--- |
| `p2s-doc` | Commit de documentação base/transversal direto no tronco. **Sem deploy** (ver [builds só-de-doc](#commits-só-de-doc-pulam-o-build)). |
| `p2s-spec` | Commit da spec + protótipos navegáveis (UI + OpenAPI/API fake) direto no tronco. **Sem deploy.** Não cria branch. |
| `p2s-plan` | Cria `feature/{ID}-{slug}` a partir do tronco; commita **apenas** o plano nela. Sem código. |
| `p2s-code` | Commits incrementais na branch; um push → deploy de **stage**. Nunca toca o tronco. |
| `p2s-test` | Só roda testes. Não altera estado do git. |
| `p2s-done` | Exige verde em `local` **e** `stage`. Mergeia no tronco (mantendo a branch) → deploy de **produção** → roda `p2s-test prod`. |

## Commit & push automáticos

Comandos que produzem alterações têm **autorização permanente** para versionar sua saída: ao final
de tal comando, commite **e** pushe automaticamente, **sem pausar para perguntar**.

- `p2s-doc` → commit + push no tronco.
- `p2s-spec` → commit + push da spec + protótipos no tronco.
- `p2s-plan` → commit + push do plano na branch da feature.
- `p2s-code` → commit(s) + push na branch da feature (publica em stage).
- `p2s-done` → merge + push no tronco.
- `p2s-test` não versiona (só roda testes).

Isso **não** afrouxa os portões de integridade: o push do `p2s-code` só ocorre com `p2s-test
local` verde, e o merge do `p2s-done` só com `local` e `stage` verdes. Quando o portão passa,
prossiga com commit/push direto — sem confirmação extra.

## O portão de revisão humana (entre `p2s-code` e `p2s-done`)

Depois que o stage é publicado e **antes** de qualquer `p2s-done`, o humano: (1) testa
manualmente no stage contra a spec, (2) revisa o diff da branch, e (3) decide — **aprovar** →
segue para `p2s-done`; **reprovar/ajustar** → volta ao ciclo de correção (`p2s-code`, ou
`p2s-doc` se for lacuna de spec) na mesma branch. Você nunca roda `p2s-done` por conta própria.
Trate este portão como a salvaguarda principal contra trabalho fora do rumo — "os testes
passaram" não é "está correto". (Ver
[commands.md](commands.md#o-portão-de-revisão-humana-entre-p2s-code-e-p2s-done).)

## O portão de DOD & ciclo de correção

O `p2s-done` marca a spec e o roadmap como concluídos (e arquiva o plano) **só se `p2s-test prod`
passar**. Se produção falhar, a feature **não** está pronta: volta ao ciclo
`p2s-code → p2s-test → p2s-done` (ou `p2s-doc` se a falha revelar lacuna de spec) na **mesma
branch** até ficar verde. Como o stage já foi validado, falhas em produção tendem a ser
específicas de ambiente e corrigidas por *fix-forward*.

## Commits só-de-doc pulam o build

Para que commits **somente de documentação** no tronco (`p2s-doc`) **não** gerem deploy de
produção, o host é configurado com um **ignored-build step**: um pequeno script versionado que
**pula o build** quando um commit só tocou caminhos de documentação/protótipos/tooling — para que
commits de `p2s-doc` **e `p2s-spec`** (specs + protótipos navegáveis) não deployem. É uma checagem
determinística — pertence a um script, não ao julgamento de um agente (ver
[automation.md](automation.md)).
