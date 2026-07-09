# [CONCLUÍDO] Especificação: F0001 — Login Google + Onboarding

> **Status:** F1 concluída e **em produção** (Split Layout) — validado no `/p2s-done 1`.
> ⚠️ **Revisão pendente na Fase 2.6 (F0002.6):** o fluxo abaixo será simplificado para
> **onboarding minimalista** (ver seção logo abaixo). As telas de Plano e Faturamento
> originais ficam registradas como histórico, mas **deixam de fazer parte do onboarding**.

## Revisão de UX (Fase 2.6) — Onboarding Minimalista

Decisão (`/p2s-doc UX`): **deixar o usuário começar a usar o quanto antes** e só decidir
plano/pagamento depois de experimentar. O onboarding **não** escolhe plano nem pede Asaas.

**Novo fluxo (alvo da F0002.6):**
1. **Único passo — Identidade**: nome fantasia, **endereço público (slug)**, **segmento**
   e **seu nome** (profissional inicial, pré-preenchido do Google). Termos com **tooltip**
   de ajuda; campos com formato conhecido usam **máscara** (ver `docs/project/base/design-system.md`).
2. Ao concluir, cria: `business` (com **sistema completo habilitado** durante o trial —
   `modulos` todos `true`, `planoId: null`), o 1º `professional`, e
   `platform_subscription` com `status: TRIAL` e `planoId: null`. Redireciona ao Dashboard.
3. **Plano e pagamento** são escolhidos **depois**, no painel (quadro comparativo) — ver
   **[`F0011-platform-subscription.md`](F0011-platform-subscription.md)**.
4. **Meio de pagamento (Asaas)** deixa de ser obrigatório em qualquer caso. É configurado
   **quando o usuário quiser** usar cobrança/NFS-e, em **Configurações ▸ "Configurar Meio
   de Pagamento e NFS-e"** (opcional, com aviso de que cobrança/NFS-e só funcionam após
   conectar). Sem jargão "Asaas" como rótulo — ver F0002.8. Nada disso no onboarding.

O restante desta spec (abaixo) é o desenho **original** da F1; vale como histórico e para
as partes que permanecem (login Google, identidade, criação de business/professional).

## Escopo
- Autenticação de usuários donos de `business` via Google.
- Fluxo de configuração inicial (Onboarding) **minimalista** para novos Tenants — só identidade.
- Provisionamento do primeiro `professional`.
- ~~Escolha de Plano Comercial~~ → movida para o painel (F0011).
- ~~Configuração de Faturamento (Asaas) e Dados Fiscais~~ → movida para Configurações, opcional.
- Trial habilita o **sistema completo**; módulos passam a refletir o plano só após a escolha.

## DOR (Definition of Ready)
- [ ] Spec validada contra Guardrails e Modelo de Dados.
- [ ] Plano de execução detalhado em `docs/project/plans/archive/01-onboarding.md`.
- [ ] Variáveis de ambiente configuradas: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `CRYPTO_MASTER_KEY`, `ASAAS_BASE_URL`.
- [ ] Golden Stack confirmada: Node 24, Next 16 (estável), React 19, NextAuth v4.

## Implementação Detalhada

### 1. Autenticação (NextAuth v4 — stable)
- Integrar Google Provider.
- **Session Strategy**: **JWT** (sem adapter de banco). `googleId` (= `profile.sub`) liga o usuário ao `business`.
- **Callback de Login**: Se o usuário não existir no banco, ele é redirecionado para o onboarding. Se existir, vai para o dashboard.

### 2. Fluxo de Onboarding — **revisado na F0002.6 (minimalista)**
- **Passo único: Identidade do Business**:
    - Nome Fantasia, Slug (validar contra lista de reservados e unicidade; rota pública `/agendar/{slug}`), **Segmento** (seleção obrigatória de lista controlada — coleção `segmento`; **sem texto livre**) e **Seu nome** (profissional inicial, pré-preenchido do Google).
    - Termos de jargão (segmento, endereço público) com **tooltip**; nada de plano nem Asaas aqui.
- ~~**Passo 2: Seleção de Plano**~~ → **removido do onboarding**. Plano é escolhido no painel, em quadro comparativo (ver F0011). Durante o trial, `business.modulos` = **todos `true`** (sistema completo) e `planoId: null`.
- ~~**Passo 3: Configuração de Módulos / Asaas**~~ → **removido do onboarding**. A chave Asaas, `nfseStrategy` e `codigosFiscais` passam a ser configurados **opcionalmente** em Configurações do painel, quando o usuário for usar cobrança/NFS-e (mantendo a criptografia AES-256-GCM via `CRYPTO_MASTER_KEY`).
- **Profissional Inicial** (no mesmo passo): criar automaticamente 1 `professional` vinculado ao `business`, nome do campo "Seu nome" (editável), ativo por padrão.

