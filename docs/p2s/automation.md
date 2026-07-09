# P2S — Automação: Scripts no Lugar da IA

> Este é o **pilar de apoio** do P2S (segundo nível, a serviço dos três inegociáveis — ver
> [`principles.md`](principles.md#pilar-de-apoio-automação)). Seu valor: **economia de tokens** e
> **integridade**.

**Trabalho repetitivo e determinístico pertence a scripts e git hooks — não ao prompt de um
agente.** O agente *orquestra e raciocina*; a maquinaria *garante os invariantes* sempre do mesmo
jeito. Isso mantém o agente barato e rápido, e torna **impossível "esquecer" um portão**: um
humano ou uma IA pode pular um item de checklist, mas um pre-commit hook não pode.

## A linha divisória

Pergunte de qualquer passo: *"Isto exige julgamento, ou só execução?"*

| Faça num **script / hook** (determinístico) | Faça com o **agente** (julgamento) |
| :--- | :--- |
| Rodar a suíte de testes | Decidir *o que* testar e escrever os testes |
| Lint / format | Resolver uma dúvida de design ou arquitetura |
| Auditar dependências por vulnerabilidades | Escolher qual dependência adotar |
| Rodar o build de produção / type-check | Interpretar uma falha de build e corrigir a causa |
| Pular o build de deploy em commits só-de-doc | Escrever a documentação |
| Bloquear um push quando a suíte está vermelha | Diagnosticar *por que* a suíte ficou vermelha |

Se um passo é igual toda vez e tem um pass/fail binário, deve ser um script. O trabalho do agente
é reagir ao veredito do script, não refazer a checagem na mão.

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
