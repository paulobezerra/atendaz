Sim, dá pra definir tudo em `.md` — e na prática funciona muito bem para agentes de código como Claude Code, porque texto estruturado é mais acionável do que um Figma exportado.

A chave é separar **o que** a tela faz do **como** ela parece. Figma captura o "como visualmente", mas você pode substituir isso com três tipos de artefato em markdown:

---

## 1. `ux-flows.md` — Fluxos e jornadas

Define o **comportamento**, não o layout.

```md
## Fluxo: Cadastro de cliente

### Happy path
1. Usuário acessa /clientes/novo
2. Preenche nome, e-mail, CPF
3. Clica em "Salvar"
4. Redireciona para /clientes/{id} com toast de sucesso

### Validações inline
- CPF: valida formato ao sair do campo (onBlur)
- E-mail: valida formato ao sair do campo
- Nome: obrigatório, mínimo 3 caracteres

### Erros
- CPF duplicado → mensagem abaixo do campo: "CPF já cadastrado"
- Falha de rede → toast de erro, formulário permanece preenchido
```

---

## 2. `ui-spec.md` — Especificação de telas

Define estrutura, hierarquia e comportamento de cada tela usando **ASCII layout + descrição semântica**.

```md
## Tela: /clientes/novo

### Layout (desktop)
┌─────────────────────────────────────────┐
│ [← Voltar]   Novo Cliente               │
├─────────────────────────────────────────┤
│ Nome *         [____________________]   │
│ CPF *          [___.___.___-__]         │
│ E-mail *       [____________________]   │
│                                         │
│               [Cancelar] [Salvar →]     │
└─────────────────────────────────────────┘

### Comportamento
- Header fixo com breadcrumb
- Botão "Salvar" desabilitado até formulário válido
- "Cancelar" volta para /clientes sem confirmação
- Layout mobile: campos em coluna única, botões full-width
```

---

## 3. `design-tokens.md` — Sistema visual

Define cores, tipografia, espaçamentos — o "Figma de tokens" em texto.

```md
## Cores
- Primary: #1A56DB
- Danger: #E02424
- Success: #057A55
- Background: #F9FAFB
- Surface: #FFFFFF
- Text primary: #111928
- Text muted: #6B7280
- Border: #E5E7EB

## Tipografia
- Font: Inter
- Heading 1: 24px / 700
- Heading 2: 20px / 600
- Body: 14px / 400
- Label: 12px / 500 / uppercase + letter-spacing

## Espaçamento
- Base unit: 4px
- Card padding: 24px
- Gap entre campos: 16px
- Radius: 6px

## Componentes base
- Input: border 1px solid Border, radius 6px, height 40px
- Button Primary: bg Primary, text white, radius 6px, px 16px py 8px
- Toast: posição bottom-right, auto-dismiss 4s
```

---

## Estrutura final do pacote de spec

```
/spec
  constitution.md       ← stack, decisões arquiteturais, padrões
  features.md           ← lista de módulos e épicos
  ux-flows.md           ← jornadas e comportamentos
  ui-spec.md            ← telas com ASCII layout
  design-tokens.md      ← sistema visual
  data-model.md         ← entidades e contratos de API
```

---

## O que o agente consegue fazer com isso

Com esse pacote, o Claude Code consegue:
- Gerar componentes React/Angular já com os tokens corretos
- Implementar validações conforme especificado no fluxo
- Criar rotas e navegação conforme o happy path
- Escrever testes de comportamento baseados nos cenários de erro

O que **não** substitui: decisões visuais muito específicas (ícones exatos, ilustrações, microanimações). Para isso, ou você descreve em prosa no `ui-spec.md` ou aceita que o agente vai escolher algo razoável.