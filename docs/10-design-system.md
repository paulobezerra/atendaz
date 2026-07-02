# Design System & Fundação de UX

Fundação **global** de UX, escrita uma vez e reusada por todas as features. Define **como** as coisas parecem e se comportam por padrão. O **desenho de cada tela/fluxo** fica na seção `## UX` de cada spec (`docs/spec/F{ID}`), referenciando estes tokens — ver [docs/00 → UX e Design System](00-agent-instructions.md#ux-e-design-system).

> ⚠️ Telas **novas ou refeitas** não vão direto para código a partir do ASCII da spec: passam antes por
> **protótipo HTML estático aprovado** em [`templates/prototipos/`](../templates/prototipos/) — ver
> [docs/00 → Prototipação de Telas](00-agent-instructions.md#prototipação-de-telas-obrigatória-para-telas-novas-ou-refeitas).
> Tudo em uma única pasta `templates/` (minúsculo), com dois propósitos distintos:
> [`templates/referencia/`](../templates/referencia/) é a referência visual **fixa** de design
> (landing/dashboard de exemplo, não muda por feature); [`templates/prototipos/`](../templates/prototipos/)
> é o **workspace vivo** de protótipos por tela, em refinamento até aprovação.

Stack: **Tailwind CSS** + **shadcn/ui** (componentes), **react-hook-form + Zod** (formulários) e **TanStack Query/Table** (dados e listas). Os tokens abaixo mapeiam para classes utilitárias e para as CSS variables do shadcn; quando fizer sentido, centralizar no `tailwind.config.ts`. A adoção dessa fundação foi decidida na **Fase 2.5** — ver [`docs/spec/F0002.5-ux-revamp.md`](spec/F0002.5-ux-revamp.md).

## Design Tokens

### Cores
> ✅ **Identidade confirmada**: primary indigo `#4F46E5`, conforme o `templates/referencia/` e o logo aprovado.
- **Primary**: `#4F46E5` (indigo-600) · hover `#4338CA` (indigo-700)
- **Primary Dark**: `#3730A3` (indigo-800) — realces/hover escuros (não há mais painel roxo full-screen)
- **Danger**: `#DC2626` (red-600)
- **Success**: `#059669` (emerald-600)
- **Warning**: `#D97706` (amber-600)
- **Background**: `#F9FAFB` (gray-50)
- **Surface**: `#FFFFFF`
- **Text**: `#111827` (gray-900) · **Muted**: `#6B7280` (gray-500)
- **Border**: `#E5E7EB` (gray-200)
- **Texto sobre fundo escuro (faixa CTA)**: `#FFFFFF` (título) · `#C7D2FE` (indigo-200, subtexto/muted)

### Tipografia
- Fonte: **Inter** (Google Fonts — `font-sans`)
- H1: 24px / 700 · H2: 20px / 600 · H3: 16px / 600
- Body: 14px / 400 · Label: 12px / 500
- Muted/auxiliar: 12–14px, cor Muted
- **Painel esquerdo (branding)**: título do produto 28–32px / 700 · tagline 16px / 400

### Espaçamento & Forma
- Unidade base: 4px (escala Tailwind)
- Padding de card: 24px (`p-6`) · Gap entre campos: 16px (`gap-4`)
- Radius: 8px (`rounded-lg`) inputs/botões · **`rounded-2xl` (16px) para cards/painéis** · pílulas/badges: `rounded-full`
- Sombra de card: `shadow-sm` sobre `border border-gray-200`; **elevar** em hover de card clicável (`hover:shadow-md`) e em destaques (`shadow-lg`).

## Referências visuais e direção estética (revamp)

> **`templates/referencia/` é a fonte da verdade visual do produto.** Os protótipos navegáveis
> [`templates/referencia/landing.html`](../templates/referencia/landing.html) e [`templates/referencia/dashboard.html`](../templates/referencia/dashboard.html)
> definem o alvo concreto de acabamento — abrir no navegador. **A aplicação real deve reproduzi-los o
> mais fielmente possível**: mesmas **cores**, mesmo **logo**, mesma **tipografia**, mesmos **componentes**,
> mesmos espaçamentos/radius/sombras e o mesmo "aspecto" geral. Isso vale para **todas as superfícies** —
> não só as duas páginas de exemplo, mas **formulários, listas/tabelas, dashboard, telas de configuração
> e onboarding**. A meta continua sendo o **acabamento de um bom template shadcn** (respiro generoso,
> hierarquia tipográfica forte, cards arredondados com borda sutil, cor com parcimônia, microdetalhes) —
> e o `templates/referencia/` é a materialização exata desse acabamento a ser copiada.
>
> **Regra prática**: ao construir qualquer tela, comparar **lado a lado** com o protótipo equivalente em
> `templates/referencia/` e replicar as classes/tokens; divergências visuais só com motivo documentado
> (acessibilidade, restrição técnica) — registrar na seção `## UX` da spec. Se o `templates/referencia/` e um item
> pontual desta fundação divergirem, **o `templates/referencia/` prevalece** e esta doc deve ser atualizada para refletir.

**Galeria de referência** (inspiração *upstream*, **já materializada e consolidada no `templates/referencia/`** — consultar para entender o *porquê* das escolhas; o alvo a replicar é o `templates/referencia/`, não estas páginas):

| Referência | URL | O que emprestar |
| :--- | :--- | :--- |
| **Swipe** (finanças) | `shadcn-nextjs-swipe-landing-page.vercel.app` | Landing clara e amigável; hero com mock do app + **cards flutuantes de métrica**. Direção principal p/ o marketing do Atendaz (F0012). |
| **Matter / Plasma** | `shadcn-nextjs-matter-landing-page.vercel.app` · `plasma-nextjs-template.vercel.app` | Hero bold, tipografia grande, seção de produto em destaque; opção dark. |
| **Studio Admin** | `next-shadcn-admin-dashboard.vercel.app` | **Dashboard SaaS quase igual ao domínio do Atendaz**: sidebar seccionada, cards de métrica com badge de tendência, e **tabela de clientes com Status/Cobrança/Plano**. |
| **Shadcn Fintech** | `shadcn-fintech.vercel.app` | Overview financeiro: gráfico de área, cards de saldo/recebimento, medidores de saúde. |
| **Tailwind Admin** | `react-free.tailwind-admin.com` | Cards de métrica coloridos, gráfico de barras, timeline de transações, tabela com badges de prioridade. |

### Acabamento (o que eleva o look — aplicar em todo o app)
- **Respiro**: seções de página com `py-16`/`py-20`; conteúdo em `max-w-6xl` (marketing) / `max-w-6xl`
  no shell; nunca "grudar" elementos.
- **Cards**: `rounded-2xl border border-gray-200 bg-white p-6 shadow-sm`; ícone do card num quadrado
  `rounded-xl bg-primary/10 text-primary`.
- **Cor com parcimônia**: fundo neutro (`gray-50`), texto forte (`gray-900`) + muted (`gray-500`);
  o **primary** entra em CTAs, item ativo e destaques — não em tudo.
- **Tipografia**: títulos `tracking-tight`, pesos 600–800; subtítulos em muted logo abaixo.
- **Microdetalhes**: badges de status `rounded-full` com cor tonal (`bg-success/10 text-success`),
  ícones **lucide** consistentes, gradiente radial sutil no hero, `backdrop-blur` em barras fixas.
- **Dark mode**: desejável (várias refs são dark). Fica como evolução — mapear os tokens para
  CSS variables e um `.dark` quando priorizado; não bloqueia o revamp claro.

### Logo (marca "AtendAZ")
Wordmark **AtendAZ** em peso **bold**: "Atend" na cor de texto + "AZ" em **acento indigo**. Duas variantes
prontas em `templates/referencia/assets/`, **fundo transparente** e `viewBox` recortado ao wordmark (proporção ~4:1),
para usar por altura:
- **`atendaz-logo.svg`** — "Atend" `#111827` (gray-900, cor do texto) + "AZ" **primary** `#4F46E5` → **fundo claro** (nav, sidebar, footer claro).
- **`atendaz-logo-inverted.svg`** — "Atend" **branco** + "AZ" `#93A0FA` (indigo ~350) → **fundo escuro/indigo** (faixa CTA e outras superfícies escuras). O acento clareia nesta variante para contrastar **com o "Atend" branco** *e* com o fundo indigo — na janela estreita entre "quase branco" (some no "Atend") e "escuro demais" (some no fundo).
- **Regra**: escolher a variante pelo **contraste com o fundo** (nunca a clara sobre claro nem a escura sobre escuro). Exibir com `h-6`/`h-7` e `w-auto`.
- **Fontes** (arte original, fundo sólido, na raiz do repo): `Logo para o app AtendAZ (2).svg` (fundo claro) e `Logo para o app AtendAZ (1).svg` (fundo escuro). As variantes de `templates/referencia/assets/` são **derivadas** delas (fundo removido + recorte do `viewBox`); ao ajustar a marca, editar estas variantes. Na implementação real, mover os SVGs de `templates/referencia/assets/` para `public/` e servir via `<img>`/`next/image`.

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
- **Formulários multi-passo** (quando houver): **stepper horizontal** no topo do card (ou passos numerados dentro do próprio card centralizado); botões **Voltar** (ghost) / **Continuar** (primary); validação por passo antes de avançar. **Nunca** painel lateral roxo. (O onboarding hoje é **passo único** — F0002.6.)

## Padrão: Shell Público (marketing + login + onboarding)

Base: **[`templates/referencia/landing.html`](../templates/referencia/landing.html)**. Usado por **todas as páginas públicas** —
marketing (F0012), **login** e **onboarding** — e por qualquer página aberta (ex.: agenda pública,
coleta de dados fiscais). **Não** existe mais "meia tela roxa": as telas de auth vivem **dentro** da
mesma moldura clara da landing.

### Moldura
- **Nav fixa** (`sticky top-0`, `bg-white/80 backdrop-blur`, `border-b border-gray-100`): **logo claro**
  à esquerda; links centrais **apenas nas páginas de marketing**; à direita as ações padrão
  **"Entrar"** (`Link` para `/login`) + **"Começar grátis"** (`Link` primary para `/onboarding`) — a
  própria página pode sobrescrever essas ações (`headerRight`) quando ela já É o destino de uma delas
  (ex.: `/login` some com "Entrar" e mostra "Novo por aqui? Começar grátis"). No mobile, menu compacto.
- Fundo branco/neutro (`bg-white` / `gray-50`); conteúdo em `max-w-6xl mx-auto px-4` — **não** força
  centralização vertical/horizontal do `<main>`: cada página monta seu próprio layout dentro da moldura
  (card único ou hero de 2 colunas, ver abaixo).
- Rodapé enxuto (logo + linha institucional), como na landing.

### Login (`/login`) — **hero da landing, não uma tela de auth isolada**
`/login` **não é** uma página de auth genérica: ela reaproveita o **hero da landing**
(`templates/referencia/landing.html`) como pano de fundo, já que ainda não existe a landing de marketing (F0012) —
é a porta de entrada pública do produto. **2 colunas** dentro do `max-w-6xl` (`lg:grid-cols-2`, stack no
mobile): **headline + subcopy + trust bar** à esquerda (texto idêntico ao hero: badge "Feito para
barbearias, clínicas e estética", h1 "Agenda, cobrança e nota fiscal num só lugar.", subcopy, trust bar
"500+ negócios"/"Pix · Cartão · Boleto"/"NFS-e integrada"); **card de acesso** à direita
(`rounded-2xl border shadow-xl`) com heading "Acesse sua conta" + botão **"Entrar com Google"**. Sem
split, **sem painel roxo** — o card substitui o mockup do app que a landing completa (F0012) usaria
nesse mesmo slot.

```
┌─ Nav: [AtendAZ]                      Novo por aqui? Começar grátis ─┐
│  ● Feito para barbearias…          ┌───────────────────────────┐   │
│  Agenda, cobrança e                │      Acesse sua conta      │   │
│  nota fiscal num só lugar.         │  [  G   Entrar com Google ]│   │
│  <subcopy>                         └───────────────────────────┘   │
│  500+ negócios · Pix/Cartão/Boleto · NFS-e integrada                │
└────────────────────────────────────────────────────────────────────┘
```

### Onboarding (`/onboarding`) — **hero de 2 colunas: mockup+benefícios × form**
Passo único (identidade — F0002.6), agora em **2 colunas** dentro do `max-w-6xl` (`lg:grid-cols-2`,
stack no mobile, form primeiro): à **esquerda**, `AppMockupCard` (mesma peça visual do hero da landing —
`src/components/AppMockupCard.tsx`, reusável quando a landing de marketing existir) + headline curta
("Leva menos de um minuto.") + lista de benefícios (bullets `bg-success`); à **direita**, o card do
form: `max-w-lg`, `bg-white rounded-2xl border border-gray-200 shadow-xl p-6/8`, título + subtítulo de
contexto + form (primitivos da F0002.5: máscaras, PF/PJ, tooltips) + botão primary **full-width**.
**Sem painel roxo.**

```
┌─ Nav: [AtendAZ]                              Já tem conta? Entrar ─┐
│  ┌──[ mockup do app ]──┐   ┌─────────────────────────────┐        │
│  │  receita · agenda…  │   │  Vamos configurar seu negócio │        │
│  └──────────────────────┘   │  Nome fantasia [___________] │        │
│  Leva menos de um minuto.   │  Segmento ⓘ    [▾__________] │        │
│  • Agenda pública            │  WhatsApp      [(__)_______] │        │
│  • Cobrança via Pix/cartão   │      [   Começar a usar   ]   │        │
│  • NFS-e automática          └─────────────────────────────┘        │
└────────────────────────────────────────────────────────────────────┘
```

### Responsividade
- **≥ lg (1024px)**: card centralizado (ou 2 colunas dentro do `max-w-6xl`, na variante).
- **< lg**: coluna única; card ocupa a largura com margens; botões **`full-width`**; alvos ≥ 44px.

## Padrão: App Shell (área autenticada)

Base: **[`templates/referencia/dashboard.html`](../templates/referencia/dashboard.html)**. Usado em **todas as rotas internas** (pós-login): `/dashboard` e tudo sob ele. As rotas públicas (marketing, login, onboarding) usam o **Shell Público**; a partir do momento em que o usuário tem um `business` configurado, a navegação passa para o **App Shell**.

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
- Largura fixa `~240px`, full-height, `bg-white` com `border-r border-gray-200` (como em `templates/referencia/dashboard.html`).
- Logo no topo; lista vertical de itens de navegação (ícone + label).
- **Item ativo**: fundo `indigo-50` + texto/ícone `primary` + barra/realce à esquerda. Demais itens: texto Muted, hover escurece.
- **Apenas módulos ativos** do `business` aparecem (progressive disclosure). Itens sempre presentes: *Profissionais*, *Configurações*. Condicionais: *Serviços*/*Agenda* (se `agenda`), *Cobrança* (se `cobranca`), *Notas* (se `nfse`), *Financeiro* (se `financeiro` — **item de menu próprio**, ver F0013).
- **Configurações** (sempre visível) é o **menu de configuração da clínica/empresa**: identidade do negócio, **Meio de Pagamento e NFS-e** (integração Asaas — ver F0002.8), plano/cobrança da plataforma (F0011) e demais ajustes. Nunca expor o termo técnico "Asaas" como rótulo de navegação.
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

### Dashboard: cards de métrica
Faixa de 2–4 **cards de métrica** no topo da Visão Geral (ver `templates/referencia/dashboard.html`). Cada card:
- `rounded-2xl border bg-white p-5 shadow-sm`; topo com **ícone** (quadrado `bg-primary/10`) e um
  **badge de tendência** (`▲ 12%` verde / `▼` vermelho / neutro cinza) alinhado à direita;
- abaixo, **label muted** + **número grande** (`text-2xl font-bold`).
- Exemplos no Atendaz: *Agendamentos hoje*, *Receita do mês*, *Cobranças pendentes*, *NFS-e emitidas*.

### Dashboard: gráficos
Um card largo (`lg:col-span-2`) com gráfico (receita por mês) + um card lateral de composição
(ex.: formas de recebimento com barras de progresso). Placeholder aceitável no protótipo; na
implementação usar uma lib de charts estável quando a feature exigir.

### Tabela de dados (listas) — badges de domínio
Listas (cobranças, clientes, agendamentos) usam o `Table` do shadcn dentro de um card, com **toolbar**
(título + subtítulo à esquerda; *Filtrar*/*Exportar* à direita) e cabeçalho `text-xs uppercase muted`.
Status viram **badges tonais** `rounded-full` reutilizáveis — padronizar as cores por significado:
- **Cobrança**: `Pago` (success) · `Aguardando`/`Emitindo…` (warning) · `Vencido` (danger) · `—` (muted).
- **NFS-e**: `Emitida` (success) · `Pendente`/`Emitindo…` (warning) · `Falhou` (danger).
- **Assinatura (plataforma)**: `Ativo` (success) · `Trial` (primary/warning) · `Grace` (warning) · `Cancelado` (muted).
- Primeira coluna com **avatar de iniciais** (`bg-primary/10 text-primary`) + nome. Linhas com `hover:bg-gray-50`.

## Padrão: Landing / Página de marketing (F0012)
Site público (fora do app autenticado). Referência principal: **Swipe** (claro e amigável). Ver
`templates/referencia/landing.html`. Anatomia:
- **Nav fixa** com `backdrop-blur`, logo à esquerda, links no centro, *Entrar* + *Começar grátis* (primary) à direita; vira menu hambúrguer no mobile.
- **Hero** em 2 colunas: à esquerda headline `text-4xl/5xl font-extrabold tracking-tight` (com uma
  palavra em `text-primary`), subtítulo muted, 2 CTAs (primary + outline) e microcopy de confiança;
  à direita um **mock do app** com **cards flutuantes** de métrica. Gradiente radial sutil de fundo.
- **Trust bar** (faixa neutra: "500+ negócios", meios de pagamento, NFS-e).
- **Recursos**: grid de 3 cards (Agenda, Cobrança, NFS-e) — ícone tonal + título + descrição curta.
- **Como funciona**: 3 passos numerados.
- **Preços**: 3 planos; o recomendado com `border-2 border-primary` + selo "Mais popular".
- **CTA final**: faixa `bg-primary` arredondada (`rounded-3xl`) com logo invertido, headline + botão claro.
- **Footer** enxuto. Tudo mobile-first, `max-w-6xl`, seções com `py-20`.

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
Cada tela na seção `## UX` referencia o **shell** ao qual pertence — **Shell Público** (páginas
abertas/auth/onboarding) ou **App Shell** (rotas internas) — e desenha só o **conteúdo** daquele shell.
Não desenhar mais painel roxo. Exemplo (onboarding = card centralizado no Shell Público):

```
## Tela: /onboarding (Shell Público — card centralizado)

┌─ Nav: [AtendAZ]                                                ─┐
│                  ┌─────────────────────────────┐              │
│                  │  Configure sua identidade    │              │
│                  │  Como seu negócio aparece p/  │              │
│                  │  seus clientes.               │              │
│                  │  Nome fantasia [___________] │              │
│                  │  Segmento ⓘ    [▾__________] │              │
│                  │  WhatsApp      [(__)_______] │              │
│                  │           [   Continuar   ]   │              │
│                  └─────────────────────────────┘              │
└────────────────────────────────────────────────────────────────┘
```

## O que isto NÃO resolve
Decisões visuais muito específicas (ícones exatos, ilustrações, microanimações) — descrever em prosa na seção `## UX` da spec ou aceitar uma escolha razoável do agente.
