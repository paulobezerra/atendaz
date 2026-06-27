# [CONCLUÍDO] Especificação: F2 — Profissionais e Billing Override

> **Status:** F2 concluída e **em produção** (validada via `/ssd-done 2` — `/ssd-test prod` 9/9). É a **primeira feature interna** (pós-onboarding) — inaugura a área autenticada do painel sobre o padrão **App Shell** (`docs/10-design-system.md`).

## Escopo
- Gestão (CRUD) de múltiplos `professional` (agendas/identidades) dentro de um `business`.
- Cada `professional` pode **herdar** o faturamento do negócio ou ter **faturamento próprio** (override de Asaas/fiscal).
- Função central de resolução de billing: `resolveBillingConfig(professional, business)`.
- Fundação visual da área logada: **App Shell** (sidebar no desktop, bottom tab bar no mobile), reusável por F3+.

### Conceitos (hierarquia — ver `docs/00`)
- Atua na camada **Tenant (Business)**. Toda leitura/escrita é escopada por `businessId` (Guardrail 1).
- `professional` é, ao mesmo tempo, a **unidade de agenda** (F3/F4) e a **identidade de faturamento** (CPF/CNPJ + Asaas). Por isso **todo plano** tem ≥ 1 profissional — inclusive planos sem agenda (ex.: "Cobrança + Nota"), onde o profissional é apenas a identidade fiscal/financeira.

## DOR (Definition of Ready)
- [ ] Spec validada contra Guardrails (`docs/07`) e Modelo de Dados (`docs/04`).
- [ ] App Shell formalizado em `docs/10-design-system.md`.
- [ ] Plano de execução detalhado em `docs/plans/02-professionals-billing.md`.
- [ ] Variáveis de ambiente já disponíveis desde F1: `CRYPTO_MASTER_KEY`, `ASAAS_BASE_URL` (nenhuma env nova nesta fase).
- [ ] Golden Stack confirmada (Node 24, Next estável, React 19, NextAuth v4) e `npm audit --omit=dev` = 0.

## Implementação Detalhada

### 1. Modelo (reuso de `docs/04` — `professional`)
Campos relevantes desta fase: `businessId`, `nome`, `slugInterno` (único **no escopo do business**), `whatsapp`, `bio`, `ativo`, e `billingConfig` (nullable; `null` = herda do business):
```
billingConfig {
  asaasApiKeyEncrypted,         // AES-256-GCM (nunca texto plano)
  nfseStrategy,                 // AUTO_AFTER_PAYMENT | MANUAL_PER_PAYMENT | MANUAL_BATCH
  codigosFiscais { municipalServiceCode, nbsCode, taxSituationCode, taxClassificationCode, operationIndicatorCode },
  cpfCnpj
}
```
> Campos de **agenda** (`service`, `availability`) e de **fotoUrl/redesSociais** pertencem ao F3 — fora de escopo aqui.

### 2. Resolução de Billing (Guardrail 3 — **TDD obrigatório**)
- Função `resolveBillingConfig(professional, business)` em `src/lib/billing.ts`.
- Regra: retorna `professional.billingConfig` **se preenchido**; senão `business.billingConfigPadrao`.
- Casos de borda cobertos por teste: override completo; override `null` → herança; business **sem** `billingConfigPadrao` (plano sem cobrança/nfse) → retorna `null` (chamadores tratam como "sem billing").
- É a **única** porta para obter config de cobrança/nota — nenhum outro código pode assumir o token do business diretamente.

### 3. API (rotas internas — todas `force-dynamic`, autenticadas, escopadas por `businessId`)
Resolução de tenant: sessão → `googleId` → `business` (como no dashboard atual). Toda query inclui `businessId`; tentativa de acessar `professional` de outro business retorna **404** (não 403 — não vazar existência).

| Método | Rota | Função |
| :--- | :--- | :--- |
| `GET` | `/api/professionals` | Lista os profissionais do business. |
| `POST` | `/api/professionals` | Cria profissional. |
| `GET` | `/api/professionals/[id]` | Detalhe (sem expor a chave Asaas em texto plano). |
| `PATCH` | `/api/professionals/[id]` | Atualiza dados / billing override / `ativo`. |
| `DELETE` | `/api/professionals/[id]` | Remove (com guarda do invariante "≥ 1 ativo"). |
| `GET` | `/api/professionals/validate-slug?slug=` | Disponibilidade de `slugInterno` no business. |

Reuso: `validateAsaasKey` (`src/lib/asaas.ts`), `encrypt`/`decrypt` (`src/lib/crypto.ts`), `normalizeSlug`/`RESERVED_SLUGS`/`validateSlug` (`src/lib/slug.ts`), `POST /api/onboarding/validate-asaas` (já existe) para validação inline da chave.

### 4. Billing Override (gated por módulo — Guardrail 2)
- A seção de faturamento **só existe** se `business.modulos.cobranca || business.modulos.nfse`.
  - Se ambos `false`: o formulário do profissional **não** tem seção de billing; a rota **ignora/rejeita** (400) qualquer `billingConfig` enviado.
