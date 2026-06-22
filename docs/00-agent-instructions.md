# Instruções para Agentes (Junie, Claude, Gemini, etc.)

Este documento orienta como qualquer agente deve trabalhar neste projeto. A premissa fundamental é: **A documentação é a fonte da verdade.**

## Fonte da Verdade dos Comandos

As regras do fluxo de trabalho (comandos, branches, ambientes, deploy, DOR/DOD) vivem **exclusivamente** em `docs/`. Arquivos de configuração específicos de um agente — como `.claude/commands/` (Claude Code), e equivalentes de Junie, Gemini, Cursor, etc. — são **apenas atalhos/redirecionamentos** que apontam para esta documentação.

- **NUNCA** trate a configuração de um agente como fonte da verdade nem duplique regras nela.
- Ao trocar de agente, basta recriar os atalhos apontando para `docs/` — nenhuma regra é perdida.
- Qualquer mudança de processo é feita **aqui** (via `/ssd-doc`), não nos arquivos de comando.

## Conceitos Fundamentais (Hierarquia)

Para evitar confusão de contexto, o agente deve SEMPRE distinguir as três camadas:
1. **Plataforma**: Gerenciada pelo Paulo (Dono do Sistema). O cliente da plataforma é o **Tenant**.
2. **Tenant (Business)**: A empresa ou profissional que assina o Atendaz (ex: Barbearia, Clínica). É o "dono" dos dados e quem paga a assinatura.
3. **Cliente (Paciente/Final)**: O consumidor final atendido pelo Tenant.

## Conceitos de Governança (DOR e DOD)

- **DOR (Definition of Ready)**: Antes de iniciar o `/code`, a Spec e o Plano devem estar tão detalhados que não reste dúvida sobre a execução passo a passo. Se o agente encontrar um problema imprevisto no código, deve PARAR e solicitar revisão da documentação via `/doc`.
- **DOD (Definition of Done)**: Uma feature só é "Done" após validação em produção. Isso deve ser comprovado por evidências (logs de sucesso, print de tela ou execução de testes automatizados de fumaça/E2E em produção).

## Memória e Contexto de Sessão

Para evitar alucinações e perda de contexto em novas sessões, o agente deve:
1. **Leitura Obrigatória**: No início de cada sessão, ler `docs/00-agent-instructions.md`, `docs/06-implementation-roadmap.md` e o `README.md`.
2. **Sincronização de Estado**: Antes de qualquer ação, verificar o último plano executado em `docs/plans/` e o estado atual das especificações.
3. **Protocolo Warm-up (Sessão Limpa)**: Antes de iniciar o `/code`, o agente deve validar se o `package.json` está alinhado com a **Golden Stack** do README e se não há vulnerabilidades (`npm audit`).
4. **Persistência de Decisões**: Decisões arquiteturais tomadas durante a sessão devem ser registradas em `docs/02-architecture-principles.md` ou no `README.md` antes do encerramento.

## Fluxo de Trabalho Obrigatório

