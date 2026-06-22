# Plano de Execução: F1 — Redesign de UX (Split Layout)

Iteração de **UX** sobre a F1 (funcional já em produção). Implementa o **Split Layout** e o stepper conforme `docs/spec/F1-onboarding.md` (seção `## UX`) e `docs/10-design-system.md`. **Não altera regras de negócio nem APIs** — é redesenho de apresentação.

## Contexto
O UX inicial (caixas centralizadas genéricas) ficou abaixo do esperado no gate de revisão. Novo alvo: `/login` e `/onboarding` em **Split Layout** — painel esquerdo (branding/stepper, indigo escuro) + painel direito (formulário branco); colapso para header compacto no mobile.

## DOR
- ✅ Spec UX validada (`docs/spec/F1` → `## UX`) e fundação (`docs/10`).
- ✅ `audit:prod` = 0 (sem deps novas de risco; fonte Inter via `next/font`).
- ✅ Envs já configuradas (nenhuma nova).
- ⚠️ Cor `primary` segue como **decisão de identidade pendente** (default indigo) — ajustável em 1 lugar (`tailwind.config.ts`).

## Decisões de design
- **Backend intacto**: rotas (`/api/onboarding`, `validate-slug`), models, `ensureSeed`, auth — sem mudança. Só camada de UI.
- **Componentes compartilhados** (reusáveis por features futuras): `SplitLayout` + `Stepper`.
- **Toasts**: implementação mínima própria (Provider + componente), **sem nova dependência**.
- **Fonte Inter** via `next/font/google` (self-hosted pelo Next; sem requisição externa em runtime).

## Tarefas Técnicas

### Fundação visual
- [ ] **R1** — `tailwind.config.ts`: adicionar `primary-dark` (`#3730A3`) e configurar `fontFamily.sans` = Inter (var). (Já existem `primary`/`primary-hover`.)
- [ ] **R2** — `src/app/layout.tsx`: carregar **Inter** via `next/font/google` e aplicar `font-sans` no `<body>`.
- [ ] **R3** — `src/components/SplitLayout.tsx` (client/server conforme uso): painel esquerdo (gradiente `from-indigo-700 to-indigo-900`, logo, slot de conteúdo, rodapé de confiança) + painel direito (`bg-white`, `max-w-md mx-auto px-8`). **Responsivo**: `≥lg` split 50/50; `<lg` painel esquerdo vira **header compacto** (logo + passo atual) e o direito ocupa 100%.
- [ ] **R4** — `src/components/Stepper.tsx`: stepper **vertical** a partir de uma lista `{ key, label, descricao }` + índice atual; estados **concluído** (`●` indigo-400 + linha sólida), **atual** (`◉` branco + label bold + descrição), **futuro** (`○` outline, opacidade 60%).

### Telas
- [ ] **R5** — `src/app/login/page.tsx`: reescrever com `SplitLayout`. Esquerda: título + tagline + 3 bullets (fade-in sequencial 150ms) + rodapé "500+ negócios". Direita: "Bom te ver por aqui" + botão **Entrar com Google** (ícone SVG do Google, full-width) + nota de termos.
- [ ] **R6** — `src/app/onboarding/OnboardingWizard.tsx`: reestruturar dentro do `SplitLayout`. Esquerda: `Stepper` refletindo o passo atual (3 ou 4 passos — Passo 3 some quando o plano não tem `cobranca`/`nfse`) + frase de contexto. Direita: título/subtítulo do passo + form + navegação (Voltar ghost / Continuar primary).
- [ ] **R7** — Comportamentos por passo:
  - **Passo 1**: slug **auto-gerado** do nome (debounce 400ms), editável, validado onBlur; segmento `<select>`.
  - **Passo 2**: planos como **cards clicáveis** (selecionado → `border-primary` + `bg-indigo-50`; rádio no canto; badges de módulos).
  - **Passo 3** (gated): chave Asaas `type="password"` + **toggle de visibilidade**, validação onBlur com spinner e ícone ✓/✗; `nfseStrategy` só se `nfse`.
  - **Passo 4**: nome pré-preenchido do Google; ao concluir, botão vira spinner "Configurando…".
- [ ] **R8** — Toasts: `src/components/Toast.tsx` + provider no `layout`/`providers`. Sucesso ao concluir ("Tudo pronto! 🎉") + redirect; erro em falha de submit **preservando os dados**.

### Acessibilidade & responsividade
- [ ] **R9** — Labels em todos os inputs, foco visível (`focus:ring`), contraste AA; navegação por teclado; alvos ≥ 40px; botões `full-width` no mobile.

## Auditoria de Segurança (DOR)
- `npm run audit:prod` deve seguir **0** após o redesign (Inter via next/font não adiciona vuln; toasts próprios sem dep).

## Verificação e Testes
- **`local` (Jest)**: backend inalterado → os **21 testes devem continuar verdes** (nenhuma mudança em rotas/lib/models). Sem novos testes de UI unitários (cobertura via E2E/visual).
- **`stage` (Cypress + visual)**: smoke atual segue verde; **validação visual manual** do Split Layout em **1280px, 1024px e 375px**; stepper reflete estado correto; fluxo completo de onboarding (grátis e pago).
- **`prod`**: idem no `/ssd-done`.
- **Soberano**: `audit:prod` 0 + build limpo + **aprovação visual do usuário** no gate de revisão humana.

## Arquivos Afetados
**Novos**: `src/components/SplitLayout.tsx`, `src/components/Stepper.tsx`, `src/components/Toast.tsx`.
**Modificados**: `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/providers.tsx` (Toast provider), `src/app/login/page.tsx`, `src/app/onboarding/OnboardingWizard.tsx`. (Backend não muda.)

## Fora do escopo
- Mudança de regras/preços/módulos (vêm da coleção `plano`).
- Ícones/ilustrações finais e microanimações elaboradas — escolha razoável do agente conforme `docs/10`.
- Definição final da cor de marca (decisão do usuário; default indigo).