### 3. Finalização
- Criar documento `business` com `onboardingStatus: 'COMPLETE'`, `planoId: null` e `modulos` **completos** (trial).
- Criar documento `platform_subscription` com `status: TRIAL` (30 dias) e `planoId: null`.
- Redirecionar para o Dashboard.

## UX (sobre o Design System — `docs/project/base/design-system.md`)

> Todas as telas abaixo usam o **padrão Split Layout** definido em `docs/project/base/design-system.md`.
> Painel esquerdo: branding/stepper (indigo escuro). Painel direito: formulário (branco).
> Em mobile (< lg): painel esquerdo colapsa em header compacto; form em tela cheia.

---

### Fluxo (jornada) — **revisado na F0002.6**
1. Acesso a `/` ou rota protegida sem sessão → redireciona para `/login`.
2. `/login` → "Entrar com Google" → OAuth.
3. Pós-login: sem `business` → `/onboarding`; com `onboardingStatus=COMPLETE` → `/dashboard`.
4. **Onboarding de passo único** (Identidade). Ao concluir, cria Business (trial completo) + Professional + PlatformSubscription (TRIAL, sem plano) e vai para `/dashboard`. Plano/pagamento e Asaas ficam para depois, no painel.

---

### Validações inline (onBlur) e erros — **revisado na F0002.6**
- **Slug**: normaliza e checa disponibilidade via `GET /api/onboarding/validate-slug`; erro abaixo do campo ("Slug já está em uso" / "Slug reservado"). Label com **tooltip** explicando "endereço público".
- **Nome fantasia**: obrigatório (mín. 2). **Segmento**: obrigatório, da lista (`<select>`), com **tooltip** explicando o termo. **Seu nome**: obrigatório (vira o 1º profissional).
- ~~**Plano**~~ e ~~**Asaas**~~ não fazem parte do onboarding (movidos para o painel — F0011 e Configurações).
- Botão **Concluir** desabilitado até o passo estar válido. Em falha de submit: preserva os dados e exibe toast de erro; sucesso → toast e redireciona.

---

### Telas (ASCII — Split Layout)

> ⚠️ **F0002.6:** a tela de onboarding válida é a **única (Identidade)** logo abaixo.
> As telas de **Plano (Passo 2)** e **Faturamento (Passo 3)** ficam como **histórico** —
> não fazem mais parte do onboarding (Plano → painel/F0011; Asaas → Configurações).

#### `/onboarding` — Passo único (Identidade) **[F0002.6]**

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│   ◈ Atendaz                  │   Vamos configurar seu       │
│                              │   negócio                    │
│   Comece em 1 minuto.        │   Leva 1 minuto. Você pode  │
│   Configure o resto          │   ajustar tudo depois.       │
│   quando quiser.             │                              │
│                              │   Nome fantasia *            │
│   ✓ Sem plano agora —        │   [______________________]  │
│     teste tudo no trial      │                              │
│                              │   Endereço público (slug) ⓘ*│
│   ✓ Conecte pagamentos       │   /agendar/[_______________] │
│     só quando precisar       │   Verificando disponibilidade│
│                              │                              │
│                              │   Segmento ⓘ *               │
│                              │   [ Selecione seu segmento ▾]│
│   ────────────────────────   │                              │
│   Seu sistema completo,      │   Seu nome *                 │
│   liberado no trial.         │   [ Maria Silva           ]  │
│                              │   Será seu primeiro          │
│                              │   profissional (edite depois)│
│                              │                              │
│                              │        [ Concluir ✓ ]        │
└──────────────────────────────┴──────────────────────────────┘
```

**Tooltips (ⓘ):** "Endereço público" = o link que seus clientes usam para agendar
(`atendaz.com/agendar/seu-slug`). "Segmento" = a área de atuação do seu negócio (ex.:
barbearia, clínica), usada para personalizar a experiência. **Ao concluir:** cria Business
(trial completo) + Professional + PlatformSubscription (TRIAL, sem plano) → `/dashboard`
com toast "Tudo pronto! Bem-vindo ao Atendaz 🎉".

---

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

#### `/onboarding` — Passo 1: Identidade *(histórico — pré-F0002.6)*

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

#### `/onboarding` — Passo 2: Plano *(histórico — removido na F0002.6; ver F0011)*

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

#### `/onboarding` — Passo 3: Faturamento *(histórico — removido na F0002.6; Asaas vai para Configurações)*

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

#### `/onboarding` — Passo 4: Profissional *(histórico — fundido ao passo único na F0002.6)*

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
- [ ] **Aprovação do Usuário**: Feature marcada como `/p2s-done 1` após validação funcional na URL da Vercel.
