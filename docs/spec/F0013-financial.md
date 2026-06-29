# Especificação: F0013 — Financeiro (Contas a Pagar/Receber)

> Módulo de **controle financeiro básico** do Tenant. **Gated** por `modulos.financeiro`
> (item de menu **próprio** no App Shell — ver `docs/10`). Sobre a fundação de UX da
> Fase 2.5 (shadcn/ui, react-hook-form + Zod, TanStack Query/Table — ver `docs/spec/F0002.5-ux-revamp.md`).

## Escopo

- **Contas/Caixas** (`account`): cadastrar contas financeiras. **Pelo menos uma por
  profissional**; um lançamento pode apontar para uma conta configurada pelo usuário.
- **Lançamentos** (`financial_entry`): contas a **pagar** e a **receber**, com status
  **previsto / pago / recebido** (e cancelado), valor, vencimento e data de pagamento.
- **Classificação**: **tipo de documento**, **categorias** e **tags** por lançamento.
- **Relatório financeiro**: visões por **conta**, **categoria**, **tag**, **profissional**
  e **período** (previsto vs. realizado, total a pagar/receber, saldo).

**Fora deste módulo (básico):** conciliação bancária automática, fluxo de caixa
projetado avançado, rateios complexos, integração contábil. Mantém-se simples.

## Gating e Guardrails
- **Módulo**: toda rota/tela exige `business.modulos.financeiro === true`; senão **404**
  (Guardrail 2). Novo flag em `plano.modulos` e `business.modulos` (ver `docs/04`).
- **Isolamento (Guardrail 1)**: toda query escopada por `businessId`.
- **Auditoria**: toda escrita financeira (criar/baixar/cancelar lançamento, criar conta)
  grava em `audit_log` (Guardrail de idempotência/auditoria).

## Implementação

### Contas (`account`)
- CRUD de contas do business; cada conta pode ser **geral do business** ou vinculada a um
  **profissional** (`professionalId` nullable). Ao criar um `professional`, garantir que
  exista **ao menos uma conta** utilizável por ele (conta própria ou a conta padrão do
  business apontada pelo usuário).
- Campos: `nome`, `tipo` (CAIXA|BANCO|CARTEIRA), `saldoInicial`, `ativo`.

### Lançamentos (`financial_entry`)
- Criar lançamento **a pagar** (despesa) ou **a receber** (receita), vinculado a uma
  `account`, opcionalmente a um `professional`, com `categoria` (lista controlada),
  `tags` (0..n) e `tipo de documento`.
- Status: **PREVISTO** (previsão) → **PAGO/RECEBIDO** (baixa, com `dataPagamento`) →
  ou **CANCELADO**. Valores e datas com máscara (ver `docs/10`).
- **Integração opcional com Cobrança**: quando um `payment` (módulo `cobranca`) é
  **RECEBIDO**, pode-se gerar automaticamente um lançamento **a receber/recebido**
  (`origem: AUTOMATICA`, `paymentId` preenchido) — idempotente (nunca duplicar por
  pagamento). Só se ambos os módulos estiverem ativos.

### Classificação
- `financial_category` (RECEITA|DESPESA), `financial_tag` e `document_type`: listas
  controladas por business (CRUD simples; `<select>`/multiselect na UI — nunca texto livre).

### Relatórios
- Tela de **relatório** com filtros por período, conta, categoria, tag, profissional e
  status (previsto/realizado). Apresenta totais (a pagar, a receber, saldo) e
  agrupamentos. Listas/tabelas com **TanStack Table**; dados via **TanStack Query**.

## UX (sobre `docs/10`)
- **Menu próprio** "Financeiro" no App Shell (só aparece se `modulos.financeiro`).
- Subnavegação: **Lançamentos** (lista filtrável + "Novo lançamento"), **Contas**,
  **Relatório**. Estados loading/empty/error completos; copy explicativa por tela.
- Lançamento usa o **switch a pagar/receber**, máscaras de valor/data, e selects de
  categoria/tag/documento. Telas (ASCII) a detalhar via `/ssd-doc` desta fase.

## Verificação
- **Local (Jest/TDD nas áreas críticas)**:
  - 404 quando `modulos.financeiro` é falso.
  - Soma/saldo do relatório por conta/categoria/tag/profissional.
  - Idempotência da geração automática de lançamento a partir de `payment` RECEBIDO.
  - Isolamento por `businessId`.
- **Produção**: cadastrar conta, lançar a pagar/receber, dar baixa e conferir o relatório.

## Critério de Aceite
- Tenant com `financeiro` ativo cadastra contas, registra contas a pagar/receber
  (previsto/pago/recebido), classifica por documento/categoria/tag e vê um relatório
  financeiro filtrável por conta, categoria, tag e profissional.
- Tenant sem o módulo não vê o menu e recebe 404 nas rotas.
