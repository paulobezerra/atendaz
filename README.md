# Atendaz - Plataforma Modular de Agenda + Cobrança + NFS-e

Sistema modular para gestão de agendamentos, cobranças automatizadas via Asaas e emissão de notas fiscais (NFS-e).

## 🚀 Fluxo de Trabalho (Agent-First)

Este projeto utiliza um fluxo de trabalho rigoroso onde a **documentação é a fonte da verdade**. Os comandos do fluxo são slash commands reais com prefixo `ssd-` (definidos em `.claude/commands/`). Detalhes completos em [docs/00-agent-instructions.md](docs/00-agent-instructions.md).

### 1. Documentação (Spec)
Toda funcionalidade deve estar descrita em `docs/spec/F{ID}-{nome}.md`. O roadmap oficial está em `docs/06-implementation-roadmap.md`.

### 2. Planejamento (`/ssd-plan {ID}`)
Antes de codar, o agente gera um plano técnico e **cria a branch `feature/{ID}-{slug}`**.
- **Ação**: lê **toda a documentação em `docs/`** e cria o checklist em `docs/plans/{ID}-{nome}.md` (commitado na branch). O usuário valida antes da execução.

### 3. Implementação (`/ssd-code {ID}`)
Após o plano aprovado, codifica-se **na branch da feature**; cada `push` publica em **homologação (stage/Preview)** da Vercel.
- **Ação**: relê spec, plano e **Guardrails (`docs/07`)**, implementando com fidelidade total e TDD nas áreas críticas.

### 4. Revisão Humana (gate antes do done)
Com a feature em **stage (Preview)**, o usuário **testa manualmente e revisa o código** — é o ponto onde o rumo é conferido e corrigido (o agente pode ter divergido da spec). Só após aprovação se avança; senão, volta ao ciclo de correção. Detalhes em [docs/00](docs/00-agent-instructions.md#fluxo-de-branches-ambientes-e-deploy).

### 5. Finalização (`/ssd-done {ID}`)
Único comando que altera a `master`: merge `--no-ff` (mantém a branch) → deploy de **produção** → `/ssd-test prod`. Só marca `[CONCLUÍDO]` se passar em prod; caso contrário, volta ao ciclo de correção.

## 🛠 Comandos Rápidos

| Comando | Descrição |
| :--- | :--- |
| `/ssd-spec {ID}` | *(futuro)* Cria uma nova spec em `docs/spec/` |
| `/ssd-plan {ID}` | Cria a branch da feature e gera o plano em `docs/plans/` |
| `/ssd-code {ID}` | Implementa a feature na branch (deploy de stage/Preview) |
| `/ssd-doc {tema}` | Atualiza documentação/arquitetura (commit na `master`, sem deploy) |
| `/ssd-test {local\|stage\|prod}` | Executa testes: Jest local · Cypress no Preview · Cypress em produção |
| `/ssd-done {ID}` | Mergeia na `master`, valida em prod e finaliza (portão do DOD) |

> **Branches & deploy**: `master` = Produção (só muda no `/ssd-done`); `feature/{ID}-{slug}` = criada no `/ssd-plan`, nunca deletada. Commits só-de-docs na `master` não deployam (Vercel *Ignored Build Step* → `scripts/vercel-ignore-build.sh`). Ver [docs/00](docs/00-agent-instructions.md#fluxo-de-branches-ambientes-e-deploy).

## 📖 Documentação Importante
- [Instruções para Agentes](docs/00-agent-instructions.md)
- [Roadmap de Implementação](docs/06-implementation-roadmap.md)
- [Modelo de Dados](docs/04-data-model.md)
- [Requisitos Técnicos](docs/03-technical-requirements.md)
- [Design System & UX](docs/10-design-system.md)

## 💎 Golden Stack (Referência de Estabilidade)
Para evitar loops de dependências, utilize sempre:
- **Node.js**: 24 (Latest/Vercel Recommended)
- **Next.js**: 16.3.0-preview.3 (Vanguarda/Sem vulnerabilidades da linha 15)
- **React**: 19.0.0
- **Mongoose**: 8.9.0+
- **Tailwind**: 3.4+

## ⚡ Fluxo Acelerado (Vapt-Vupt)
1. **DOR**: `/ssd-plan {ID}` -> cria a branch + auditoria de segurança + check de envs.
2. **Warm-up**: no início do `/ssd-code`, o agente garante a Golden Stack e `npm audit` limpo.
3. **Execução**: implementação TDD + `/ssd-test local` -> `push` -> `/ssd-test stage` (Preview).
4. **DOD**: `/ssd-done {ID}` -> merge na `master` -> build limpo na Vercel -> `/ssd-test prod` verde.
