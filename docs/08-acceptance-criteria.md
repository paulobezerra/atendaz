# Critérios de Aceite (DoD - Definition of Done)

Para este projeto, uma feature só é considerada concluída (**DONE**) quando atende aos seguintes critérios soberanos:

### 🏁 Critérios Soberanos
1. **Validação em Produção**: A funcionalidade deve estar implantada na Vercel e funcionando conforme o esperado.
2. **Build Limpo**: O processo de deploy na Vercel deve ser concluído sem avisos de segurança ou vulnerabilidades de dependências.
3. **Zero Vulnerabilidades**: O comando `npm audit` deve estar limpo em ambiente local e produção.

## MVP
1. Plano Agenda Simples funciona sem cobrança.
2. Plano Cobrança + Nota funciona sem agenda.
3. Plano Completo suporta billing compartilhado e individual.
4. E-mails automáticos funcionando.
5. Testes de idempotência, conflitos e reprocessamentos.
6. Tudo validado em produção.

## Observação
Os critérios de aceite devem permanecer separados do roadmap para facilitar reutilização por outros agentes e ferramentas.
