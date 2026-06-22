# Especificação: F1 — Login Google + Onboarding

> **Status:** a baseline **funcional** da F1 está concluída e **em produção** (validada no `/ssd-done 1`). Este documento incorpora o **redesign de UX (Split Layout)** — é o **novo escopo a implementar** (`/ssd-plan 1` → `/ssd-code 1`), pois o UX inicial ficou abaixo do esperado no gate de revisão.

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
- [ ] Golden Stack confirmada: Node 24, Next 16 (estável), React 19, NextAuth v4.

## Implementação Detalhada

### 1. Autenticação (NextAuth v4 — stable)
- Integrar Google Provider.
- **Session Strategy**: **JWT** (sem adapter de banco). `googleId` (= `profile.sub`) liga o usuário ao `business`.
- **Callback de Login**: Se o usuário não existir no banco, ele é redirecionado para o onboarding. Se existir, vai para o dashboard.

### 2. Fluxo de Onboarding (Client-Side Wizard)
- **Passo 1: Identidade do Business**:
    - Nome Fantasia, Slug (validar contra lista de reservados e unicidade; rota pública `/agendar/{slug}`), **Segmento** (seleção obrigatória de lista controlada — coleção `segmento`; **sem texto livre**).
- **Passo 2: Seleção de Plano**:
    - Listar planos da coleção `plano`.
    - Ao selecionar, copiar `modulos` do plano para o novo objeto `business`.
- **Passo 3: Configuração de Módulos (Gated)**:
    - Se `modulos.cobranca` ou `modulos.nfse` forem TRUE:
        - Pedir API Key do Asaas.
        - **Validação**: Testar a chave contra `ASAAS_BASE_URL/myAccount` (Sandbox/Prod conforme env).
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

> Todas as telas abaixo usam o **padrão Split Layout** definido em `docs/10-design-system.md`.
> Painel esquerdo: branding/stepper (indigo escuro). Painel direito: formulário (branco).
> Em mobile (< lg): painel esquerdo colapsa em header compacto; form em tela cheia.

---

### Fluxo (jornada)
1. Acesso a `/` ou rota protegida sem sessão → redireciona para `/login`.
2. `/login` → "Entrar com Google" → OAuth.
3. Pós-login: sem `business` → `/onboarding`; com `onboardingStatus=COMPLETE` → `/dashboard`.
4. Wizard de 4 passos (Passo 3 condicional ao plano). Ao concluir, cria Business + Professional + PlatformSubscription e vai para `/dashboard`.

---

### Validações inline (onBlur) e erros
- **Slug**: normaliza e checa disponibilidade via `GET /api/onboarding/validate-slug`; erro abaixo do campo ("Slug já está em uso" / "Slug reservado").
- **Nome fantasia**: obrigatório (mín. 2). **Segmento**: obrigatório, da lista (`<select>`). **Plano**: seleção obrigatória.
- **Asaas** (se gated): chave obrigatória, validada no Asaas; erro abaixo do campo se inválida.
- Botão **Continuar/Concluir** desabilitado até o passo estar válido. Em falha de submit: preserva os dados e exibe toast de erro; sucesso → toast e redireciona.

---

### Telas (ASCII — Split Layout)

#### `/login`

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│   ◈ Atendaz                  │                              │
│                              │   Bom te ver por aqui       │
│   Agenda inteligente,        │   Entre com sua conta para  │
│   cobrança automática        │   acessar o painel.         │
│   e NFS-e integrada.         │                             │
│                              │   ┌──────────────────────┐  │
│   ────────────────────────   │   │  G  Entrar com Google │  │
│                              │   └──────────────────────┘  │
│   ✓  Agendamento online      │                              │
│      em 2 minutos            │   Ao entrar, você concorda  │
│                              │   com os Termos de Uso e    │
│   ✓  Cobrança via Pix e      │   Política de Privacidade.  │
│      cartão sem esforço      │                              │
│                              │                              │
│   ✓  NFS-e emitida           │                              │
│      automaticamente         │                              │
│                              │                              │
│   ────────────────────────   │                              │
│   500+ negócios já usam      │                              │
│   o Atendaz                  │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Comportamento painel esquerdo:** os três bullets aparecem com fade-in sequencial (150ms delay entre cada). Fundo: `bg-gradient-to-br from-indigo-700 to-indigo-900`. Texto branco / indigo-200.