- Opções na UI: **"Usar faturamento padrão do negócio"** (`billingConfig = null`) **vs** **"Configurar faturamento próprio"**.
- Ao escolher próprio:
  - **Chave Asaas**: obrigatória; validada contra `ASAAS_BASE_URL/myAccount`; **criptografada (AES-256-GCM)** antes de salvar; nunca retornada ao cliente (GET expõe só um booleano "tem chave própria" + os 4 últimos dígitos, se houver).
  - **`nfseStrategy` + `codigosFiscais` + `cpfCnpj`**: exigidos apenas se `modulos.nfse` (estratégia via `<select>` da lista controlada — Guardrail 5; sem texto livre).

### 5. Ativação / Desativação
- `professional.ativo` é um toggle simples nesta fase.
- **Decisão de faseamento (Guardrail 6):** o **recálculo do valor da assinatura** (`platform_subscription.valorMensal`/`qtdAgendasAtivas`) e a sincronização no Asaas **NÃO** ocorrem no F2 — são **postergados para o F11**, onde a cobrança da plataforma realmente acontece (`PLATFORM_ASAAS_API_KEY` é env de Fase 11). No F2, ativar/desativar apenas altera o estado e registra em `audit_log`. Ver nota correspondente em `docs/spec/F11-platform-subscription.md`.

### 6. Auditoria (Guardrail 4)
- Toda escrita (create/update/delete/ativar/desativar) gera registro em `audit_log` (`entidade: "professional"`, `acao`, `entidadeId`, `payloadResumido` — **sem** chave Asaas no payload).

## Regras de Negócio e Conflitos Identificados
- **Invariante "≥ 1 profissional ativo"**: não é permitido desativar nem excluir o **último** profissional ativo do business. A API bloqueia (409) e a UI desabilita a ação com tooltip explicativo.
- **`slugInterno`** é único **por business** (o mesmo slug pode existir em businesses diferentes), validado contra `RESERVED_SLUGS`. Gerado a partir do nome (debounce) e editável.
- **Não gated por `agenda`**: o CRUD de profissionais existe em qualquer plano (é também identidade de faturamento). Apenas a **seção de billing** é gated por `cobranca|nfse`; recursos de agenda ficam no F3.
- **Segurança de chaves**: chave Asaas nunca trafega/persiste em texto plano e nunca é devolvida em GET (Guardrail 3). Para trocar, o usuário redigita.
- **Isolamento total**: nenhuma rota retorna/edita profissional fora do `businessId` da sessão (Guardrail 1).

## UX (sobre o Design System — `docs/10`)

> A área autenticada usa o padrão **App Shell** (`docs/10`): **sidebar** fixa no desktop (≥1024px) e **bottom tab bar** no mobile (<1024px). O Split Layout **não** se aplica aqui (é exclusivo de `/login` e `/onboarding`). A navegação mostra **apenas os módulos ativos** do business (progressive disclosure).

### Fluxos (jornada)
1. Usuário autenticado com `onboardingStatus=COMPLETE` acessa `/dashboard` → App Shell. Item **Profissionais** na navegação.
2. **Lista** (`/dashboard/profissionais`): mostra os profissionais; sempre há ≥ 1 (o criado no onboarding). Botão **+ Adicionar profissional**.
3. **Criar/Editar** (`/dashboard/profissionais/novo` e `/.../[id]`): formulário com dados básicos + (condicional) seção de faturamento.
4. **Salvar**: validações inline; sucesso → toast + volta à lista; erro → toast e preserva o preenchido.
5. **Desativar/Excluir**: confirmação; bloqueado no último ativo.

### Validações inline (onBlur) e erros
- **Nome**: obrigatório (mín. 2).
- **`slugInterno`**: normaliza e checa disponibilidade via `GET /api/professionals/validate-slug`; erro abaixo do campo ("Slug já usado neste negócio" / "Slug reservado").
- **Faturamento próprio → Chave Asaas**: obrigatória, validada no Asaas (spinner no campo; ✓/✗ + mensagem). Se `nfse`: `nfseStrategy` obrigatória (select); `codigosFiscais`/`cpfCnpj` conforme regra.
- Botão **Salvar** desabilitado enquanto o form estiver inválido.

---

### Tela: `/dashboard/profissionais` — Lista (desktop)

```
┌────────────┬──────────────────────────────────────────────┐
│ ◈ Atendaz  │  Barbearia do Zé · /agendar/barbearia-ze   ▾ │
│            ├──────────────────────────────────────────────┤
│ ▸ Profis-  │  Profissionais                  [+ Adicionar] │
│   sionais  │                                              │
│   Serviços │  ┌────────────────────────────────────────┐  │
│   Cobrança │  │ Maria Silva      Faturamento próprio  ● │  │
│   Notas    │  │ /maria-silva     ✓ Asaas ····7421   ON │  │
│            │  ├────────────────────────────────────────┤  │
│            │  │ João Souza       Faturamento padrão   ● │  │
│            │  │ /joao-souza      herda do negócio   ON  │  │
│            │  └────────────────────────────────────────┘  │
│ 👤 Paulo   │                                              │
│  ─ Sair    │                                              │
└────────────┴──────────────────────────────────────────────┘
```

