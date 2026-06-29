# Roadmap de Implementação

Toda feature segue o ciclo: **Implementar → Testar Localmente → Deploy em Produção → Próxima Feature.**

## [CONCLUÍDO] Fase 0: Esqueleto (Estrutura Base)
- Configuração inicial do Next.js, Tailwind, MongoDB.
- Seed de planos no banco de produção.
- Detalhes em: [docs/spec/F0000-skeleton.md](spec/F0000-skeleton.md)

## [CONCLUÍDO] Fase 1: Onboarding e Planos
- Login Google e seleção de plano modular, com UX em **Split Layout**. Em produção.
- Detalhes em: [docs/spec/F0001-onboarding.md](spec/F0001-onboarding.md)

## [CONCLUÍDO] Fase 2: Profissionais e Billing Override
- Gestão de agendas e faturamento próprio por profissional. Em produção, com App Shell (área autenticada).
- Detalhes em: [docs/spec/F0002-professionals-billing.md](spec/F0002-professionals-billing.md)

## Fase 2.5: Revamp de UX e Fundação de Componentes
- Pausa estratégica entre F0002 e F0003 para elevar a usabilidade e reduzir retrabalho **antes** de construir as próximas telas (Perfil/Serviços, Agenda).
- Adota **shadcn/ui** (componentes prontos), **react-hook-form + Zod** (formulários DRY) e **TanStack Query/Table** (dados e listas) como fundação reusável; refatora as telas existentes (Login, Onboarding, App Shell, Profissionais) para essa base, com **copy explicativa** (helper text, descrições, empty states) em cada parte.
- Não introduz novas regras de negócio — é **fundação + redesenho**. Atualiza a fundação em `docs/10-design-system.md`.
- Detalhes em: [docs/spec/F0002.5-ux-revamp.md](spec/F0002.5-ux-revamp.md)

## Fase 3: Perfil, Serviços e Disponibilidade
- Configuração da agenda do profissional.
- Detalhes em: [docs/spec/F0003-profile-services.md](spec/F0003-profile-services.md)

## Fase 4: Agenda Pública e Manual
- Fluxo de agendamento por clientes e interno.
- Detalhes em: [docs/spec/F0004-scheduling.md](spec/F0004-scheduling.md)

## Fase 5: Infraestrutura de E-mail
- Motor de notificações via Resend.
- Detalhes em: [docs/spec/F0005-email-infrastructure.md](spec/F0005-email-infrastructure.md)

## Fase 6: Confirmação de Agendamento
- Gestão de solicitações e gatilhos de cobrança recorrente.
- Detalhes em: [docs/spec/F0006-appointment-confirmation.md](spec/F0006-appointment-confirmation.md)

## Fase 7: Cobrança Standalone
- Cobranças avulsas/recorrentes sem depender de agenda.
- Detalhes em: [docs/spec/F0007-billing-standalone.md](spec/F0007-billing-standalone.md)

## Fase 8: Dados Fiscais do Cliente
- Página pública para coleta de CPF/CNPJ e endereço.
- Detalhes em: [docs/spec/F0008-client-tax-data.md](spec/F0008-client-tax-data.md)

## Fase 9: Webhook Asaas e NFS-e Automática
- Emissão automática de notas **após confirmação do pagamento** (se dados fiscais estiverem completos).
- Detalhes em: [docs/spec/F0009-webhook-nfse.md](spec/F0009-webhook-nfse.md)

## Fase 10: Emissão Manual de Nota
- Emissão avulsa de NFS-e (Fecha MVP).
- Detalhes em: [docs/spec/F0010-manual-invoice.md](spec/F0010-manual-invoice.md)

## Fase 11: Assinatura da Plataforma
- Cobrança do negócio pelo uso da ferramenta.
- Detalhes em: [docs/spec/F0011-platform-subscription.md](spec/F0011-platform-subscription.md)

## Fase 12: Hotsites por Nicho
- Páginas de marketing parametrizadas.
- Detalhes em: [docs/spec/F0012-marketing-pages.md](spec/F0012-marketing-pages.md)

## Fase 13: Financeiro (Contas a Pagar/Receber)
- Módulo gated (`modulos.financeiro`, item de menu próprio) com contas/caixas (≥1 por profissional), lançamentos a pagar/receber (previsto/pago/recebido), tipo de documento, categorias e tags, e relatório financeiro por conta/categoria/tag/profissional.
- Detalhes em: [docs/spec/F0013-financial.md](spec/F0013-financial.md)
