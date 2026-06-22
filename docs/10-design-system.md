# Design System & Fundação de UX

Fundação **global** de UX, escrita uma vez e reusada por todas as features. Define **como** as coisas parecem e se comportam por padrão. O **desenho de cada tela/fluxo** fica na seção `## UX` de cada spec (`docs/spec/F{ID}`), referenciando estes tokens — ver [docs/00 → UX e Design System](00-agent-instructions.md#ux-e-design-system).

Stack: **Tailwind CSS**. Os tokens abaixo mapeiam para classes utilitárias; quando fizer sentido, centralizar no `tailwind.config.ts`.

## Design Tokens

### Cores
> ⚠️ **Cor primária = decisão de identidade pendente** (default abaixo, ajustável pelo usuário).
- **Primary**: `#4F46E5` (indigo-600) · hover `#4338CA` (indigo-700)
- **Danger**: `#DC2626` (red-600)
- **Success**: `#059669` (emerald-600)
- **Warning**: `#D97706` (amber-600)
- **Background**: `#F9FAFB` (gray-50)
- **Surface**: `#FFFFFF`
- **Text**: `#111827` (gray-900) · **Muted**: `#6B7280` (gray-500)
- **Border**: `#E5E7EB` (gray-200)

### Tipografia
- Fonte: sans-serif do sistema (ou **Inter** quando configurada)
- H1: 24px / 700 · H2: 20px / 600 · H3: 16px / 600
- Body: 14px / 400 · Label: 12px / 500
- Muted/auxiliar: 12–14px, cor Muted

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
- **Wizard (multi-step)**: indicador "Passo X de N"; botões **Voltar** (ghost) / **Continuar** (primary); validação por passo antes de avançar.

## Padrões de UX (globais)
- **Validação inline**: validar ao sair do campo (`onBlur`); mensagem específica abaixo do campo. Botão primário desabilitado até o passo/form estar válido.
- **Estados de tela**: sempre tratar **loading** (skeleton/spinner), **empty** (mensagem + CTA) e **error** (mensagem + ação de retry). Nunca tela "morta".
- **Feedback de ação**: sucesso/erro via toast; em falha de submit, **preservar** o que o usuário preencheu.
- **Listas controladas**: campos de domínio fechado (ex.: segmento, plano, estratégia de NFS-e) usam `<select>`/opções vindas do **banco** — **nunca** texto livre.
- **Mobile-first**: layout em coluna única no mobile; botões `full-width`; alvos de toque ≥ 40px.
- **Acessibilidade**: todo input com `label`; foco visível; contraste mínimo AA; navegação por teclado.

## Convenção de "Tela" na spec (ASCII)
Cada tela na seção `## UX` da spec deve trazer um layout ASCII + comportamento. Exemplo:

```
## Tela: /onboarding — Passo 1 (Identidade)
┌─────────────────────────────────────────┐
│  Bem-vindo ao Atendaz        Passo 1/4   │
├─────────────────────────────────────────┤
│  Nome fantasia *  [____________________] │
│  Slug público  *  [barbearia-do-ze     ] │
│  Segmento      *  [ Selecione…       ▾ ] │  ← <select> (lista do banco)
│                                          │
│                         [ Continuar → ]  │
└─────────────────────────────────────────┘
Comportamento: slug validado onBlur (disponibilidade via API);
"Continuar" desabilitado até nome+slug+segmento válidos.
```

## O que isto NÃO resolve
Decisões visuais muito específicas (ícones exatos, ilustrações, microanimações) — descrever em prosa na seção `## UX` da spec ou aceitar uma escolha razoável do agente.
