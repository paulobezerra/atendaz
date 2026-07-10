# Roadmap de Implementação

Toda feature segue o ciclo: **Implementar → Testar Localmente → Deploy em Produção → Próxima Feature.**

## [CONCLUÍDO] Fase 0: Esqueleto (Estrutura Base)
- Configuração inicial do Next.js, Tailwind, MongoDB.
- Seed de planos no banco de produção.
- Detalhes em: [docs/project/spec/F0000-skeleton.md](../spec/F0000-skeleton.md)

## [CONCLUÍDO] Fase 1: Onboarding e Planos
- Login Google e seleção de plano modular, com UX em **Split Layout**. Em produção.
- Detalhes em: [docs/project/spec/F0001-onboarding.md](../spec/F0001-onboarding.md)

## [CONCLUÍDO] Fase 2: Profissionais e Billing Override
- Gestão de agendas e faturamento próprio por profissional. Em produção, com App Shell (área autenticada).
- Detalhes em: [docs/project/spec/F0002-professionals-billing.md](../spec/F0002-professionals-billing.md)

## [CONCLUÍDO] Fase 2.5: Fundação de UX e Refactor das Telas Base
- Pausa estratégica entre F0002 e F0003 para elevar a usabilidade e reduzir retrabalho **antes** das próximas telas. Em produção.
- Adota **shadcn/ui**, **react-hook-form + Zod**, **TanStack Query/Table**, **lucide-react** e **react-imask** como fundação reusável (primitivos DRY: máscaras, switch PF/PJ, tooltips de jargão, estados loading/empty/error); refatora **Login, Profissionais e App Shell**. **Não** altera regra de negócio/modelo/API.
- Detalhes em: [docs/project/spec/F0002.5-ux-revamp.md](../spec/F0002.5-ux-revamp.md)

## [CONCLUÍDO] Fase 2.6: Onboarding Minimalista
- Onboarding vira **passo único** (identidade); trial libera o sistema completo; plano/Asaas saem do onboarding. **Altera** modelo (`planoId` nullable) e a rota de onboarding. Em produção.
- Detalhes em: [docs/project/spec/F0002.6-onboarding-minimal.md](../spec/F0002.6-onboarding-minimal.md)

## [CONCLUÍDO] Fase 2.7: Correções de UX (fidelidade ao `templates/referencia/`)
- Passe **só visual** sobre as telas já implementadas alinhando-as aos protótipos aprovados em `templates/prototipos/` (que seguem o `templates/referencia/`). **Login vira modal na Home** (`/`) — a rota `/login` deixou de existir; onboarding form-first; Profissionais/App Shell/Dashboard fiéis. **Não** altera modelo/API/regra (mesma natureza da F0002.5). Em produção.
- Introduziu a **etapa obrigatória de prototipação** (protótipo navegável aprovado antes de codar — ver `docs/p2s/principles.md` → pilar 2, prototipação da fronteira), após 2 rodadas de código reprovadas no gate por falta de fidelidade visual.
- Detalhes em: [docs/project/spec/F0002.7-ux-corrections.md](../spec/F0002.7-ux-corrections.md)

## [CONCLUÍDO] Fase 2.8: Configurações + Meio de Pagamento e NFS-e
- Menu de **Configurações** da clínica/empresa + tela "Configurar Meio de Pagamento e NFS-e" (Asaas) com **tutorial in-app**; endpoint próprio com `audit_log`.
- Telas novas passam pela **prototipação** (`docs/p2s/principles.md` → pilar 2) antes do código.
- Detalhes em: [docs/project/spec/F0002.8-settings-payment.md](../spec/F0002.8-settings-payment.md)

## Fase 3: Perfil, Serviços e Disponibilidade — **fatiada em F3.1–F3.3**

Configuração da agenda do profissional. Todas as fatias são **habilitadas por `modulos.agenda`**
(404 se off) e vivem em **abas sob o profissional** (`/dashboard/profissionais/[id]`:
Perfil · Serviços · Disponibilidade). As specs são produzidas via `p2s-spec` (ainda não criadas).

### [CONCLUÍDO] Fase 3.1: Perfil do profissional
- Bio, redes sociais e **foto** — upload via **Vercel Blob** (nova integração + env `BLOB_READ_WRITE_TOKEN`). Aba "Perfil".
- Spec: [`docs/project/spec/F0003.1-perfil.md`](../spec/F0003.1-perfil.md) — entregue e validada em produção.

### Fase 3.2: Serviços
- CRUD de `service` (nome, duração em min, valor, `ativo`). Model novo. Aba "Serviços".
- Spec a produzir: `docs/project/spec/F0003.2-servicos.md` (via `p2s-spec 3.2`).

### Fase 3.3: Disponibilidade
- CRUD de `availability` (dia da semana, horário início/fim, slot) com **rejeição de sobreposição** (lógica testável — TDD). Model novo. Aba "Disponibilidade".
- Spec a produzir: `docs/project/spec/F0003.3-disponibilidade.md` (via `p2s-spec 3.3`).

## Fase 4: Agenda Pública e Manual
- Fluxo de agendamento por clientes e interno.
- Detalhes em: [docs/project/spec/F0004-scheduling.md](../spec/F0004-scheduling.md)

## Fase 5: Infraestrutura de E-mail
- Motor de notificações via Resend.
- Detalhes em: [docs/project/spec/F0005-email-infrastructure.md](../spec/F0005-email-infrastructure.md)

## Fase 6: Confirmação de Agendamento
- Gestão de solicitações e gatilhos de cobrança recorrente.
- Detalhes em: [docs/project/spec/F0006-appointment-confirmation.md](../spec/F0006-appointment-confirmation.md)

## Fase 7: Cobrança Standalone
- Cobranças avulsas/recorrentes sem depender de agenda.
- Detalhes em: [docs/project/spec/F0007-billing-standalone.md](../spec/F0007-billing-standalone.md)

## Fase 8: Dados Fiscais do Cliente
- Página pública para coleta de CPF/CNPJ e endereço.
- Detalhes em: [docs/project/spec/F0008-client-tax-data.md](../spec/F0008-client-tax-data.md)

## Fase 9: Webhook Asaas e NFS-e Automática
- Emissão automática de notas **após confirmação do pagamento** (se dados fiscais estiverem completos).
- Detalhes em: [docs/project/spec/F0009-webhook-nfse.md](../spec/F0009-webhook-nfse.md)

## Fase 10: Emissão Manual de Nota
- Emissão avulsa de NFS-e (Fecha MVP).
- Detalhes em: [docs/project/spec/F0010-manual-invoice.md](../spec/F0010-manual-invoice.md)

## Fase 11: Assinatura da Plataforma
- Cobrança do negócio pelo uso da ferramenta.
- Detalhes em: [docs/project/spec/F0011-platform-subscription.md](../spec/F0011-platform-subscription.md)

## Fase 12: Hotsites por Nicho
- Páginas de marketing parametrizadas.
- Detalhes em: [docs/project/spec/F0012-marketing-pages.md](../spec/F0012-marketing-pages.md)

## Fase 13: Financeiro (Contas a Pagar/Receber)
- Módulo habilitado por (`modulos.financeiro`, item de menu próprio) com contas/caixas (≥1 por profissional), lançamentos a pagar/receber (previsto/pago/recebido), tipo de documento, categorias e tags, e relatório financeiro por conta/categoria/tag/profissional.
- Detalhes em: [docs/project/spec/F0013-financial.md](../spec/F0013-financial.md)
