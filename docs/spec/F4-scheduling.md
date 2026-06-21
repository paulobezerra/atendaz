# Especificação: F4 — Agenda: Pública e Manual

## Escopo
- Fluxo de agendamento por parte do cliente (público).
- Fluxo de agendamento por parte do profissional (manual).

## Implementação
- **Página Pública** (`/agendar/{businessSlug}`):
    - Gated: `modulos.agendaPublica: true`.
    - Seletor de profissionais (se houver mais de um).
    - Seleção de serviço e slot de horário.
    - Criar `appointment` com `origem: PUBLICO` e `status: PENDING_CONFIRMATION`.
    - Fornecer link `wa.me` para contato rápido.
- **Criação Manual** (Painel):
    - Gated: `modulos.agenda: true`.
    - Profissional cria agendamento para cliente.
    - Criar `appointment` com `origem: MANUAL` e `status: CONFIRMED` automaticamente.
- **404**: Se `agendaPublica` for false, a página pública não deve existir.

## Verificação
- **Local**:
    - Validar que dois clientes não conseguem reservar o mesmo slot simultaneamente.
    - Validar que agendamentos manuais pulam a etapa de confirmação.
- **Produção**: Testar ambos os fluxos com negócios configurados diferentemente.

## Critério de Aceite
- Negócios com agenda pública recebem agendamentos externos.
- Profissionais conseguem agendar manualmente de forma rápida.
