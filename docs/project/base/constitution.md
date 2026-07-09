# Constituição do Produto — Atendaz

> A **lei durável** do Atendaz: domínio, arquitetura, stack, guardrails e escopo — os invariantes
> que **não mudam por feature**. É o primeiro documento a ler para entender "as regras deste
> produto". Onde uma regra é uma **política genérica de engenharia**, ela é **referenciada** de
> [`docs/p2s/quality.md`](../../p2s/quality.md), não repetida aqui — a política é do framework; a
> constituição só diz **como o Atendaz a encarna**.

## 1. Visão & domínio

Plataforma **modular** de **Agenda + Cobrança + NFS-e** (multi-nicho, multi-agenda). Três
capacidades independentes, ligáveis/desligáveis por plano, sobre **um mesmo modelo de dados**.

**Módulos:** `agenda` (autoagendamento e horários), `agendaPublica`, `cobranca` (Pix/boleto
recorrente e avulso via Asaas), `nfse` (nota fiscal automática ou manual), `financeiro` (F0013).
Cada `business` escolhe um plano no onboarding, que define os módulos habilitados.

**Casos de uso reais** (a mesma base serve todos):
- **Barbearia simples** — só agenda, cobra na maquininha (`agenda:true, cobranca:false, nfse:false`).
- **Clínica mista** — profissionais que faturam pelo CNPJ da clínica **e** profissionais que faturam
  por conta própria (`cobranca:true`, cada `professional` herda ou faz override do billing).
- **Emissor de notas** — só emissão para quem recebe por fora (`nfse:true`, resto `false`).
- **Solução completa** — todos os módulos; preço escala pela quantidade de agendas.

## 2. Camadas (tenancy) — nunca confundir

1. **Plataforma** — do Paulo; vende assinaturas. O cliente dela é o Tenant.
2. **Tenant / Business** — a empresa pagante (barbearia, clínica). **Dona dos dados.**
3. **Cliente (Paciente)** — o cliente final do Tenant.

## 3. Princípios de arquitetura

- Arquitetura **modular e multi-tenant**; módulos independentes e habilitáveis por plano.
- `professional` pode **herdar ou sobrescrever** o billing; toda decisão de cobrança passa por
  `resolveBillingConfig(professional, business)`.
