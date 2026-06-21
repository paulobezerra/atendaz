# Princípios de Arquitetura

- Arquitetura modular e multi-tenant.
- Módulos independentes e habilitáveis por plano.
- `professional` pode herdar ou sobrescrever o billing.
- Toda decisão de cobrança deve passar por `resolveBillingConfig`.
- Rotas de módulos desabilitados retornam 404.
- Não armazenar dados clínicos ou sensíveis desnecessários.
- Processamento síncrono no MVP.
