# Design System & Fundação de UX

Fundação **global** de UX, escrita uma vez e reusada por todas as features. Define **como** as coisas parecem e se comportam por padrão. O **desenho de cada tela/fluxo** fica na seção `## UX` de cada spec (`docs/spec/F{ID}`), referenciando estes tokens — ver [docs/00 → UX e Design System](00-agent-instructions.md#ux-e-design-system).

Stack: **Tailwind CSS**. Os tokens abaixo mapeiam para classes utilitárias; quando fizer sentido, centralizar no `tailwind.config.ts`.

## Design Tokens

### Cores
> ⚠️ **Cor primária = decisão de identidade pendente** (default abaixo, ajustável pelo usuário).
- **Primary**: `#4F46E5` (indigo-600) · hover `#4338CA` (indigo-700)
- **Primary Dark**: `#3730A3` (indigo-800) — usado no painel esquerdo do split layout
- **Danger**: `#DC2626` (red-600)
- **Success**: `#059669` (emerald-600)
- **Warning**: `#D97706` (amber-600)
- **Background**: `#F9FAFB` (gray-50)
- **Surface**: `#FFFFFF`
- **Text**: `#111827` (gray-900) · **Muted**: `#6B7280` (gray-500)
- **Border**: `#E5E7EB` (gray-200)
- **Panel text (sobre escuro)**: `#FFFFFF` (título) · `#C7D2FE` (indigo-200, subtexto/muted)

### Tipografia
- Fonte: **Inter** (Google Fonts — `font-sans`)
- H1: 24px / 700 · H2: 20px / 600 · H3: 16px / 600
- Body: 14px / 400 · Label: 12px / 500
- Muted/auxiliar: 12–14px, cor Muted
- **Painel esquerdo (branding)**: título do produto 28–32px / 700 · tagline 16px / 400

### Espaçamento & Forma
- Unidade base: 4px (escala Tailwind)
- Padding de card: 24px (`p-6`) · Gap entre campos: 16px (`gap-4`)
- Radius: 8px (`rounded-lg`) · pílulas/badges: `rounded-full`
- Sombra de card: `shadow-sm` sobre `border border-gray-200`

## Componentes Base
- **Input/Select**: altura 40px (`h-10`), `border border-gray-300 rounded-lg px-3`, foco `focus:border-primary focus:ring-1`. Label acima, erro abaixo (texto `text-red-600 text-xs`).
- **Button primary**: `bg-primary text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-60`.
- **Button secondary/ghost**: texto Muted, sem fundo; hover escurece.
- **Card**: `rounded-2xl border border-gray-200 bg-white p-6 shadow-sm`.
- **Badge**: `rounded-full px-3 py-1 text-xs font-medium`.
- **Toast**: bottom-right, auto-dismiss 4s; sucesso/erro com cor correspondente.
- **Wizard (multi-step)**: stepper lateral no painel esquerdo (ver padrão Split Layout abaixo); botões **Voltar** (ghost) / **Continuar** (primary) no painel direito; validação por passo antes de avançar.

## Padrão: Split Layout (Auth + Onboarding)

Usado em `/login` e `/onboarding`. **Nunca** usar caixa centralizada isolada nessas rotas.

### Estrutura
```
[  Painel Esquerdo — 50%  ] [  Painel Direito — 50%  ]
  bg: Primary Dark (indigo)    bg: white / gray-50
  posição: fixed, full-height  scroll independente se form longo
```

### Painel Esquerdo (branding / contexto)
- Background: gradiente sutil de `indigo-700` → `indigo-900` (`bg-gradient-to-br from-indigo-700 to-indigo-900`)
- Logo no topo (texto ou SVG)
- Título do produto + tagline centralizados verticalmente
- **Na tela de login**: 3 bullets com os diferenciais do produto (ícone + texto)
- **No wizard de onboarding**: substitui os bullets pelo **stepper vertical** de passos (ver abaixo)
- Rodapé: frase curta de confiança (ex.: "Mais de 500 negócios confiam no Atendaz")
- Texto sobre fundo escuro: branco / indigo-200

### Painel Direito (formulário)
- Background: `bg-white`
- Conteúdo centralizado verticalmente com `max-w-md mx-auto px-8`
- Título da ação (ex.: "Crie sua conta", "Configure sua identidade")
- Subtítulo opcional em Muted
- Form / conteúdo do passo
- Botões de ação no rodapé do painel

### Stepper vertical (painel esquerdo no wizard)
Cada item representa um passo. Estado visual:
- **Concluído** `✓`: círculo preenchido indigo-400 + texto indigo-200 + linha conectora sólida
- **Atual**: círculo branco com borda branca + label branco / 600 + descrição breve indigo-200
- **Futuro**: círculo outline indigo-400 + texto indigo-300 opacidade 60%

```
  ●  Identidade          ← concluído (círculo preenchido)
  │
  ◉  Plano               ← atual (círculo branco + texto branco bold)
  │  Configure seu plano de acesso
  │
  ○  Faturamento         ← futuro (outline)
  │
  ○  Profissional
```

### Responsividade
- **≥ lg (1024px)**: split 50/50 side-by-side
- **< lg**: painel esquerdo colapsa em **header compacto** (logo + nome do passo atual); form ocupa 100% da tela
- Botões `full-width` no mobile

## Padrões de UX (globais)
- **Validação inline**: validar ao sair do campo (`onBlur`); mensagem específica abaixo do campo. Botão primário desabilitado até o passo/form estar válido.
- **Estados de tela**: sempre tratar **loading** (skeleton/spinner), **empty** (mensagem + CTA) e **error** (mensagem + ação de retry). Nunca tela "morta".
- **Feedback de ação**: sucesso/erro via toast; em falha de submit, **preservar** o que o usuário preencheu.
- **Listas controladas**: campos de domínio fechado (ex.: segmento, plano, estratégia de NFS-e) usam `<select>`/opções vindas do **banco** — **nunca** texto livre.
- **Mobile-first**: layout em coluna única no mobile; botões `full-width`; alvos de toque ≥ 40px.
- **Acessibilidade**: todo input com `label`; foco visível; contraste mínimo AA; navegação por teclado.

## Convenção de "Tela" na spec (ASCII)
Cada tela na seção `## UX` usa o layout split. O painel esquerdo é desenhado uma vez; o direito varia por passo. Exemplo:

```
## Tela: /onboarding — Passo 2 (Plano)

┌──────────────────────────┬──────────────────────────────┐
│  ◉ Atendaz               │  Escolha seu plano           │
│                          │  Selecione o que melhor      │
│  ● Identidade      ✓     │  se encaixa no seu negócio.  │
│  │                       │                              │
│  ◉ Plano           ←     │  (•) Agenda Simples  R$ 29   │
│  │ Configure seu   atual │  ( ) Cobrança+Nota   R$ 39   │
│  │ plano de acesso       │  ( ) Completo        R$ 59   │
│  │                       │                              │
│  ○ Faturamento           │  [ ← Voltar ]  [ Continuar →]│
│  │                       │                              │
│  ○ Profissional          │                              │
│                          │                              │
│  500+ negócios confiam   │                              │
└──────────────────────────┴──────────────────────────────┘
```

## O que isto NÃO resolve
Decisões visuais muito específicas (ícones exatos, ilustrações, microanimações) — descrever em prosa na seção `## UX` da spec ou aceitar uma escolha razoável do agente.
