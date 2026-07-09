# Especificação: F0007 — Cobrança Standalone (Avulsa e Recorrente)

## Escopo
- Capacidade de emitir cobranças sem necessidade de um agendamento prévio.
- Gated: `modulos.cobranca: true`.

## Implementação
- **Nova Cobrança**: Botão no painel para criar cobrança direta.
- **Fluxo**: Escolher/criar cliente -> definir valor -> escolher avulsa ou recorrente -> escolher forma de pagamento.
- **Configuração**: Usar sempre `resolveBillingConfig` para determinar a conta Asaas destino.
- **Atalho**: No fluxo de agenda, "Concluir Atendimento" deve permitir criar a mesma cobrança a partir do `appointment`.
- **Notificação**: Enviar e-mail com a cobrança imediatamente após a criação (F5).

## Verificação
- **Local**:
    - Validar criação de cobrança independente de agendamentos.
    - Validar que o e-mail de cobrança é disparado em ambos os fluxos (direto e via agenda).
- **Produção**: Criar cobrança standalone em um negócio que não possui o módulo de agenda.

## Critério de Aceite
- Negócios focados em cobrança conseguem operar sem agendamentos.
- E-mails de cobrança são enviados corretamente para os clientes.
