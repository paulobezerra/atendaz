# SSD — Spec-Sourced Development

> O **SSD** é um framework pessoal, **agnóstico de tecnologia e de agente**, para construir
> software **com** agentes de IA sem perder o controle do código. Ele funciona igual seja o
> agente Claude, Junie, Gemini, Cursor ou um humano, e seja a stack Next.js, Rails ou Go. Esta
> pasta (`docs/ssd/`) é o framework em si — copie-a para qualquer repositório para rodar o
> método. Tudo que é específico de um produto vive em outro lugar (ver
> [Organização do repositório](#organização-do-repositório)).
>
> **Leia isto como o livro de regras.** Se o SSD fosse um RPG de mesa, `docs/ssd/` é o **livro
> do mestre**: ensina a IA *como o jogo é jogado* — como construir a documentação, as specs, os
> planos e a implementação, em que ordem, por quais portões, sob quais políticas de qualidade.
> Ele deliberadamente **não diz qual tecnologia faz o quê** (isso é decisão do produto, em
> `docs/project/`). Ele *guia*, sim, **como** uma tecnologia é escolhida quando a escolha é, na
> verdade, uma decisão de qualidade — ex.: "sempre a release estável/LTS mais recente, nunca um
> prerelease" é regra de qualidade, não preferência de stack, então mora aqui.

> ℹ️ **Nome — precisa da sua confirmação.** "SSD" é usado como prefixo dos comandos
> (`ssd-plan`, `ssd-code`, …). A expansão *"Spec-Sourced Development"* é um **placeholder**
> escolhido para combinar com os pilares abaixo — troque pelo nome real se você já tiver um.

## Por que o SSD existe

Agentes de código são rápidos, mas sem supervisão eles derivam: inventam comportamento que a
spec nunca descreveu, refatoram o que ninguém pediu e declaram "pronto" o que nunca foi
verificado. O SSD mantém o humano no controle fazendo da **especificação — não do código — a
fonte da verdade**, e forçando toda mudança por um conjunto pequeno de **comandos nomeados** com
**portões explícitos** entre eles. O agente executa; o humano valida em cada portão.

## Os três pilares inegociáveis

Estas são as regras que sustentam tudo. O resto do framework serve a elas. Não dobram por prazo.
Ver [`principles.md`](principles.md) para o enunciado completo de cada um.

1. **Testes antes de tocar no código.** Lógica crítica é escrita test-first; a correção de bug
   começa pelo teste que falha e a reproduz. "Verde" que não cobre a superfície alterada não é
   pronto.
2. **Prototipação da fronteira (interface e contrato de dados) antes de implementar.** Tudo que
   entra e sai da aplicação — telas **e** contratos de API — é prototipado de forma **navegável**
   (protótipo clicável + OpenAPI/API fake) e aprovado antes de qualquer código real. O humano tem
   controle total das fronteiras da app, testando-as via protótipo primeiro.
3. **Spec como fonte da verdade, não o código.** O comportamento é decidido na spec primeiro; o
   código é a spec tornada executável. Quando divergem, a spec está certa e o código tem um bug.

## Os comandos

O SSD é conduzido por seis comandos prefixados. Cada um é uma **fronteira rígida** sobre o que
pode mudar, e cada um termina passando o bastão para o próximo, com um portão humano no meio.
Definições completas em [`commands.md`](commands.md).

| Comando | Governa | Produz |
| :--- | :--- | :--- |
| `ssd-doc` | Documentação base/transversal | Docs atualizados no tronco |
| `ssd-spec` | A spec da feature via **prototipação navegável** (UI + contrato de dados) | Spec + protótipos (clicável + OpenAPI/API fake) no tronco |
| `ssd-plan` | O plano de execução | Branch da feature + plano (sem código) |
| `ssd-code` | Código-fonte | Commits na branch da feature → deploy de stage |
| `ssd-test` | Execuções de teste | Evidência (local / stage / prod) |
| `ssd-done` | O merge no tronco | Feature fechada após prova em produção |

A cadeia canônica e as regras de "como fechar um comando" (sem hype, sempre apontando o próximo
passo) estão em [`commands.md`](commands.md#encadeamento-de-comandos).

## O que o SSD automatiza vs. o que o agente faz

Checagens repetitivas e determinísticas pertencem a **scripts e git hooks**, não ao prompt de um
agente. O agente orquestra e raciocina; husky/CI garantem os invariantes (lint, testes, audit,
regra de pular build) sempre do mesmo jeito. Isso mantém o agente barato, rápido e incapaz de
"esquecer" um portão. Ver [`automation.md`](automation.md).

## Portões de governança

- **DOR (Definition of Ready)** — uma spec só entra no `ssd-plan` quando está sem ambiguidade,
  com a UI prototipada e aprovada, e com as necessidades de ambiente conhecidas.
- **DOD (Definition of Done)** — uma feature só é "pronta" após verificada **em produção**, com
  evidência.

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
├── ssd/          ← ESTE framework (agnóstico, copie para qualquer repo)
│   ├── README.md      — o que é o SSD (este arquivo)
│   ├── principles.md  — os três pilares inegociáveis, por extenso
│   ├── commands.md    — definições dos comandos, portões, encadeamento, fechamento
│   ├── workflow.md    — branches, ambientes, deploy (parametrizável)
│   ├── quality.md     — política de testes, dependências/versões & segurança
│   └── automation.md  — scripts/hooks no lugar da IA para checagens repetitivas
└── project/      ← a instância do produto específico (em qualquer idioma)
    ├── base/          — visão, arquitetura, modelo de dados, guardrails, design system…
    ├── spec/          — uma spec por feature (fonte da verdade)
    └── plans/         — um plano de execução por feature
```

O framework é **agnóstico**; a pasta `project/` é onde um produto concreto (seu domínio, stack e
regras) se pluga. Arquivos de atalho de agente (`.claude/`, configs de IDE) apenas
**redirecionam** para estes documentos — nunca guardam regras próprias.
