# Especificação: F1 — Login Google + Onboarding

## Escopo
- Autenticação de usuários donos de `business` via Google.
- Fluxo de configuração inicial (Onboarding) para novos Tenants.
- Escolha de Plano Comercial.
- Configuração de Módulos Dinâmicos.
- Provisionamento do primeiro `professional`.
- Configuração de Faturamento (Asaas) e Dados Fiscais (se aplicável).

## DOR (Definition of Ready)
- [ ] Spec validada contra Guardrails e Modelo de Dados.
- [ ] Plano de execução detalhado em `docs/plans/01-onboarding.md`.
- [ ] Variáveis de ambiente configuradas: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `CRYPTO_MASTER_KEY`, `ASAAS_BASE_URL`.
- [ ] Golden Stack confirmada: Node 24, Next 16+, React 19.

## Implementação Detalhada

### 1. Autenticação (Auth.js v5)
- Integrar Google Provider.
- **Session Strategy**: Database ou JWT (conforme definido na implementação).
- **Callback de Login**: Se o usuário não existir no banco, ele é redirecionado para o onboarding. Se existir, vai para o dashboard.

### 2. Fluxo de Onboarding (Client-Side Wizard)
- **Passo 1: Identidade do Business**:
    - Nome Fantasia, Slug (validar contra lista de reservados e unicidade), Segmento.
- **Passo 2: Seleção de Plano**:
    - Listar planos da coleção `plano`.
    - Ao selecionar, copiar `modulos` do plano para o novo objeto `business`.
- **Passo 3: Configuração de Módulos (Gated)**:
    - Se `modulos.cobranca` ou `modulos.nfse` forem TRUE:
        - Pedir API Key do Asaas.
        - **Validação**: Testar a chave contra `ASAAS_BASE_URL/accounts` (Sandbox/Prod conforme env).
        - **Segurança**: Criptografar a chave com AES-256-GCM usando `CRYPTO_MASTER_KEY` antes de salvar em `billingConfigPadrao`.
        - Pedir `nfseStrategy` e `codigosFiscais` (se `nfse` for true).
- **Passo 4: Profissional Inicial**:
    - Criar automaticamente 1 registro em `professional` vinculado ao `business`.
    - Nome padrão: Nome do Usuário Google (editável).
    - Ativar por padrão.

### 3. Finalização
- Criar documento `business` com `onboardingStatus: 'COMPLETE'`.
- Criar documento `platform_subscription` com status `TRIAL` (30 dias).
- Redirecionar para o Dashboard.

## Regras de Negócio e Conflitos Identificados
- **Multi-tenant**: O `googleId` deve ser a chave de ligação entre o usuário autenticado e o `business`.
- **Modularidade**: Se o plano for "Agenda Simples", o Passo 3 deve ser ocultado ou simplificado (sem chaves Asaas).
- **Idempotência**: O processo de criação do Business deve ser transacional ou protegido contra duplicidade caso o usuário atualize a página no meio do processo.
- **Segurança**: Chaves Asaas NUNCA devem transitar ou ser armazenadas em texto plano.

## Verificação e DOD (Definition of Done)

### Testes de Integração (Local)
- [ ] Sucesso no Login Google (Mock/Provider).
- [ ] Validação de Slug (não permitir 'admin', 'api', etc).
- [ ] Criptografia da chave Asaas (deve ser diferente no banco e na memória).
- [ ] Criação correta de Business + Professional + PlatformSubscription.

### Testes E2E (Produção/Vercel)
- [ ] Fluxo completo de onboarding com plano gratuito (sem Asaas).
- [ ] Fluxo completo de onboarding com plano pago (validando chave Asaas em sandbox).
- [ ] Redirecionamento correto pós-login.

### Critério Soberano
- [ ] **Aprovação do Usuário**: Feature marcada como `/done 1` após validação funcional na URL da Vercel.
