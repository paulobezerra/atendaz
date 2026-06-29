# Design System & Fundação de UX

Fundação **global** de UX, escrita uma vez e reusada por todas as features. Define **como** as coisas parecem e se comportam por padrão. O **desenho de cada tela/fluxo** fica na seção `## UX` de cada spec (`docs/spec/F{ID}`), referenciando estes tokens — ver [docs/00 → UX e Design System](00-agent-instructions.md#ux-e-design-system).

Stack: **Tailwind CSS** + **shadcn/ui** (componentes), **react-hook-form + Zod** (formulários) e **TanStack Query/Table** (dados e listas). Os tokens abaixo mapeiam para classes utilitárias e para as CSS variables do shadcn; quando fizer sentido, centralizar no `tailwind.config.ts`. A adoção dessa fundação foi decidida na **Fase 2.5** — ver [`docs/spec/F0002.5-ux-revamp.md`](spec/F0002.5-ux-revamp.md).

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

## Fundação de Componentes (shadcn/ui + react-hook-form + TanStack)

> A partir da **Fase 2.5**, **não reinventar a roda**: usar componentes prontos e padrões
> reusáveis em vez de recriar formulários/listas a cada tela (DRY).

- **shadcn/ui** é a fonte dos componentes de UI (copiados para o repo via CLI, sobre
  **Radix UI** + `class-variance-authority` + `tailwind-merge` + `clsx`). Ícones via
  **lucide-react**. Os componentes base abaixo descrevem o **resultado visual esperado**;
  a implementação concreta usa os componentes shadcn estilizados com os tokens acima.
- **Formulários**: **react-hook-form** + resolver **Zod**, reusando os **mesmos schemas Zod**
  já usados na validação das rotas. Um único `<Form>` (shadcn) com `FormField`/`FormItem`/
  `FormLabel`/`FormDescription`/`FormMessage` — nunca montar inputs+validação à mão.
- **Dados e listas**: **@tanstack/react-query** para fetch/cache/estados (loading/error/
  invalidação) e **@tanstack/react-table** para tabelas (ordenação/paginação), estilizadas
  com o `Table` do shadcn. Evitar `useEffect`+`fetch` manuais.
- **DRY de UI**: padrões repetidos (form em card, página de lista com toolbar, dialog de
  confirmação, estado vazio) viram componentes/utilitários compartilhados, não cópias.

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

## Padrão: App Shell (área autenticada)

Usado em **todas as rotas internas** (pós-login): `/dashboard` e tudo sob ele. O Split Layout é **exclusivo** de `/login` e `/onboarding`; a partir do momento em que o usuário tem um `business` configurado, a navegação passa para o **App Shell**.

O padrão segue as convenções consagradas de SaaS (Asana, Linear, Stripe Dashboard): navegação **persistente e sempre visível** no desktop, com hierarquia rasa e rótulos claros, de modo que o usuário reconheça o que fazer por experiência prévia com outras aplicações — sem precisar de tutorial. Aplica **progressive disclosure**: o menu mostra apenas os módulos ativos do `business`; o que está desabilitado não aparece (alinhado ao Guardrail 2).

### Estrutura (desktop ≥ 1024px)
```
┌────────────┬─────────────────────────────────────┐
│  SIDEBAR   │  TOPBAR (nome do negócio · usuário)  │
│  (fixa,    ├─────────────────────────────────────┤
│  240px)    │  Breadcrumb / Título da página      │
│            │                                     │
│  ◈ Atendaz │  ┌───────────────────────────────┐  │
│            │  │                               │  │
│  Itens de  │  │   Conteúdo (max-w-5xl,        │  │
│  navegação │  │   scroll independente)        │  │
│  (só       │  │                               │  │
│  módulos   │  └───────────────────────────────┘  │
│  ativos)   │                                     │
│            │                                     │
│  ─ Sair    │                                     │
└────────────┴─────────────────────────────────────┘
```

### Sidebar (desktop)
- Largura fixa `~240px`, full-height, `bg-white` com `border-r border-gray-200` (ou Primary Dark se a identidade pedir — manter consistência com o branding do split).
- Logo no topo; lista vertical de itens de navegação (ícone + label).
- **Item ativo**: fundo `indigo-50` + texto/ícone `primary` + barra/realce à esquerda. Demais itens: texto Muted, hover escurece.
- **Apenas módulos ativos** do `business` aparecem (progressive disclosure). Itens sempre presentes: *Profissionais*, *Configurações*. Condicionais: *Serviços*/*Agenda* (se `agenda`), *Cobrança* (se `cobranca`), *Notas* (se `nfse`), *Financeiro* (se `financeiro` — **item de menu próprio**, ver F0013).
- **Configurações** (sempre visível) é o **menu de configuração da clínica/empresa**: identidade do negócio, **Meio de Pagamento e NFS-e** (integração Asaas — ver F0002.7), plano/cobrança da plataforma (F0011) e demais ajustes. Nunca expor o termo técnico "Asaas" como rótulo de navegação.
- Rodapé da sidebar: usuário (foto Google + nome) e ação **Sair**.

### Topbar
- Faixa superior fina com o **nome fantasia** do negócio à esquerda e o `/agendar/{slug}` em Muted; à direita, conta do usuário.
- Abaixo da topbar (ou integrado a ela), **título da página atual** e breadcrumb quando houver navegação aninhada (ex.: *Profissionais › Editar*).

### Mobile (< 1024px)
- Sidebar **colapsa**. Navegação principal vira uma **bottom tab bar** fixa (thumb-reach) com os **3–5 itens principais** (ícone + label curto); item ativo destacado em `primary`. Esse é o padrão mais reconhecível e ergonômico em mobile para apps de uso frequente.
- Itens excedentes (além de 5) e ações secundárias (Configurações, Sair) ficam atrás de um item **"Mais"** (sheet/drawer) — nunca esconder ações de alta frequência.
- Topbar compacta (altura ~56px): nome do negócio + menu da conta.
- Conteúdo ocupa 100% da largura; botões `full-width`; alvos de toque ≥ 44px.

### Princípios (herdados das referências de UX premiadas)
- **Reconhecimento, não memorização**: rótulos textuais + ícones convencionais; nada de jargão interno.
- **Sempre saber onde está**: item ativo evidente + breadcrumb nas telas aninhadas.
- **Hierarquia rasa**: evitar menus aninhados profundos; preferir agrupamento simples.
- **Estados completos**: toda lista trata loading / empty / error (ver Padrões de UX globais).

## Padrões de UX (globais)
- **Copy explicativa (não deixar o usuário adivinhar)**: toda tela/formulário tem **subtítulo de contexto** (o que é e por que preencher); campos não óbvios têm **helper text** (`FormDescription`) e `placeholder` de exemplo; toda lista vazia tem **mensagem + CTA**; ações destrutivas têm texto de confirmação claro. Linguagem simples, em português, sem jargão interno.
- **Tooltips para jargão**: o usuário é especialista no negócio dele, **não** no nosso vocabulário. Termos do produto (ex.: **segmento**, **endereço público/slug**, **Asaas**, **NFS-e**, **estratégia de NFS-e**) recebem um **ícone de ajuda** (`ⓘ`, `Tooltip` do shadcn) ao lado do label, explicando **o que é** e **o que preencher**. Tooltip nunca esconde informação essencial — é reforço, não substituto da copy.
- **Máscaras de input**: campos de formato conhecido aplicam máscara para facilitar o preenchimento — **telefone/WhatsApp** `(00) 00000-0000`, **CPF** `000.000.000-00`, **CNPJ** `00.000.000/0000-00`, **CEP** `00000-000`, valores em **R$**. A máscara é de apresentação; persistir o valor normalizado.
- **Tipo de pessoa (PF/PJ)**: **nunca** um único campo que sirva para CPF *e* CNPJ. Um **switch/segmented control** "Pessoa Física / Pessoa Jurídica" decide o tipo (`tipoPessoa`), e o campo de documento troca máscara e validação conforme a escolha.
- **Ícones**: biblioteca padrão **lucide-react** em toda a interface (consistência visual); evitar SVGs avulsos ou ícones de fontes diferentes.
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
