# Especificação: F1 — Login Google + Onboarding

## Escopo
- Autenticação de usuários donos de `business`.
- Fluxo inicial de configuração do negócio e escolha de plano.

## Implementação
- **Auth.js**: Integrar provider Google. Login permitido apenas para quem é dono da conta `business`.
- **Seleção de Plano**: Listar planos ativos (`plano`).
- **Cópia de Módulos**: Ao escolher o plano, copiar a configuração de `modulos` para o objeto `business`.
- **Dados Fiscais/Asaas**: Pede `billingConfigPadrao` (chave Asaas e códigos fiscais) SOMENTE se o plano incluir `cobranca` ou `nfse`.
- **Criação Automática**: Criar 1 `professional` padrão após completar o onboarding.
- **Status**: Marcar `onboardingStatus: COMPLETE`.

## Verificação
- **Local**:
    - Onboarding de plano sem cobrança/nota NÃO deve pedir chave Asaas.
    - Onboarding de plano com cobrança/nota deve pedir e validar chave no sandbox Asaas.
- **Produção**: Fluxo completo de onboarding funcional para os 3 tipos de planos.

## Critério de Aceite
- Os 3 fluxos de onboarding funcionam corretamente em produção, exigindo dados fiscais apenas quando necessário.
