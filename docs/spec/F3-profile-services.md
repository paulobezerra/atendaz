# Especificação: F3 — Perfil, Serviços e Disponibilidade

## Escopo
- Configuração detalhada de cada profissional.
- Gated: Apenas disponível se `modulos.agenda: true`.

## Implementação
- **Perfil**: Bio, Foto (via Vercel Blob) e links de redes sociais.
- **Serviços (CRUD)**: Nome, duração em minutos, valor e status ativo.
- **Disponibilidade (CRUD)**: Dias da semana, horário de início, horário de fim e tempo do slot.

## Verificação
- **Local**:
    - Garantir que estas telas/funções retornam 404 se `modulos.agenda` for falso.
    - Validar que sobreposições de horários (`availability`) são rejeitadas.
- **Produção**: Configurar perfil completo em um negócio com agenda ativa.

## Critério de Aceite
- Profissional consegue configurar perfil, serviços e horários.
- UI reflete corretamente a ausência do módulo de agenda em negócios que não o contrataram.
