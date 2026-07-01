# Critérios de Aceite (DoD - Definition of Done)

Para este projeto, uma feature só é considerada concluída (**DONE**) quando atende aos seguintes critérios soberanos:

### 🏁 Critérios Soberanos
1. **Validação em Produção**: A funcionalidade deve estar implantada na Vercel e funcionando conforme o esperado.
2. **Build Limpo**: O processo de deploy na Vercel deve ser concluído sem avisos de segurança ou vulnerabilidades de dependências.
3. **Zero Vulnerabilidades**: O comando `npm audit` deve estar limpo em ambiente local e produção.
4. **Cobertura da superfície alterada**: Toda superfície tocada pela feature tem teste automatizado na camada certa — lógica/API em Jest de integração; **UI com lógica em teste de render/interação (RTL + `jsdom`)**. Um crash de render não pode passar em "verde". Ver a Política de Testes em `docs/07` §4.1.

## MVP
1. Plano Agenda Simples funciona sem cobrança.
2. Plano Cobrança + Nota funciona sem agenda.
3. Plano Completo suporta billing compartilhado e individual.
4. E-mails automáticos funcionando.
5. Testes de idempotência, conflitos e reprocessamentos.
6. Tudo validado em produção.

## Observação
Os critérios de aceite devem permanecer separados do roadmap para facilitar reutilização por outros agentes e ferramentas.
