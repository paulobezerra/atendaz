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

### 1. Autenticação (NextAuth v4 — stable)
- Integrar Google Provider.
- **Session Strategy**: **JWT** (sem adapter de banco). `googleId` (= `profile.sub`) liga o usuário ao `business`.
- **Callback de Login**: Se o usuário não existir no banco, ele é redirecionado para o onboarding. Se existir, vai para o dashboard.

### 2. Fluxo de Onboarding (Client-Side Wizard)
- **Passo 1: Identidade do Business**:
    - Nome Fantasia, Slug (validar contra lista de reservados e unicidade), **Segmento** (seleção obrigatória de lista controlada — coleção `segmento`; **sem texto livre**).
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

## UX (sobre o Design System — `docs/10`)

### Fluxo (jornada)
1. Acesso a `/` ou rota protegida sem sessão → redireciona para `/login`.
2. `/login` → "Entrar com Google" → OAuth.
3. Pós-login: sem `business` → `/onboarding`; com `onboardingStatus=COMPLETE` → `/dashboard`.
4. Wizard de 4 passos (Passo 3 condicional ao plano). Ao concluir, cria Business + Professional + PlatformSubscription e vai para `/dashboard`.

### Validações inline (onBlur) e erros
- **Slug**: normaliza e checa disponibilidade via `GET /api/onboarding/validate-slug`; erro abaixo do campo ("Slug já está em uso" / "Slug reservado").
- **Nome fantasia**: obrigatório (mín. 2). **Segmento**: obrigatório, da lista (`<select>`). **Plano**: seleção obrigatória.
- **Asaas** (se gated): chave obrigatória, validada no Asaas; erro abaixo do campo se inválida.
- Botão **Continuar/Concluir** desabilitado até o passo estar válido. Em falha de submit: preserva os dados e exibe toast de erro; sucesso → toast e redireciona.

### Telas (ASCII)
```
LOGIN                                 PASSO 1 — Identidade
┌───────────────────────────┐        ┌───────────────────────────────────┐
│          Atendaz          │        │ Bem-vindo ao Atendaz    Passo 1/4 │
│ Agenda + Cobrança + NFS-e │        │ Nome fantasia * [_______________] │
│                           │        │ Slug público  * [barbearia-do-ze] │
│  [ Entrar com Google ]    │        │ Segmento      * [ Selecione…   ▾] │ ← select (coleção segmento)
└───────────────────────────┘        │                   [ Continuar → ] │
                                      └───────────────────────────────────┘

PASSO 2 — Plano                       PASSO 3 — Faturamento (só se cobranca/nfse)
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│ Escolha um plano        Passo 2/4 │ │ Faturamento (Asaas)     Passo 3/4 │
│ (•) Agenda Simples  agenda  R$ 29 │ │ Chave API Asaas * [$aact_________]│
│ ( ) Cobrança+Nota   cob,…   R$ 39 │ │ (validada; armazenada cifrada)    │
│ ( ) Completo        todos   R$ 59 │ │ Estratégia NFS-e [ Automática  ▾] │ (só se nfse)
│ [ ← Voltar ]      [ Continuar → ] │ │ [ ← Voltar ]      [ Continuar → ] │
└───────────────────────────────────┘ └───────────────────────────────────┘

PASSO 4 — Profissional                DASHBOARD (placeholder)
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│ Profissional inicial    Passo 4/4 │ │ {Nome Fantasia}            [ Sair ]│
│ Nome * [ Seu nome              ]  │ │ /agendar/{slug}                   │
│ (criamos sua 1ª agenda)           │ │ Módulos: (agenda)(cobranca)…      │
│ [ ← Voltar ]        [ Concluir ✓ ]│ └───────────────────────────────────┘
└───────────────────────────────────┘
```
*Nota:* o indicador "Passo X/4" exibe **3 passos** quando o plano não exige faturamento (Passo 3 é pulado). Tokens (cores, inputs, botões, wizard) conforme `docs/10-design-system.md`.

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
