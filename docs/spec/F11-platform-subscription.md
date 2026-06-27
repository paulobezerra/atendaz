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
    - **Origem do gatilho (Guardrail 6)**: a ativação/desativação de profissionais acontece no **F2**, mas por decisão de faseamento o F2 **apenas** altera o estado (`professional.ativo`) — **não** recalcula `valorMensal`/`qtdAgendasAtivas` nem toca o Asaas (a `PLATFORM_ASAAS_API_KEY` só existe nesta fase). Cabe ao **F11** assumir o recálculo e a sincronização: ao ligar a assinatura, recomputar `qtdAgendasAtivas`/`valorMensal` a partir do estado atual dos profissionais e, daí em diante, manter a cobrança proporcional a cada ativação/desativação.
- **Automação**: Cron diário para transições de status (`TRIAL -> GRACE -> CANCELED`) e bloqueio de acesso ao painel para inadimplentes.

## Verificação
- **Local**:
    - Validar a fórmula de cálculo para diferentes combinações de planos e agendas.
    - Testar bloqueio de rotas do painel quando status é `CANCELED`.
- **Produção**: Validar criação da assinatura e valores em produção para os 3 planos.

## Critério de Aceite
- Plataforma monetizada com cobrança automática e proporcional ao uso (número de agendas).
