# Git Flow & Ambientes — Atendaz

A **mecânica concreta** de git, ambientes e deploy deste projeto. O framework P2S é agnóstico disto
(ver [`docs/p2s/workflow.md`](../../p2s/workflow.md)); aqui o Atendaz declara suas escolhas.

> Contexto: **dev solitário**, deploy contínuo na **Vercel**, tronco direto. Um contexto corporativo
> trocaria isto por PRs/homologação sem mudar o fluxo lógico do P2S.

## Branches

- **Tronco = `master`** — é a **produção**. Alterado ao **fechar** uma feature (merge, preservando a
  branch). Deve permanecer sempre verde e deployável.
- **`feature/{ID}-{slug}`** — uma por feature, criada ao iniciar a implementação, **nunca deletada**
  (preserva histórico/auditoria).

## Ambientes → mapeamento P2S

| Pergunta lógica (P2S) | Ambiente concreto (Atendaz) |
| :--- | :--- |
| A lógica se sustenta isolada? | **local** — Jest (integração/API + componente/render) contra `mongodb-memory-server` |
| A mudança integrada se comporta? | **stage** — deploy de **Preview** da Vercel, a cada push na branch da feature |
| Está correto para o uso real? | **prod** — deploy de **produção** (o alvo de validação final designado) |

**Validação de DOD deste projeto:** produção (Vercel) — smoke/E2E (Cypress) verde em prod.

## Promoção

- **`p2s-code`**: push na branch → Preview (stage). Um `npm test` local vermelho **bloqueia** o push
  (husky pre-push).
- **`p2s-done`**: com revisão humana aprovada + `p2s-review` sem bloqueantes + `stage` verde → **merge
  `--no-ff` em `master`** (mantém a branch) → deploy de produção → validação em prod. Como é solo com
  tronco direto, o merge é local (num contexto de PR, seria um Pull Request).

## Automação (hooks & deploy)

- **husky pre-commit**: **trava do P2S** (`scripts/guard-p2s.sh`) + `npm test`. **pre-push**:
  `npm run test:local`. Falha **bloqueia** por design.
- **Ignored-build step (Vercel)**: `scripts/vercel-ignore-build.sh` — **pula** o build/deploy quando
  o commit só tocou `docs/**`, `*.md`, `.claude/**`, `templates/referencia/**`, `templates/prototipos/**`
  (docs, protótipos, tooling). Assim commits de doc/discovery/design/spec no `master` **não** deployam.
- **`npm audit --omit=dev` = 0** antes do push (Guardrail 8).

## Trava do framework P2S

Este projeto **trava o framework** (`docs/p2s/`): ele **só muda de forma explícita** (ver o padrão
agnóstico em [`docs/p2s/automation.md`](../../p2s/automation.md#trava-do-framework-opcional)).

- **Mecanismo:** `scripts/guard-p2s.sh` no **pre-commit** rejeita qualquer commit que altere
  `docs/p2s/**`, a não ser que a variável **`P2S_UNLOCK=1`** esteja setada.
- **Para mexer no framework (decisão explícita do humano):**
  `P2S_UNLOCK=1 git commit -m "doc(p2s): ..."`.
- **O agente nunca destrava sozinho.** Só usa `P2S_UNLOCK=1` quando o humano pedir explicitamente
  para alterar o P2S; fora isso, mudança em `docs/p2s/` é bloqueada por design.

## Política de commit & push (solo)

Neste projeto (solo, tronco direto), os comandos `p2s-*` têm **autorização permanente** para
`git commit` **e** `git push` automaticamente ao final, sem perguntar — respeitando os portões
(não versionar com testes vermelhos). Doc/discovery/design/spec vão direto ao `master` (sem deploy);
`p2s-code` na branch da feature. **Esta é uma política do Atendaz**, não do framework — um fluxo de
PR a substituiria.
