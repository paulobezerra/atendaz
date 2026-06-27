# Roadmap de Implementação

Toda feature segue o ciclo: **Implementar → Testar Localmente → Deploy em Produção → Próxima Feature.**

## [CONCLUÍDO] Fase 0: Esqueleto (Estrutura Base)
- Configuração inicial do Next.js, Tailwind, MongoDB.
- Seed de planos no banco de produção.
- Detalhes em: [docs/spec/F0-skeleton.md](spec/F0-skeleton.md)

## [CONCLUÍDO] Fase 1: Onboarding e Planos
- Login Google e seleção de plano modular, com UX em **Split Layout**. Em produção.
- Detalhes em: [docs/spec/F1-onboarding.md](spec/F1-onboarding.md)

## [CONCLUÍDO] Fase 2: Profissionais e Billing Override
- Gestão de agendas e faturamento próprio por profissional. Em produção, com App Shell (área autenticada).
- Detalhes em: [docs/spec/F2-professionals-billing.md](spec/F2-professionals-billing.md)

## Fase 3: Perfil, Serviços e Disponibilidade
- Configuração da agenda do profissional.
- Detalhes em: [docs/spec/F3-profile-services.md](spec/F3-profile-services.md)

## Fase 4: Agenda Pública e Manual
- Fluxo de agendamento por clientes e interno.
- Detalhes em: [docs/spec/F4-scheduling.md](spec/F4-scheduling.md)

## Fase 5: Infraestrutura de E-mail
- Motor de notificações via Resend.
- Detalhes em: [docs/spec/F5-email-infrastructure.md](spec/F5-email-infrastructure.md)

## Fase 6: Confirmação de Agendamento
- Gestão de solicitações e gatilhos de cobrança recorrente.
- Detalhes em: [docs/spec/F6-appointment-confirmation.md](spec/F6-appointment-confirmation.md)

## Fase 7: Cobrança Standalone
- Cobranças avulsas/recorrentes sem depender de agenda.
- Detalhes em: [docs/spec/F7-billing-standalone.md](spec/F7-billing-standalone.md)

## Fase 8: Dados Fiscais do Cliente
- Página pública para coleta de CPF/CNPJ e endereço.
- Detalhes em: [docs/spec/F8-client-tax-data.md](spec/F8-client-tax-data.md)

## Fase 9: Webhook Asaas e NFS-e Automática
- Emissão automática de notas **após confirmação do pagamento** (se dados fiscais estiverem completos).
- Detalhes em: [docs/spec/F9-webhook-nfse.md](spec/F9-webhook-nfse.md)

## Fase 10: Emissão Manual de Nota
- Emissão avulsa de NFS-e (Fecha MVP).
- Detalhes em: [docs/spec/F10-manual-invoice.md](spec/F10-manual-invoice.md)

## Fase 11: Assinatura da Plataforma
- Cobrança do negócio pelo uso da ferramenta.
- Detalhes em: [docs/spec/F11-platform-subscription.md](spec/F11-platform-subscription.md)

## Fase 12: Hotsites por Nicho
- Páginas de marketing parametrizadas.
- Detalhes em: [docs/spec/F12-marketing-pages.md](spec/F12-marketing-pages.md)
