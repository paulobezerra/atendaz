# P2S — Prototype-to-Spec

> O **P2S** é um framework pessoal, **agnóstico de tecnologia e de agente**, para construir
> software **com** agentes de IA sem perder o controle do código. Ele funciona igual seja o
> agente Claude, Junie, Gemini, Cursor ou um humano, e seja a stack Next.js, Rails ou Go. Esta
> pasta (`docs/p2s/`) é o framework em si — copie-a para qualquer repositório para rodar o
> método. Tudo que é específico de um produto vive em outro lugar (ver
> [Organização do repositório](#organização-do-repositório)).
>
> **Leia isto como o livro de regras.** Se o P2S fosse um RPG de mesa, `docs/p2s/` é o **livro
> do mestre**: ensina a IA *como o jogo é jogado* — como construir a documentação, as specs, os
> planos e a implementação, em que ordem, por quais portões, sob quais políticas de qualidade.
> Ele deliberadamente **não diz qual tecnologia faz o quê** (isso é decisão do produto, em
> `docs/project/`). Ele *guia*, sim, **como** uma tecnologia é escolhida quando a escolha é, na
> verdade, uma decisão de qualidade — ex.: "sempre a release estável/LTS mais recente, nunca um
> prerelease" é regra de qualidade, não preferência de stack, então mora aqui.

> 🎯 **Para quem.** O P2S é desenhado para o **desenvolvedor solitário** que constrói com agentes
> de IA — um ciclo de vida completo, da ideia à produção, em que uma pessoa só mantém o controle
> total do que entra e sai da aplicação.

## Por que o P2S existe

Agentes de código são rápidos, mas sem supervisão eles derivam: inventam comportamento que a
spec nunca descreveu, refatoram o que ninguém pediu e declaram "pronto" o que nunca foi
verificado. O P2S mantém o humano no controle fazendo da **especificação — não do código — a
fonte da verdade**, e forçando toda mudança por um conjunto pequeno de **comandos nomeados** com
**portões explícitos** entre eles. O agente executa; o humano valida em cada portão.

**Onde o P2S se diferencia.** Ter a spec como fonte da verdade já é uma categoria estabelecida —
*Spec-Driven Development* (Kiro, GitHub Spec Kit, Tessl, BMAD…). Nessas ferramentas o humano
aprova um **texto**. No P2S, o que o humano aprova é um **protótipo navegável e descartável de
toda a fronteira** (UI clicável + API fake chamável + formato do dado persistido + integrações
externas), e **o protótipo aprovado é que vira a spec** — daí o nome *Prototype-to-Spec*. O
protótipo não é o produto: é o instrumento de **teste antes do código**, jogado fora depois de
decidir a fronteira. A IA **não** define sozinha modelo de dados, UX, contrato de API ou
integração; ela **propõe um protótipo para ser testado e aprovado**, isolando cada decisão.

**A tese.** O gasto de tokens para prototipar a fronteira **economiza** tokens na codificação e
aproxima de **zero** as alucinações — e, com elas, os ciclos de correção de bug que nascem de
adivinhação. Decidir a fronteira num protótipo barato custa segundos; descobrir o erro depois do
código custa um ciclo inteiro de código + teste + deploy. **Teste antes do código** é o fio que
costura os três pilares: prototipa-se e valida-se **antes** de escrever qualquer linha de produção.

## Os três pilares inegociáveis

Estas são as regras que sustentam tudo. O resto do framework serve a elas. Não dobram por prazo.
Ver [`principles.md`](principles.md) para o enunciado completo de cada um.

1. **Testes antes de tocar no código.** Lógica crítica é escrita test-first; a correção de bug
   começa pelo teste que falha e a reproduz. "Verde" que não cobre a superfície alterada não é
   pronto.
2. **Prototipação da fronteira inteira antes de implementar.** Tudo que entra e sai da aplicação —
   **UX/telas, contratos de API, formato dos dados persistidos e integrações externas** — é
   prototipado de forma **navegável** (protótipo clicável + OpenAPI/API fake) e aprovado antes de
   qualquer código real. **Todo protótipo aprovado vira spec.** O protótipo é **barato e
   descartável** (nunca vira parte da solução) e realista o bastante para dar impressão nítida do
   resultado; quando nem isso compensa, o certo é **não prototipar** e registrar no DOR.
3. **Spec como fonte da verdade, não o código.** O comportamento é decidido na spec primeiro; o
   código é a spec tornada executável. Quando divergem, a spec está certa e o código tem um bug.

E um **pilar de apoio** (segundo nível): **automação.** Todo trabalho determinístico (rodar testes,
lint, build, audit, pular o deploy de um commit só-de-doc) vive em **scripts e git hooks**, não no
prompt — economiza tokens e torna impossível "esquecer" um portão. Ele **serve** aos três
inegociáveis; ver [`principles.md`](principles.md).

## Os comandos

O P2S é conduzido por **oito comandos prefixados, em duas fases**. Cada um é uma **fronteira
rígida**, e cada um passa o bastão por um portão humano. Definições completas em
[`commands.md`](commands.md). O framework é **agnóstico de git flow**: mecânica de
branch/merge/PR/push é do projeto, e a IA **nunca** muta o tronco por conta própria.

**Upstream — partida & manutenção** (re-executáveis):

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `p2s-discovery` | Descoberta de **produto** | constitution + roadmap |
| `p2s-design` | Descoberta de **design/UX** (links + imagens) | Referência navegável em `templates/referencia/` + design-system |

**Transversal:**

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `p2s-doc` | Docs ↔ **realidade** (engenharia reversa / reconciliação) | Base docs fiéis ao que existe |

**Downstream — o loop por feature:**

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `p2s-spec` | A spec via **prototipação navegável** (UX, API, dados, integrações) | Spec + protótipos |
| `p2s-plan` | O plano (**cenários BDD** + inventário cria/altera/exclui) | Plano (sem código) |
| `p2s-code` | Código-fonte | Implementação (TDD) no fluxo de branch do projeto |
| `p2s-review` | QA: **testes (script) + revisão holística** | Achados por severidade (bloqueante/major/medium/minor) |
| `p2s-done` | **Fechamento lógico** (arquiva, marca concluído) | Feature pronta; promoção entregue ao git flow do projeto |

A cadeia canônica e as regras de "como fechar um comando" (sem hype) estão em
[`commands.md`](commands.md#encadeamento-de-comandos).

## O que o P2S automatiza vs. o que o agente faz

Checagens repetitivas e determinísticas — e a **mecânica de git/promoção** — pertencem a **scripts,
git hooks e ao git flow do projeto**, não ao prompt de um agente. O agente orquestra e raciocina;
husky/CI garantem os invariantes (lint, testes, audit, pular build). **Não há `p2s-test`**: rodar
testes é script, disparado e lido pelo `p2s-review`. Ver [`automation.md`](automation.md).

## Portões de governança

- **DOR (Definition of Ready)** — uma spec só entra no `p2s-plan` quando está sem ambiguidade,
  com **cada fronteira prototipada e aprovada** (ou justificativa de não prototipar), e com as
  necessidades de ambiente conhecidas.
- **DOD (Definition of Done)** — **agnóstico de ambiente**: a feature é "pronta" quando o
  `p2s-review` não tem bloqueantes **e** a **validação definida pelo projeto** passou (produção
  quando há; ou QA/homologação/stage) — não "produção" hardcoded.

## Políticas de qualidade

O framework carrega os **controles de qualidade e políticas de engenharia** que todo produto
deve obedecer independentemente da stack — a política de testes, as regras de dependência/versão
(só estável/LTS mais recente, sem prerelease, zero vulnerabilidades conhecidas em dependências de
produção), disciplina de segredos & API externa, idempotência & auditabilidade, e os padrões de
isolamento/gating. Estão enunciadas de forma neutra em [`quality.md`](quality.md); um produto
mapeia cada uma para sua stack concreta em `docs/project/`.

## Organização do repositório

```
docs/
├── p2s/          ← ESTE framework (agnóstico, copie para qualquer repo)
│   ├── README.md            — o que é o P2S (este arquivo)
│   ├── principles.md        — os três pilares inegociáveis + o de apoio, por extenso
│   ├── commands.md          — definições dos comandos, portões, encadeamento, fechamento
│   ├── workflow.md          — branches, ambientes, deploy, ciclo de vida do descartável
│   ├── quality.md           — política de testes, dependências/versões & segurança
│   ├── automation.md        — scripts/hooks no lugar da IA para checagens repetitivas
│   └── project-structure.md — o MANIFESTO: quais arquivos o produto deve ter e para quê
└── project/      ← a instância do produto específico (em qualquer idioma)
    ├── base/          — a "lei" durável do produto (ver project-structure.md)
    │   ├── constitution.md    — domínio/tenancy, arquitetura, stack, guardrails, escopo
    │   ├── data-model.md      — modelo de dados (gerado por protótipo ER navegável)
    │   ├── roadmap.md         — ordem das features
    │   ├── environment.md     — variáveis de ambiente por fase
    │   ├── design-system.md   — fundação de UX (saída do p2s-design)
    │   └── workflow.md        — git flow & ambientes CONCRETOS do projeto
    ├── spec/          — uma spec por feature (fonte da verdade)
    └── plans/         — um plano de execução por feature (descartável)
```

> A estrutura de `project/` é um **contrato definido pelo framework** (ver
> [`project-structure.md`](project-structure.md)): abrir `project/base` de qualquer produto P2S
> deve trazer os **mesmos arquivos com os mesmos papéis** — previsibilidade e portabilidade.

O framework é **agnóstico**; a pasta `project/` é onde um produto concreto (seu domínio, stack e
regras) se pluga. Arquivos de atalho de agente (`.claude/`, configs de IDE) apenas
**redirecionam** para estes documentos — nunca guardam regras próprias.
