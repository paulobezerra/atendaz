# P2S — Automação: Scripts no Lugar da IA

> Este é o **pilar de apoio** do P2S — **DRY & automação** (segundo nível, a serviço dos três
> inegociáveis — ver [`principles.md`](principles.md#pilar-de-apoio-dry--automação)). Regra-base:
> **nunca faça duas vezes a mesma coisa** — reuse/referencie, e o que for determinístico, automatize.
> Ganhos: **economia de tokens/esforço** e **integridade**.

**Trabalho repetitivo e determinístico pertence a scripts e git hooks — não ao prompt de um
agente.** O agente *orquestra e raciocina*; a maquinaria *garante os invariantes* sempre do mesmo
jeito. Isso mantém o agente barato e rápido, e torna **impossível "esquecer" um portão**: um
humano ou uma IA pode pular um item de checklist, mas um pre-commit hook não pode.

## A linha divisória

Pergunte de qualquer passo: *"Isto exige julgamento, ou só execução?"*

| Faça num **script / hook** (determinístico) | Faça com o **agente** (julgamento) |
| :--- | :--- |
| Rodar a suíte de testes (o `p2s-review` a **invoca**, não a reimplementa) | Decidir *o que* testar e escrever os testes; revisar consistência |
| Lint / format | Resolver uma dúvida de design ou arquitetura |
| Auditar dependências por vulnerabilidades | Escolher qual dependência adotar |
| Rodar o build de produção / type-check | Interpretar uma falha de build e corrigir a causa |
| Pular o build de deploy em commits só-de-doc | Escrever a documentação |
| Bloquear um push quando a suíte está vermelha | Diagnosticar *por que* a suíte ficou vermelha |
| **Mecânica de git/promoção** (branch, merge, PR, deploy) — do git flow do projeto | Decidir *quando* a feature está logicamente pronta para promover |

Se um passo é igual toda vez e tem um pass/fail binário, deve ser um script. O trabalho do agente
é reagir ao veredito do script, não refazer a checagem na mão. **Não existe `p2s-test`**: rodar
testes é script — o `p2s-review` dispara e lê o veredito. E a **promoção ao tronco** (merge/PR) é do
projeto/automação: a IA nunca a executa por conta própria.

## Onde as checagens vivem

- **Pre-commit hook** — as checagens rápidas de integridade (no mínimo, a suíte de testes). Um
  resultado vermelho aborta o commit.
- **Pre-push hook** — o portão que protege branches compartilhadas (a suíte, e o audit de
  vulnerabilidade das dependências de produção). Uma falha **bloqueia o push por design**.
- **Ignored-build step** — um script versionado que diz ao host para **pular o build** quando um
  commit só tocou caminhos de documentação/tooling, para que commits de `p2s-doc` não deployem.
- **CI (opcional)** — os mesmos scripts, re-executados no servidor como rede de segurança.

Todo hook é apenas um invólucro fino que chama um **script versionado** no repo, para que a lógica
seja revisável, testável e idêntica para todo contribuidor e todo agente.

## Prefira hooks a fazer no comando

Um comando como o `p2s-done` **não** deve reimplementar CI/CD na mão, no raciocínio do agente.
Deve **confiar** que os hooks/scripts já garantiram os invariantes, e se ocupar só da parte de
julgamento (é a coisa certa a mergear? produção de fato se comportou?). Concretamente: empurre as
checagens **para baixo**, para husky/CI, sempre que forem determinísticas, e deixe os comandos as
assumirem. Quanto menos o agente re-deriva uma checagem mecânica, menos ele pode errá-la.

## Regras

1. **Uma nova checagem repetitiva é script primeiro.** Se você se pega fazendo a mesma verificação
   mecânica entre features, proponha movê-la para um hook/script (via `p2s-code`, já que scripts
   são código) em vez de embuti-la num prompt.
2. **Hooks são estruturais, não consultivos.** Um portão que falha bloqueia a ação; nunca é
   "avisa e continua".
3. **Scripts são versionados e revisáveis.** Sem automação escondida só-local — o time inteiro (e
   todo agente) roda as checagens idênticas.
4. **O agente confia no veredito do script.** No verde, prossegue; no vermelho, diagnostica a
   causa — não re-roda a checagem na mão para "conferir" o que o script já decidiu.

## Economia de tokens & compactação de contexto (opcional)

DRY vale também para o **contexto**: não re-alimente nem re-derive o que já existe. Estas são
otimizações **opcionais e plugáveis** — o P2S fica agnóstico, apenas as recomenda. Três famílias:

1. **Compressão de prompt/contexto.** Um modelo pequeno descarta tokens de baixo valor antes do
   modelo grande (ex.: **LLMLingua / LLMLingua-2**, open-source; ~2–5× típico). Bom para contexto
   longo/RAG.
2. **Multiagente com sumarização.** Um subagente especialista faz a varredura pesada (ler muitos
   arquivos, digerir logs, pesquisar) e **retorna só um resumo compacto** — a saída bruta **nunca
   entra** no contexto principal. É a opção **nativa do harness** (subagentes/forks) e **sem
   dependência externa** — ver abaixo.
3. **Gestão nativa de contexto.** Evicção de tool-results obsoletos, *prompt caching*, memória/RAG
   (carregar doc sob demanda) e auto-compactação em fronteiras de subtarefa.

**Regra dura — nunca compacte a fonte da verdade.** Compacta-se o **transitório e verboso** (tool
output, logs, histórico, resultados intermediários). **Jamais** a spec, os protótipos/contratos
aprovados, os guardrails ou a constitution — comprimir o load-bearing viola o pilar 3 (spec como
fonte da verdade). Compressão é apoio; se apaga o que decide comportamento, quebrou.

## O subagente sumarizador (instalado neste repo)

Este repositório traz o subagente **`summarizer`** (`.claude/agents/summarizer.md`) — a
implementação da família 2 acima. Delegue a ele varreduras amplas e read-only (ler spec×plan×código
para o `p2s-review`, digerir logs, pesquisa exploratória): ele roda em modelo barato, mantém a saída
bruta fora do seu contexto e devolve um **resumo denso** (fatos load-bearing, `arquivo:linha`, a
resposta), nunca um dump. É o "filtro" de token do projeto, honrando a regra dura acima.