0. **Separação Estrita de Comandos**: O agente deve respeitar o comando recebido como um limite físico de ação. Os comandos reais têm o prefixo `ssd-` (ver `.claude/commands/`); o `git` se comporta conforme o [Fluxo de Branches, Ambientes e Deploy](#fluxo-de-branches-ambientes-e-deploy).
   - `/ssd-plan`: **PROIBIDO** criar, editar ou deletar arquivos de **código** e executar testes que alterem estado real. Pode (e deve) **criar a branch `feature/{ID}-{slug}`** e commitar o documento de plano `docs/plans/{ID}-*` **nessa branch**. O agente **não deve** corrigir erros de código encontrados durante a análise; deve apenas reportá-los como débitos técnicos no plano.
   - `/ssd-code`: **ÚNICA** porta de entrada para modificação do código-fonte e correções técnicas. Trabalha sempre na branch da feature; `push` da branch gera o deploy de **homologação (stage/Preview)**.
   - `/ssd-test`: **ÚNICA** porta de entrada para baterias de testes. Alvos: `local` (Jest), `stage` (Cypress no Preview) e `prod` (Cypress na Produção).
   - `/ssd-doc` e `/ssd-spec`: editam documentação base; commit direto na `master` (sem deploy — ver Ignored Build Step).
   - `/ssd-done`: **ÚNICO** comando que altera a `master` (merge da feature) e finaliza a feature.

1. **Documentação Antes do Código**: Nenhuma funcionalidade deve ser implementada sem que sua especificação (`docs/spec`) e seu plano de execução (`docs/plans`) estejam alinhados. A **UX** (fluxos + telas) faz parte da spec, sobre a fundação do Design System (`docs/10`) — ver [UX e Design System](#ux-e-design-system).
2. **Registro de Mudanças**: Qualquer alteração na lógica de negócio ou arquitetura deve ser refletida primeiro nos arquivos em `docs/` antes de tocar no código.
3. **Comandos de Mini Agentes**: Os comandos do fluxo têm o prefixo `ssd-`. Os arquivos em `.claude/commands/` (ou configs de outros agentes) são **apenas atalhos/redirecionamentos** para as regras abaixo — ver [Fonte da Verdade dos Comandos](#fonte-da-verdade-dos-comandos). O comportamento de Git/branch/deploy de cada comando está em [Fluxo de Branches, Ambientes e Deploy](#fluxo-de-branches-ambientes-e-deploy).
   - `/ssd-spec {ID} {tema}`: Cria/edita a especificação `docs/spec/F{ID}-...`, alinhada aos Guardrails (`docs/07`) e ao Modelo de Dados (`docs/04`). **Deve incluir a seção `## UX`** (fluxos + telas em ASCII) referenciando o Design System (`docs/10`). Commit direto na `master` (sem deploy).
   - `/ssd-plan {ID}`: Ativa o [Mini Agente de Planejamento](agent-plan-instructions.md). O agente deve:
     - Criar a branch `feature/{ID}-{slug}` e, ao final, commitar **apenas** o plano `docs/plans/{ID}-*` nela (nunca tocar código).
     - **Validar a Spec**: analisar `docs/spec/F{ID}-...` contra toda a base (`docs/01` a `docs/09`). Em caso de ambiguidade/conflito com Guardrails, interromper e pedir clarificação via `/ssd-doc`.
     - **Auditoria de Segurança (DOR)**: planejar `npm audit` com **vulnerabilidade zero** e versões estáveis mais recentes.
     - **Check de Envs**: verificar as variáveis necessárias à fase (`docs/05`), com passo a passo de onde obter e inserir cada uma (Local `.env.local` + Produção na Vercel).
     - **Check de Infraestrutura** e **Cronograma de Ações Manuais**: listar cronologicamente as ações que dependem do usuário, indicando o momento exato.
     - Ler **toda a documentação de suporte** para alinhamento total.
   - `/ssd-code {ID}`: Ativa o [Mini Agente de Implementação](agent-code-instructions.md). O agente deve:
     - Ler a spec e o plano correspondente; revalidar os Guardrails em `docs/07-guardrails.md`.
     - Trabalhar **na branch da feature**; o `push` publica em **stage (Preview)**.
     - **Bloqueio de Integridade**: PROIBIDO `git push` com `/ssd-test local` falhando — reportar e corrigir primeiro.
     - Implementar com TDD nas áreas críticas, garantindo os critérios de aceite.
   - `/ssd-doc {TÓPICO}`: Atualiza documentação/arquitetura. O agente deve:
     - Localizar o documento pertinente (specs, modelo de dados, requisitos, etc.) e refletir a decisão sem quebrar consistência.
     - Atualizar `README.md` ou `docs/02-architecture-principles.md` se for transversal. Commit direto na `master` (sem deploy).
   - `/ssd-test {local|stage|prod}`: Executa os testes e reporta o resultado como evidência para o DOD.
     - `local`: Jest/Supertest contra MongoDB em memória.
     - `stage`: Cypress (headless) contra a URL de **Preview** (homologação).
     - `prod`: Cypress (headless) contra a URL de **Produção**.
   - `/ssd-done {ID}`: Comando exclusivo do usuário; único que altera a `master`. O agente deve:
     - Exigir verde em `local` e `stage`; fazer `merge --no-ff` na `master` (mantendo a branch) e validar com `/ssd-test prod`.
     - **Só se passar em prod**: marcar `docs/spec/F{ID}` e o Roadmap `docs/06` como **[CONCLUÍDO]** e arquivar o plano em `docs/plans/archive/`. Se falhar, retornar ao ciclo de correção.

## UX e Design System

A UX é definida em **texto (Markdown)** — sem Figma — em duas camadas, para garantir consistência e evitar retrabalho visual:

1. **Fundação (global, uma vez)** — [`docs/10-design-system.md`](10-design-system.md): design tokens (cores, tipografia, espaçamento, radius), componentes base e padrões de UX globais (validação inline, estados loading/empty/error, toasts, listas controladas, mobile-first, acessibilidade). Reusada por todas as features.
2. **Por feature (na spec)** — cada `docs/spec/F{ID}` contém a seção **`## UX`** com:
   - **Fluxos**: happy path, validações e erros (comportamento).
   - **Telas**: layout em **ASCII** + comportamento, referenciando os tokens da fundação.

As telas são definidas no **spec** (fonte da verdade, revisado **antes** do código). O `/ssd-plan` transforma a UX do spec em tarefas; o `/ssd-code` implementa; o **gate de revisão humana valida a implementação contra a UX do spec**. Decisões visuais muito específicas (ícones, ilustrações, microanimações) vão em prosa na seção `## UX` ou ficam a critério razoável do agente.

## Diretrizes Gerais

- **Node.js**: Utilizar sempre a versão **LTS**.
- **Versões**: Priorizar versões estáveis e recentes das bibliotecas.
- **Ordem**: Seguir rigorosamente a ordem do `docs/06-implementation-roadmap.md`.
- **Qualidade**: Cada fase só termina com o critério de aceite passando (em produção, conforme especificado).
- **API Asaas**: Nunca inventar campos ou endpoints. Em dúvida, consultar a documentação oficial ou perguntar ao usuário.
- **TDD**: Aplicar TDD nas áreas críticas (idempotência, cálculos, resoluções de billing).
- **Modularidade**: Sempre verificar `business.modulos` antes de permitir qualquer ação de um módulo específico.

## Estrutura de Planos (`docs/plans`)

Os planos devem ser numerados de acordo com a especificação e conter:
- Checklist de tarefas técnicas.
- Arquivos que serão criados/modificados.
- Estratégia de testes para aquela feature específica.

## Fluxo de Branches, Ambientes e Deploy

### Branches
- **`master`**: branch de **Produção**. Só é alterada pelo `/ssd-done` (merge da feature). Deve permanecer sempre verde/deployável.
- **`feature/{ID}-{slug}`**: uma por feature. **Criada no `/ssd-plan`**, **mergeada no `/ssd-done`**, e **nunca deletada** (preserva o histórico/auditoria da feature).

### Ambientes
- **`local`**: testes Jest contra MongoDB em memória (working tree).
- **`stage` (homologação)**: deploy de **Preview** da Vercel, gerado a cada `push` na branch da feature. É onde validamos a feature deployada **antes** de tocar a produção.
- **`prod`**: deploy de **Produção** da Vercel, gerado pelo merge na `master`.

### Gatilhos de Git por comando
| Comando | Ação de Git / Deploy |
| :--- | :--- |
| `/ssd-spec {ID}` *(futuro)* | Commit da nova spec direto na `master`. **Não deploya** (Ignored Build Step). |
| `/ssd-doc {tema}` | Commit de documentação direto na `master`. **Não deploya.** |
| `/ssd-plan {ID}` | Cria `feature/{ID}-{slug}` a partir da `master`; commita **apenas** o plano na branch. Sem código. |
| `/ssd-code {ID}` | Commits incrementais na branch; `push` da branch → deploy de **stage (Preview)**. Nunca toca a `master`. |
| `/ssd-test {alvo}` | `local` (Jest) · `stage` (Cypress no Preview) · `prod` (Cypress na Produção). Não altera git. |
| `/ssd-done {ID}` | Exige verde em `local` **e** `stage`. Faz `merge --no-ff` na `master` (mantém a branch) → deploy de **prod** → roda `/ssd-test prod`. |

### Commit e Push Automáticos
Os comandos `ssd-*` têm **autorização permanente** para versionar: ao final de cada comando que produz alterações, o agente **DEVE** fazer `git commit` **e** `git push` automaticamente, **sem pausar para pedir confirmação**.
- `/ssd-spec`, `/ssd-doc`: commit + push na `master`.
- `/ssd-plan`: commit + push do plano na branch da feature.
- `/ssd-code`: commit(s) + push na branch da feature (publica em stage).
- `/ssd-done`: merge + push na `master`.
- `/ssd-test` não versiona (apenas executa testes).

Isso **não** afasta os bloqueios de integridade: o `push` do `/ssd-code` só ocorre com `/ssd-test local` verde, e o merge do `/ssd-done` só com `local` e `stage` verdes. Quando o portão passa, o agente prossegue com commit/push direto, sem perguntar.

### Gate de Revisão Humana (entre `/ssd-code` e `/ssd-done`)
Depois que o `/ssd-code` publica em **stage (Preview)** e **antes** de qualquer `/ssd-done`, existe um checkpoint **obrigatório e manual do usuário**. É o ponto onde o trabalho do agente é conferido e o rumo é corrigido — **o agente pode ter implementado errado, divergido da spec ou "viajado"**, e é aqui que isso é pego.

O usuário, neste momento:
1. **Testa manualmente** no Preview, comparando o comportamento com a spec e a expectativa real.
2. **Revisa o código** (diff da branch) — corretude, fidelidade à spec, qualidade, e os desvios/decisões que o agente registrou.
3. **Decide**:
   - **Aprovar** → segue para `/ssd-done`.
   - **Reprovar/ajustar** → volta ao ciclo de correção (`/ssd-code`, ou `/ssd-doc`/`/ssd-spec` se for lacuna de documentação), na mesma branch.

Regras para o agente:
- **Nunca** rodar `/ssd-done` por conta própria — é decisão exclusiva do usuário, tomada após esta revisão. Nada vai para produção sem ela.
- Ao concluir o `/ssd-code`, **apresentar um resumo** do que foi feito, dos desvios/decisões e do que precisa ser validado, para facilitar a revisão.
- Tratar este gate como a salvaguarda principal contra implementação fora do rumo — não presumir que "passou nos testes" significa "está correto conforme o esperado".

### Portão do DOD e Ciclo de Correção
- O `/ssd-done` **só** marca `docs/spec/F{ID}` e `docs/06` como `[CONCLUÍDO]` (e arquiva o plano) **se o `/ssd-test prod` passar**.
- **Se falhar em produção**, a feature **não** é concluída: retorna-se ao ciclo de correção `/ssd-code → /ssd-test → /ssd-done` (ou `/ssd-spec`/`/ssd-doc` se o erro revelar lacuna na spec), **na mesma branch**, até ficar verde. Como o `stage` já foi validado, falhas em `prod` tendem a ser específicas de ambiente e corrigidas por *fix-forward*.

### Deploys de Documentação (Ignored Build Step)
Para que commits **somente de documentação/tooling** na `master` (`/ssd-doc`, `/ssd-spec`) **não** gerem deploy de produção, a Vercel é configurada com um **Ignored Build Step** apontando para `scripts/vercel-ignore-build.sh`.
- **Ação manual (uma vez)**: Painel da Vercel → *Project Settings → Git → Ignored Build Step* → comando `bash scripts/vercel-ignore-build.sh`.
- O script pula o build quando o commit só alterou `docs/`, `*.md` ou `.claude/`.
