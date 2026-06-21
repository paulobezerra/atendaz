# Especificação: F11 — Assinatura da Plataforma

## Escopo
- Gestão da cobrança recorrente dos negócios pelo uso da plataforma (Paulo).
- Preço baseado em plano base + quantidade de agendas adicionais.

## Implementação
- **Conta Destino**: Usar `PLATFORM_ASAAS_API_KEY` (Conta do Paulo).
- **Criação da Assinatura**: Ao completar o onboarding, criar `platform_subscription`.
- **Regras de Tempo**:
    - Trial: 30 dias.
    - Grace (Carência): +15 dias após o trial (total 45).
- **Cálculo de Valor**: `plano.precoBase + max(0, qtdAgendas-1) * plano.precoPorAgendaAdicional`.
- **Sincronização**: Recalcular valor no Asaas sempre que um `professional` for criado ou desativado.
- **Automação**: Cron diário para transições de status (`TRIAL -> GRACE -> CANCELED`) e bloqueio de acesso ao painel para inadimplentes.

## Verificação
- **Local**:
    - Validar a fórmula de cálculo para diferentes combinações de planos e agendas.
    - Testar bloqueio de rotas do painel quando status é `CANCELED`.
- **Produção**: Validar criação da assinatura e valores em produção para os 3 planos.

## Critério de Aceite
- Plataforma monetizada com cobrança automática e proporcional ao uso (número de agendas).