- Rota de módulo desativado retorna **404** (ver [habilitação em quality.md](../../p2s/quality.md#padrões-de-isolamento--gating)).
- Não armazenar dados clínicos/sensíveis desnecessários.
- **Processamento síncrono** no MVP (sem mensageria/filas).

## 4. Stack

A stack concreta e **pinada** vive na **Golden Stack** do [`README.md`](../../../README.md); as
políticas que a governam (só estável/LTS, zero-vuln em produção, nunca resolver audit por downgrade)
são do framework — ver [`quality.md`](../../p2s/quality.md#política-de-dependências--versões).

- **Framework/UI:** Next.js (App Router) + TypeScript; Tailwind + **shadcn/ui** (Radix) + lucide;
  formulários **react-hook-form + Zod**; dados no client **TanStack Query/Table** (ver
  [`design-system.md`](design-system.md)).
- **Banco:** MongoDB (Vercel Marketplace) — provisionar na **mesma região** das Vercel Functions.
- **Auth:** Auth.js / **NextAuth linha estável** (v5 é beta → **proibido**; ver Guardrail 8),
  provider Google (login só para donos de `business`).
- **Pagamentos & Fiscal:** API **Asaas** (sandbox em dev). **Uploads:** Vercel Blob. **E-mail:**
  Resend. **Runtime:** **Node.js 24.x**. **Deploy:** Vercel.

## 5. Guardrails (inegociáveis)

**Nenhuma alteração de código pode violar estas regras.** A numeração é estável — specs referenciam
"Guardrail N".

1. **Hierarquia & isolamento (multi-tenant).** Um Business **nunca** acessa dados de outro; **toda**
   query inclui `businessId`. Slugs de Business/Professional validados contra reservados e únicos no
   escopo. (Encarna [isolamento por dono](../../p2s/quality.md#padrões-de-isolamento--gating).)
2. **Modularidade estrita (habilitação por módulo).** Nenhuma ação de Agenda/Cobrança/NFS-e roda sem checar
   `business.modulos`; módulo desativado → **404** (não botão escondido). Onboarding pede só o que
   os módulos ativos exigem.
3. **Faturamento & Asaas.** Toda lógica de cobrança/nota usa `resolveBillingConfig(professional,
   business)` — nunca assumir o token do Business sem checar o override do Profissional. Chaves
   Asaas **criptografadas com AES-256-GCM** antes de persistir
   ([segredos](../../p2s/quality.md#segredos--segurança)). **Fidelidade à API Asaas:** proibido
   inventar campos/endpoints — consultar a doc oficial ou perguntar
   ([API externa](../../p2s/quality.md#fidelidade-a-api-externa)).
4. **Idempotência, auditoria & testes.** Webhooks (Asaas, Plataforma) **idempotentes** (nunca 2
   notas para 1 pagamento); toda escrita relevante gera `audit_log`
   ([idempotência & auditoria](../../p2s/quality.md#confiabilidade-idempotência--auditabilidade)).
   **TDD obrigatório** em idempotência, cálculo de slots, transições de assinatura, recálculo por
   agenda e resolução de billing. A **Política de Testes** (três camadas + cobertura da superfície
   alterada) é a de [`quality.md`](../../p2s/quality.md#política-de-testes).
5. **NFS-e & dados fiscais.**
   - Estratégias por Tenant: **AUTO_AFTER_PAYMENT** (emite ao confirmar `RECEIVED`; exige dados
     completos), **MANUAL_PER_PAYMENT** (por comando do Gestor a cada cobrança paga),
     **MANUAL_BATCH** (Gestor dispara em lote).
   - Dados incompletos → nota fica em `PENDING_CLIENT_DATA`.
   - **Nunca** emitir antes da confirmação do pagamento, em nenhuma estratégia.
   - Preenchimento pelo cliente é facilitador; não bloquear a emissão manual se o Gestor tem os
     dados. Erros de NFS-e são registrados, visíveis e permitem nova tentativa manual.
6. **Regras comerciais da Plataforma.** Valor da assinatura do Tenant **recalculado** ao
   ativar/desativar `professional` (quando o plano cobra por agenda adicional). **Sem estorno** de
   períodos já faturados. **Grace period:** TRIAL 30 dias, GRACE 15 dias antes de suspender o painel.
7. **Privacidade & limites.** Proibido armazenar dados clínicos/prontuário/saúde. **Sem WhatsApp
   Business API** — confirmações via link `wa.me`. Notificações transacionais via **Resend**,
   registradas em `notification_log`. (Encarna [privacidade por padrão](../../p2s/quality.md#privacidade-por-padrão).)
8. **Segurança de dependências.** Só releases **estáveis** (prerelease é pior que vulnerabilidade
   conhecida); push proibido com vuln em **dependências de produção** (`npm audit --omit=dev` = 0);
   nunca "resolver" audit por downgrade. Detalhe da política em
   [`quality.md`](../../p2s/quality.md#política-de-dependências--versões); o gate roda no pre-push (husky).
   > **Débito conhecido (2026-06-22):** ~18 vulns *moderate* em devDependencies de teste, de
   > `@istanbuljs/load-nyc-config` (unmaintained) via `babel-jest`. Sem patch; não afetam produção
   > (`npm audit --omit=dev` = 0).

## 6. Fora de escopo

App mobile · integração Google Calendar/Outlook · WhatsApp Business API · SMS · prontuário ·
multiidioma · white-label · troca de plano self-service no MVP · mensageria e filas · editor visual
de hotsite.

## 7. Definição de MVP

1. Plano **Agenda Simples** funciona sem cobrança.
2. Plano **Cobrança + Nota** funciona sem agenda.
3. Plano **Completo** suporta billing compartilhado **e** individual.
4. E-mails automáticos funcionando.
5. Testes de idempotência, conflitos e reprocessamentos.
6. Tudo validado **em produção**.

> Os critérios de aceite **por feature** vivem como cenários testáveis na `spec` de cada uma
> (método em [`docs/p2s`](../../p2s/commands.md); o DOD genérico em
> [`quality.md`](../../p2s/quality.md) / [`commands.md`](../../p2s/commands.md#dor--dod)).
