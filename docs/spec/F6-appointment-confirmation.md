# Especificação: F6 — Confirmação de Agendamento Público

## Escopo
- Gestão de solicitações de agendamento feitas por clientes.
- Integração opcional com cobrança recorrente.

## Implementação
- **Lista de Pendentes**: Mostrar agendamentos com status `PENDING_CONFIRMATION` no painel.
- **Ação Confirmar**:
    - Alterar status para `CONFIRMED`.
    - Disparar e-mail automático de confirmação (F5).
- **Recorrência**:
    - Checkbox "Agendamento Recorrente" disponível se `modulos.cobranca: true`.
    - Se marcado: criar `billing_plan` para o cliente.
    - Se `modulos.cobranca` for false: o checkbox não deve aparecer.

## Verificação
- **Local**:
    - Confirmar que o e-mail é disparado apenas na transição para `CONFIRMED`.
    - Validar que a opção de recorrência respeita a habilitação do módulo de cobrança.
- **Produção**: Realizar uma confirmação real e validar o recebimento do e-mail.

## Critério de Aceite
- Confirmação de agendamentos funcionando com notificação automática.
- UI condicional para recorrência baseada na disponibilidade do módulo de cobrança.
