# Atendaz - Plataforma Modular de Agenda + Cobrança + NFS-e

Sistema modular para gestão de agendamentos, cobranças automatizadas via Asaas e emissão de notas fiscais (NFS-e).

## 🚀 Fluxo de Trabalho (P2S — Prototype-to-Spec)

Este projeto roda sobre o **P2S**, um framework pessoal, **agnóstico de tecnologia e de agente**, onde a **especificação é a fonte da verdade** e **toda fronteira (UX, API, formato dos dados, integrações) é prototipada e aprovada antes de qualquer código** — o **protótipo aprovado vira a spec**. O livro de regras do framework vive em **[`docs/p2s/`](docs/p2s/)**; os dados específicos do produto (visão, arquitetura, guardrails, specs, planos) em **[`docs/project/`](docs/project/)**. Os comandos são slash commands / skills com prefixo `p2s-` (redirects em `.claude/commands/` que apenas apontam para `docs/p2s/` — nunca guardam regras).

### Os oito comandos (duas fases)

O P2S é **agnóstico de git flow**: a mecânica concreta (branch/merge/PR/deploy) deste projeto está em [`docs/project/base/workflow.md`](docs/project/base/workflow.md); a IA **nunca** mergeia no tronco por conta própria.

**Upstream (partida & manutenção):**

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `/p2s-discovery` | Descoberta de **produto** | constitution + roadmap |
| `/p2s-design` | Descoberta de **design/UX** (links + imagens) | Referência em `templates/referencia/` + design-system |

**Transversal:** `/p2s-doc` — docs ↔ realidade (engenharia reversa / reconciliação pós-implementação).

**Downstream (loop por feature):**

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `/p2s-spec {ID}` | A spec via **prototipação navegável** (UX, API, dados, integrações) | Spec + protótipos em `templates/prototipos/` |
| `/p2s-plan {ID}` | O plano (**cenários BDD** + inventário cria/altera/exclui) | Plano em `docs/project/plans/` (**sem código**) |
| `/p2s-code {ID}` | Código-fonte | Implementação (TDD) na branch da feature |
| `/p2s-review {ID}` | QA: testes (script) + revisão holística | Achados por severidade (bloqueante/major/medium/minor) |
| `/p2s-done {ID}` | **Fechamento lógico** (arquiva, marca concluído) | Feature pronta; promoção entregue ao git flow |

Definições completas, portões e encadeamento: **[`docs/p2s/commands.md`](docs/p2s/commands.md)**.

### Portões

1. **DOR** (entrada do `/p2s-plan`): spec sem ambiguidade + **protótipo navegável aprovado de cada fronteira** (ou justificativa registrada de que não vale prototipar) + necessidades de ambiente conhecidas.
2. **Revisão humana** (entre `/p2s-review` e `/p2s-done`): o usuário lê evidência + achados, **testa no ambiente do projeto e revisa o diff** — "os testes passaram" **não** é "está correto". Só após aprovação se avança.
3. **DOD** (`/p2s-done`): fecha logicamente (arquiva + marca `[CONCLUÍDO]`) **se** o `/p2s-review` não tem bloqueantes e a **validação definida pelo projeto** passou. A promoção (merge/deploy) segue o git flow do projeto.

> **Git flow deste projeto** (solo + Vercel): `master` = Produção; `feature/{ID}-{slug}` nunca deletada; commits só de docs/protótipos no `master` não deployam (Vercel *Ignored Build Step*). Detalhes e mapeamento em [`docs/project/base/workflow.md`](docs/project/base/workflow.md).

## 📖 Documentação Importante

- [Framework P2S (livro de regras)](docs/p2s/README.md)
- [Constituição do Produto](docs/project/base/constitution.md) — domínio, arquitetura, stack, guardrails, escopo
- [Modelo de Dados](docs/project/base/data-model.md) — com diagrama ER (Mermaid)
- [Roadmap de Implementação](docs/project/base/roadmap.md)
- [Design System & UX](docs/project/base/design-system.md)
- [Git Flow & Ambientes (concreto do projeto)](docs/project/base/workflow.md)
- [Manifesto da estrutura do produto (P2S)](docs/p2s/project-structure.md)

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
A Política de Testes canônica está em [`docs/p2s/quality.md`](docs/p2s/quality.md) (mapeada para o produto nos [Guardrails](docs/project/base/constitution.md)). Em resumo:
1. **Integração/API** (Jest) — handlers de rota + lógica crítica (TDD nas áreas de risco).
2. **Componente/Render** (Jest + React Testing Library, `jsdom`) — **todo componente de UI com lógica** monta sem lançar e exercita os ramos interativos. Roda junto no `npm test`.
3. **E2E** (Cypress) — contrato público no Preview/Prod; fluxos autenticados críticos quando viável.

**Regra dura**: "verde" não conta se não cobre a **superfície alterada**. Um crash de render não pode passar nos testes.

## ⚡ Fluxo Acelerado (Vapt-Vupt)
1. **DOR**: `/p2s-plan {ID}` -> plano (cenários BDD + inventário) + auditoria de segurança + check de envs.
2. **Warm-up**: no início do `/p2s-code`, o agente garante a Golden Stack e `npm audit` limpo; implementa TDD na branch da feature (`push` -> Preview/stage).
3. **QA**: `/p2s-review {ID}` -> roda os testes (script) + revisão holística + achados por severidade.
4. **DOD**: aprovado no gate humano, `/p2s-done {ID}` fecha (arquiva + `[CONCLUÍDO]`); a promoção (merge na `master` -> deploy Vercel -> Cypress em prod) segue o [git flow do projeto](docs/project/base/workflow.md).
