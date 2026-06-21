# Especificação: F2 — Profissionais e Billing Override

## Escopo
- Gestão de múltiplos profissionais (agendas) dentro de um negócio.
- Possibilidade de cada profissional ter seu próprio faturamento (Asaas).

## Implementação
- **CRUD de Professional**: Gerenciamento de nome, slug interno e status.
- **Billing Override**:
    - Se `modulos.cobranca` ou `modulos.nfse` estiverem ativos.
    - Opção: "Usar Asaas/Fiscal próprio" (preenche `billingConfig`).
    - Opção: "Usar padrão do negócio" (mantém `billingConfig: null`).
- **Função Central**: `resolveBillingConfig(professional, business)`
    - Retorna `professional.billingConfig` se preenchido.
    - Senão, retorna `business.billingConfigPadrao`.

## Verificação
- **Local**:
    - Validar que `resolveBillingConfig` retorna o override corretamente.
    - Validar que chaves Asaas inválidas no override são rejeitadas.
- **Produção**: Configurar um negócio com 2 profissionais (um herdando e outro com Asaas próprio).

## Critério de Aceite
- Dois modelos de faturamento (centralizado e individual) coexistem no mesmo negócio em produção.