**Comportamento painel direito:** botão "Entrar com Google" estilizado com ícone SVG do Google; width 100% do `max-w-sm`; ao clicar dispara o fluxo OAuth.

---

#### `/onboarding` — Passo 1: Identidade

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│   ◈ Atendaz                  │   Configure sua identidade  │
│                              │   Como seu negócio vai      │
│   ◉ Identidade    ← atual    │   aparecer para os clientes.│
│   │ Dê um nome e             │                              │
│   │ endereço ao negócio      │   Nome fantasia *            │
│   │                          │   [______________________]  │
│   ○  Plano                   │                              │
│   │                          │   Endereço público (slug) *  │
│   ○  Faturamento             │   /agendar/[_______________] │
│   │                          │   Verificando disponibilidade│
│   ○  Profissional            │                              │
│                              │   Segmento *                 │
│                              │   [ Selecione seu segmento ▾]│
│                              │                              │
│   ────────────────────────   │                              │
│   Leva menos de 5 minutos   │        [ Continuar →  ]      │
│   para estar no ar.          │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Stepper:** Identidade = atual (◉ branco, texto branco bold + descrição indigo-200); Plano/Faturamento/Profissional = futuros (○ outline, texto indigo-300 opacidade 60%).

**Slug:** gerado automaticamente ao digitar o nome (debounce 400ms); editável; validado onBlur contra a API.

---

#### `/onboarding` — Passo 2: Plano

