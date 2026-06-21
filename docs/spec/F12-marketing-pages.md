# Especificação: F12 — Hotsites por Nicho

## Escopo
- Criação de landing pages parametrizadas para diferentes segmentos.
- Captura de clientes com planos pré-selecionados.

## Implementação
- **Página de Marketing**: `/para/{slug}`.
- **Dados**: Ler da coleção `marketing_page`.
- **Componentes**: Hero Title, Subtitle, lista de features, depoimentos.
- **Conversão**: O CTA (botão de ação) deve levar ao onboarding com o `planoId` configurado na página já pré-selecionado.

## Verificação
- **Local**:
    - Validar que slugs inexistentes ou inativos retornam 404.
    - Validar que o fluxo de onboarding inicia com o plano correto.
- **Produção**: Criar um hotsite para "Barbearias" (Agenda Simples) e outro para "Clínicas" (Completo).

## Critério de Aceite
- Capacidade de criar páginas de venda específicas para nichos com facilidade.