**Cada linha:** nome + `slugInterno`; **badge** do modo de faturamento (*Próprio* indigo / *Padrão* cinza — só aparece se módulo de billing ativo); toggle/indicador `ON/OFF`; clique abre edição. Último ativo: toggle desabilitado com tooltip "Todo negócio precisa de ao menos um profissional ativo".

---

### Tela: `/dashboard/profissionais/[id]` — Editar (desktop)

```
┌────────────┬──────────────────────────────────────────────┐
│ ◈ Atendaz  │  Profissionais › Editar                      │
│            ├──────────────────────────────────────────────┤
│ ▸ Profis-  │  Nome *                                       │
│   sionais  │  [ Maria Silva________________________ ]      │
│   Serviços │  Endereço interno (slug) *                    │
│   Cobrança │  [ maria-silva________________________ ]      │
│   Notas    │  ✓ Disponível                                 │
│            │  WhatsApp        Bio (opcional)               │
│            │  [ (11)9____ ]   [ ____________________ ]     │
│            │                                              │
│            │  Faturamento                ← só se cobranca/ │
│            │  ( ) Usar padrão do negócio    nfse ativos    │
│            │  (•) Configurar faturamento próprio           │
│            │     Chave API Asaas *                         │
│            │     [ $aact·········789 ] 👁  ✓ validada      │
│            │     Estratégia de NFS-e *  ← só se nfse=true  │
│            │     [ Automática              ▾ ]             │
│            │     CPF/CNPJ *  [ ________________ ]          │
│ 👤 Paulo   │                                              │
│  ─ Sair    │  [ Desativar ]      [ Cancelar ] [ Salvar ]  │
└────────────┴──────────────────────────────────────────────┘
```

**Faturamento:** rádio alterna entre herdar e próprio; ao escolher próprio, revela os campos. Chave Asaas em `type="password"` com toggle 👁 e validação onBlur (spinner → ✓/✗). Texto de confiança ("Chave criptografada com AES-256; nunca compartilhamos.") próximo ao campo.

---

### Mobile (< 1024px)

Sidebar colapsa em **bottom tab bar** (ícones + label) com os módulos ativos; **+ Adicionar** vira FAB ou botão full-width no topo da lista; o formulário ocupa a tela inteira, botões full-width.

```
┌──────────────────────────────────────────┐
│  Barbearia do Zé                      ▾   │  ← topbar 56px
├──────────────────────────────────────────┤
│  Profissionais          [ + Adicionar ]  │
│  ┌────────────────────────────────────┐  │
│  │ Maria Silva     · próprio      ON  │  │
│  ├────────────────────────────────────┤  │
│  │ João Souza      · padrão       ON  │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  👤 Profis.   📅 Agenda   💳 Cobr.   ⋯   │  ← bottom tab bar
└──────────────────────────────────────────┘
```

## Verificação e DOD (Definition of Done)

### Testes de Integração (Local — Jest)
- [ ] **`resolveBillingConfig`** (TDD): override preenchido → retorna override; `null` → retorna `billingConfigPadrao`; business sem padrão → retorna `null`.
- [ ] **Isolamento de tenant**: business A não lê/edita/exclui `professional` de business B (espera 404).
- [ ] **`slugInterno`**: único dentro do business; o mesmo slug permitido em businesses distintos; reservados rejeitados.
- [ ] **Criptografia**: chave Asaas salva ≠ texto plano; GET nunca retorna a chave; `decrypt(encrypt(x)) === x`.
- [ ] **Module gating**: com `cobranca` e `nfse` ambos `false`, `billingConfig` enviado é rejeitado (400) e a seção não é exigida.
- [ ] **Validação de chave**: override com chave Asaas inválida é rejeitado.
- [ ] **Invariante ≥ 1 ativo**: desativar/excluir o último ativo retorna 409.
- [ ] **`audit_log`**: create/update/activate/deactivate/delete geram registro (sem chave no payload).

### Testes E2E (Stage/Produção — Cypress)
- [ ] Adicionar 2º profissional **herdando** o faturamento do negócio.
- [ ] Adicionar profissional com **Asaas próprio** (chave de sandbox validada).
- [ ] Editar profissional alternando entre padrão ↔ próprio.
- [ ] Desativar um profissional (não o último); tentativa de desativar o último é bloqueada na UI.
- [ ] App Shell renderiza corretamente em 1280px, 1024px e 375px; bottom tab bar funcional no mobile; só módulos ativos aparecem.

### Critério Soberano
- [ ] **Aprovação do Usuário** após validação funcional na URL da Vercel (`/ssd-done 2`).
- [ ] Dois modelos de faturamento (centralizado e individual) coexistem no mesmo negócio **em produção**.
- [ ] `npm audit --omit=dev` = 0; build limpo.