> Preços/nomes/módulos vêm da coleção `plano` (seed atual: **Agenda Simples R$ 29 · Cobrança + Nota R$ 39 · Completo R$ 59**). Os valores no mockup abaixo são ilustrativos.

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│   ◈ Atendaz                  │   Escolha seu plano         │
│                              │   Você pode mudar depois.   │
│   ● Identidade       ✓       │                              │
│   │                          │   ┌────────────────────┐    │
│   ◉ Plano         ← atual    │   │ (•) Agenda Simples  │    │
│   │ Selecione o que          │   │     Agendamento     │    │
│   │ melhor se encaixa        │   │     online básico   │    │
│   │                          │   │     R$ 29/mês       │    │
│   ○  Faturamento             │   ├────────────────────┤    │
│   │                          │   │ ( ) Cobrança + Nota │    │
│   ○  Profissional            │   │     Pix, cartão e   │    │
│                              │   │     nota fiscal     │    │
│                              │   │     R$ 39/mês       │    │
│   ────────────────────────   │   ├────────────────────┤    │
│   Sem fidelidade.            │   │ ( ) Completo        │    │
│   Cancele quando quiser.     │   │     Tudo incluído   │    │
│                              │   │     R$ 59/mês       │    │
│                              │   └────────────────────┘    │
│                              │                              │
│                              │  [ ← Voltar ] [ Continuar →]│
└──────────────────────────────┴──────────────────────────────┘
```

**Cards de plano:** selecionável por clique em todo o card; selecionado → borda `border-primary` + fundo `indigo-50`; rádio visível no canto superior esquerdo. Módulos habilitados exibidos como badges abaixo da descrição.

---

#### `/onboarding` — Passo 3: Faturamento *(condicional — pulado se o plano não tiver `cobranca`/`nfse`)*

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│   ◈ Atendaz                  │   Configure o faturamento   │
│                              │   Conecte sua conta Asaas   │
│   ● Identidade       ✓       │   para cobrar seus clientes.│
│   │                          │                              │
│   ● Plano            ✓       │   Chave API Asaas *         │
│   │                          │   [$aact________________]   │
│   ◉ Faturamento   ← atual    │   ✓ Chave validada          │
│   │ Conecte sua conta        │   (ou: ✗ Chave inválida)    │
│   │ Asaas                    │                              │
│   │                          │   Estratégia de NFS-e *     │
│   ○  Profissional            │   [ Automática           ▾] │
│                              │   ← só aparece se nfse=true  │
│   ────────────────────────   │                              │
│   Sua chave é armazenada     │                              │
│   com criptografia AES-256.  │  [ ← Voltar ] [ Continuar →]│
│   Nunca compartilhamos.      │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Chave Asaas:** campo `type="password"` com toggle de visibilidade; validação via chamada ao Asaas disparada onBlur; spinner no campo durante a validação; ícone ✓/✗ e mensagem abaixo após retorno. Texto de confiança no painel esquerdo reforça a segurança.

---

#### `/onboarding` — Passo 4: Profissional

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│   ◈ Atendaz                  │   Último passo! 🎉           │
│                              │   Criamos sua primeira      │
│   ● Identidade       ✓       │   agenda automaticamente.   │
│   │                          │                              │
│   ● Plano            ✓       │   Seu nome *                 │
│   │                          │   [ Maria Silva           ]  │
│   ● Faturamento      ✓       │   ← pré-preenchido do Google │
│   │                          │                              │
│   ◉ Profissional  ← atual    │   Você poderá adicionar mais │
│     Confirme seu nome        │   profissionais depois, no   │
│                              │   painel de configurações.   │
│                              │                              │
│   ────────────────────────   │                              │
│   Pronto para receber        │  [ ← Voltar ] [ Concluir ✓] │
│   seus primeiros clientes.   │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Ao clicar em "Concluir":** botão muda para spinner + "Configurando…"; criação de Business + Professional + PlatformSubscription; redireciona para `/dashboard` com toast "Tudo pronto! Bem-vindo ao Atendaz 🎉".

---

### Mobile (< 1024px) — comportamento do split

O painel esquerdo colapsa em um **header fixo compacto**:

```
┌──────────────────────────────────────────┐
│  ◈ Atendaz          ● Identidade (1/4)   │  ← bg indigo, texto branco, altura 56px
├──────────────────────────────────────────┤
│                                          │
│  Configure sua identidade                │
│  Como seu negócio vai aparecer...        │
│                                          │
│  Nome fantasia *                         │
│  [__________________________________]   │
│                                          │
│  Endereço público *                      │
│  [__________________________________]   │
│                                          │
│  Segmento *                              │
│  [__________________________________]   │
│                                          │
│  [ Continuar →                        ]  │  ← full width
└──────────────────────────────────────────┘
```

---

## Regras de Negócio e Conflitos Identificados
- **Multi-tenant**: O `googleId` deve ser a chave de ligação entre o usuário autenticado e o `business`.
- **Modularidade**: Se o plano não tiver `cobranca`/`nfse` (ex.: "Agenda Simples"), o Passo 3 é ocultado (stepper exibe 3 passos em vez de 4).
- **Idempotência**: O processo de criação do Business deve ser transacional ou protegido contra duplicidade caso o usuário atualize a página no meio do processo.
- **Segurança**: Chaves Asaas NUNCA devem transitar ou ser armazenadas em texto plano.

## Verificação e DOD (Definition of Done)

### Testes de Integração (Local)
- [ ] Sucesso no Login Google (Mock/Provider).
- [ ] Validação de Slug (não permitir 'admin', 'api', etc).
- [ ] Criptografia da chave Asaas (deve ser diferente no banco e na memória).
- [ ] Criação correta de Business + Professional + PlatformSubscription.

### Testes E2E (Stage/Produção)
- [ ] Fluxo completo de onboarding com plano gratuito (sem Asaas).
- [ ] Fluxo completo de onboarding com plano pago (validando chave Asaas em sandbox).
- [ ] Redirecionamento correto pós-login.
- [ ] Split layout renderiza corretamente em 1280px, 1024px e 375px.
- [ ] Stepper reflete estado correto em cada passo (concluído/atual/futuro).

### Critério Soberano
- [ ] **Aprovação do Usuário**: Feature marcada como `/ssd-done 1` após validação funcional na URL da Vercel.
