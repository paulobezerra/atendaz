# SSD — Controles de Qualidade & Políticas de Engenharia

Estas são as **regras do jogo para qualidade**. São neutras em relação à tecnologia: o SSD enuncia
a *política*; cada produto a mapeia para sua stack concreta em `docs/project/`. Algumas destas
políticas **restringem escolhas de tecnologia** — não nomeando uma tecnologia, mas fixando a barra
de qualidade que a escolha precisa passar (ex.: "só estável/LTS mais recente"). Onde uma regra diz
"o produto define X", esse vínculo mora em `docs/project/`, mas a regra em si é inegociável.

---

## Política de testes

O portão de testes tem **três camadas**; nenhuma substitui a outra. "Verde" só conta **quando** as
camadas certas cobrem a **superfície que a mudança tocou**.

1. **Integração / API** — exercitam as unidades reais de comportamento (route handlers, serviços,
   lógica crítica) contra dependências **em memória ou mockadas**, para rodarem rápido, isoladas e
   executáveis por hook.
2. **Componente / render (UI)** — **todo componente de UI com lógica** (render condicional, estado
   de formulário, seções reveladas por um controle, máscara de input, ramificação por tipo de
   dado) precisa de um teste que **(a)** monte sem lançar e **(b)** exercite os **ramos
   interativos**. Um componente com render condicional **não** é dado como pronto sem isso.
3. **Ponta a ponta (E2E)** — o contrato público (status / redirect / auth) contra stage/prod.
   **Fluxos autenticados críticos** ganham E2E quando viável; os demais caem no portão manual.

**Regras duras:**
- **Cobrir a superfície alterada.** Testes verdes **não** satisfazem o portão se não exercitam o
  que a mudança tocou. Um crash de render que ainda assim "passa" é **falha de política de
  testes**, não azar — a resposta é fechar a lacuna de cobertura, não só corrigir o sintoma.
- **Lógica crítica é test-first (TDD).** Tudo onde a corretude é sutil — cálculo de dinheiro,
  matemática de agenda, idempotência, transições de estado, permissão/isolamento, resolução de
  config — tem o teste escrito **antes** da implementação.
- **A correção de bug começa pelo teste que falha** e o reproduz, na camada adequada, e só então a
  correção. Teste de regressão é obrigatório.

Ver também [principles.md](principles.md) §1.

---

## Política de dependências & versões

É aqui que a qualidade **dirige as decisões de tecnologia**.

- **Runtime em LTS.** Sempre rodar na linha **LTS** do runtime. Non-LTS não é opção — é decisão de
  qualidade, não preferência.
- **Só a estável mais recente.** Usar a release **estável** mais recente (dist-tag `latest` /
  equivalente), próxima de LTS. Usar `beta`/`preview`/`rc`/`alpha`/`canary`/prerelease é
  **proibido**, em dev *e* prod — trate um prerelease como **pior que uma vulnerabilidade
  conhecida**.
- **Zero vulnerabilidades conhecidas em dependências de produção** antes de qualquer push. O
  portão audita as dependências de **produção** e deve reportar **zero**. Vulnerabilidades
  exclusivas de ferramentas de dev/teste, **sem fix não-quebrante** e que **nunca vão para
  produção**, são registradas como **débito conhecido** (reavaliado quando houver patch) — não
  bloqueiam o push.
- **Nunca "consertar" audit com downgrade.** Não resolva uma vulnerabilidade rebaixando uma
  dependência crítica ou forçando uma quebra. Prefira a **estável patcheada** mais recente.
- **Dependências mínimas e avaliadas.** Prefira libs comprovadas e mantidas; evite bloat
  não-mantido ou de propósito único. Toda dependência é um passivo que você está escolhendo
  possuir.

O produto lista sua stack concreta pinada ("golden stack") e seu comando de audit em
`docs/project/`; a política acima governa como essa lista pode se mover.

---

## Portão de build & integridade

- **Commit/deploy só com build de produção bem-sucedido.** Um erro de tipo/compilação é
  bloqueante, não um aviso — rode o build real, não só os testes unitários.
- **Uma suíte vermelha bloqueia o push.** Garantido por um git hook, não pela memória (ver
  [automation.md](automation.md)).

---

## Segredos & segurança

- **Segredos vivem em variáveis de ambiente**, nunca no código nem no repo.
- **Criptografar segredos em repouso.** Chaves/tokens de API de terceiros são armazenados com
  **criptografia autenticada** (ex.: AES-256-GCM) derivada de uma chave mestre guardada só no
  ambiente — criptografados **antes** de serem persistidos.
- **Nunca expor um segredo em texto plano** — nem em respostas, logs, entradas de auditoria ou
  mensagens de erro. Serialize apenas um resumo seguro (ex.: últimos 4 dígitos).

---

## Fidelidade a API externa

- **Nunca invente** campos, endpoints ou comportamentos de uma API de terceiros. Verifique contra
  a documentação oficial, ou **pergunte** — não simule o que você não confirmou que existe.
- Resolva todo acesso a uma capacidade externa por uma **única função central**, para que
  overrides/herança e credenciais sejam decididos num só lugar, nunca assumidos ad hoc.

---

## Confiabilidade: idempotência & auditabilidade

- **Tratamento idempotente de eventos.** Webhooks e processadores de eventos devem ser
  idempotentes: um evento reentregue não pode duplicar efeitos (ex.: nunca emitir duas notas para
  um pagamento). Verifique se o evento já foi tratado antes de agir.
- **Auditar toda escrita relevante de estado.** Create/update/delete em entidades financeiras, de
  agendamento ou de outra forma consequentes acrescenta um registro a um **log de auditoria** —
  best-effort, nunca contendo segredos, nunca podendo derrubar a operação de negócio.

---

## Padrões de isolamento & gating

Para produtos onde se aplicam, são inegociáveis:

- **Isolamento por dono (multi-tenant).** Se os dados são de posse por tenant/conta, **toda**
  query é escopada pelo id do dono; um dono **nunca** pode ler dados de outro.
- **Gating de capacidade.** Uma feature/módulo desativado retorna **not-found (404)** na rota, não
  apenas um botão escondido. A ausência deve ser indistinguível de "nunca existiu".
- **Higiene de identificadores.** Identificadores/slugs públicos são validados contra uma lista de
  reservados e únicos no seu escopo.

---

## Privacidade por padrão

- Armazene **apenas** o que a feature estritamente precisa. Evite classes inteiras de dados
  sensíveis que o produto não requer (ex.: prontuários/dados de saúde para uma ferramenta de
  agenda-e-cobrança).
- Prefira a opção mais preservadora de privacidade por padrão; não coloque dado pessoal onde ele
  não pertence (URLs, logs, terceiros não solicitados).
