# Atendaz - Plataforma Modular de Agenda + Cobrança + NFS-e

Sistema modular para gestão de agendamentos, cobranças automatizadas via Asaas e emissão de notas fiscais (NFS-e).

## 🚀 Fluxo de Trabalho (P2S — Prototype-to-Spec)

Este projeto roda sobre o **P2S**, um framework pessoal, **agnóstico de tecnologia e de agente**, onde a **especificação é a fonte da verdade** e **toda fronteira (UX, API, formato dos dados, integrações) é prototipada e aprovada antes de qualquer código** — o **protótipo aprovado vira a spec**. O livro de regras do framework vive em **[`docs/p2s/`](docs/p2s/)**; os dados específicos do produto (visão, arquitetura, guardrails, specs, planos) em **[`docs/project/`](docs/project/)**. Os comandos são slash commands / skills com prefixo `p2s-` (redirects em `.claude/commands/` que apenas apontam para `docs/p2s/` — nunca guardam regras).

### Os seis comandos

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `/p2s-doc {tópico}` | Documentação base/transversal (**não** toca spec) | Docs em `docs/project/base/` no tronco (sem deploy) |
| `/p2s-spec {ID}` | A spec da feature via **prototipação navegável** (UX, API, dados, integrações) | Spec em `docs/project/spec/` + protótipos em `templates/prototipos/` |
| `/p2s-plan {ID}` | O plano de execução | Branch `feature/{ID}-{slug}` + plano em `docs/project/plans/` (**sem código**) |
| `/p2s-code {ID}` | Código-fonte | Commits na branch → deploy de **stage** (Preview) |
| `/p2s-test {local\|stage\|prod}` | Execuções de teste | Evidência (Jest local · Cypress no Preview/Prod) |
| `/p2s-done {ID}` | O merge no tronco | Feature fechada após prova em produção (portão do DOD) |

Definições completas, portões e encadeamento: **[`docs/p2s/commands.md`](docs/p2s/commands.md)**.

### Portões

1. **DOR** (entrada do `/p2s-plan`): spec sem ambiguidade + **protótipo navegável aprovado de cada fronteira** (ou justificativa registrada de que não vale prototipar) + necessidades de ambiente conhecidas.
2. **Revisão humana** (entre `/p2s-code` e `/p2s-done`): com a feature em **stage (Preview)**, o usuário **testa manualmente e revisa o diff** — "os testes passaram" **não** é "está correto". Só após aprovação se avança; senão, volta ao ciclo de correção.
3. **DOD** (`/p2s-done`): único comando que altera a `master` — merge `--no-ff` (mantém a branch) → deploy de **produção** → `/p2s-test prod`. Só marca `[CONCLUÍDO]` com prova em produção.

> **Branches & deploy**: `master` = Produção (só muda no `/p2s-done`); `feature/{ID}-{slug}` = criada no `/p2s-plan`, nunca deletada. Commits só de docs/protótipos na `master` (`/p2s-doc`, `/p2s-spec`) não deployam (Vercel *Ignored Build Step* → `scripts/vercel-ignore-build.sh`). Ver [`docs/p2s/workflow.md`](docs/p2s/workflow.md).

## 📖 Documentação Importante

- [Framework P2S (livro de regras)](docs/p2s/README.md)
- [Roadmap de Implementação](docs/project/base/06-implementation-roadmap.md)
- [Modelo de Dados](docs/project/base/04-data-model.md)
- [Requisitos Técnicos](docs/project/base/03-technical-requirements.md)
- [Guardrails](docs/project/base/07-guardrails.md)
- [Design System & UX](docs/project/base/10-design-system.md)

## 💎 Golden Stack (Estável — nunca beta/preview)
**Regra dura (Guardrail 8)**: usar apenas releases **estáveis** (dist-tag `latest`), nunca `beta`, `preview`, `rc`, `alpha`, `canary` ou prerelease. **Beta/preview é pior que uma vulnerabilidade conhecida.** Preferir a linha estável mais recente, próxima de LTS.
- **Node.js**: 24.x (linha LTS)
- **Next.js**: 16.2.9 (estável `latest` — **não** usar `16.3.0-preview`)
- **React / React-DOM**: 19.2.x (estável)
- **next-auth**: 4.24.x (estável; o peer aceita Next 16 — v5 ainda é beta)
- **Mongoose**: 8.x (estável)
- **Tailwind**: 3.4.x (LTS)
- **Zod**: 3.x (estável)
- **shadcn/ui**: CLI/`latest` (Radix UI + `class-variance-authority` + `tailwind-merge` + `clsx`) — componentes copiados para o repo; ícones **lucide-react** (estável) *(F0002.5)*
- **react-hook-form**: 7.x (estável) + **@hookform/resolvers**: 3.x (resolver Zod) *(F0002.5)*
- **@tanstack/react-query**: 5.x (estável) *(F0002.5)*
- **@tanstack/react-table**: 8.x (estável) *(F0002.5)*
- **react-imask**: 7.x (estável) — máscaras de input (telefone/CPF/CNPJ/CEP/moeda) *(F0002.5)*
- **@testing-library/react** + **@testing-library/jest-dom** + **jest-environment-jsdom** (estáveis) — camada de teste de **componente/render** (`jsdom`), obrigatória para UI com lógica *(F0002.5)*

## 🧪 Modelo de Testes (três camadas)
A Política de Testes canônica está em [`docs/p2s/quality.md`](docs/p2s/quality.md) (mapeada para o produto nos [Guardrails](docs/project/base/07-guardrails.md)). Em resumo:
1. **Integração/API** (Jest) — handlers de rota + lógica crítica (TDD nas áreas de risco).
2. **Componente/Render** (Jest + React Testing Library, `jsdom`) — **todo componente de UI com lógica** monta sem lançar e exercita os ramos interativos. Roda junto no `npm test`.
3. **E2E** (Cypress) — contrato público no Preview/Prod; fluxos autenticados críticos quando viável.

**Regra dura**: "verde" não conta se não cobre a **superfície alterada**. Um crash de render não pode passar nos testes.

## ⚡ Fluxo Acelerado (Vapt-Vupt)
1. **DOR**: `/p2s-plan {ID}` -> cria a branch + auditoria de segurança + check de envs.
2. **Warm-up**: no início do `/p2s-code`, o agente garante a Golden Stack e `npm audit` limpo.
3. **Execução**: implementação TDD + `/p2s-test local` -> `push` -> `/p2s-test stage` (Preview).
4. **DOD**: `/p2s-done {ID}` -> merge na `master` -> build limpo na Vercel -> `/p2s-test prod` verde.
