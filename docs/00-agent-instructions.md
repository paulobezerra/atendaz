# Instruções para Agentes (Junie, Claude, Gemini, etc.)

Este documento orienta como qualquer agente deve trabalhar neste projeto. A premissa fundamental é: **A documentação é a fonte da verdade.**

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

0. **Separação Estrita de Comandos**: O agente deve respeitar o comando recebido como um limite físico de ação.
   - `/plan`: **PROIBIDO** criar, editar, deletar arquivos de código, executar testes que alterem estado do banco local (exceto via mocks) ou realizar `git commit/push`. Sua única função é gerar documentação em `docs/plans/`. O agente **não deve** tentar corrigir erros de código encontrados durante a análise do plano; deve apenas reportá-los como débitos técnicos no arquivo de plano.
   - `/code`: **ÚNICA** porta de entrada para modificação do código-fonte e execução de correções técnicas.
   - `/test`: **ÚNICA** porta de entrada para execução de baterias de testes (Jest/Cypress). O comando `/plan` não deve disparar testes reais.

1. **Documentação Antes do Código**: Nenhuma funcionalidade deve ser implementada sem que sua especificação (`docs/spec`) e seu plano de execução (`docs/plans`) estejam alinhados.
2. **Registro de Mudanças**: Qualquer alteração na lógica de negócio ou arquitetura deve ser refletida primeiro nos arquivos em `docs/` antes de tocar no código.
3. **Comandos de Mini Agentes**:
   - `/plan {ID}`: Ativa o [Mini Agente de Planejamento](agent-plan-instructions.md). O agente deve:
     - **Validar a Spec**: Antes de planejar, o agente deve analisar a especificação `docs/spec/F{ID}-...` contra toda a documentação base (`docs/01` a `docs/09`). Se houver ambiguidades, conflitos com os Guardrails ou falta de detalhes técnicos, o agente deve interromper e solicitar clarificação via `/doc`.
     - **Auditoria de Segurança (DOR)**: O agente deve verificar se a stack proposta utiliza as versões estáveis mais recentes. É obrigatório planejar a execução do `npm audit` para garantir **vulnerabilidade zero** antes da implementação.
     - **Check de Envs**: O agente deve verificar se as variáveis de ambiente necessárias para a fase (conforme `docs/05-environment-variables.md`) estão presentes. O plano deve conter instruções passo a passo de onde e como inserir as variáveis faltantes, tanto para **Desenvolvimento Local** (`.env.local`) quanto para **Produção** (Painel da Vercel).
     - **Check de Infraestrutura**: Para a Fase 0, o plano deve orientar sobre a conexão do repositório GitHub com o projeto na Vercel e o provisionamento do MongoDB.
     - Ler **toda a documentação de suporte** para garantir alinhamento total.
     - **Cronograma de Ações Manuais**: O plano deve listar de forma cronológica as ações que dependem do usuário, indicando o momento exato (ex: "Após o primeiro push", "Antes de rodar o /code X").
     - Ler **toda a documentação de suporte** para garantir alinhamento total.
   - `/code {ID}`: Ativa o [Mini Agente de Implementação](agent-code-instructions.md). O agente deve:
     - Ler a especificação e o plano correspondente.
     - Revalidar os Guardrails em `docs/07-guardrails.md`.
     - **Bloqueio de Integridade**: É TERMINANTEMENTE PROIBIDO realizar `git push` se os testes locais (`/test local`) estiverem falhando. O agente deve reportar o erro e corrigir localmente primeiro.
     - Proceder com a implementação, garantindo que os critérios de aceite sejam atendidos.
   - `/doc {TÓPICO}`: Ativa o fluxo de atualização de documentação/arquitetura. O agente deve:
     - Localizar o documento pertinente ao tópico (especificações, modelo de dados, requisitos, etc.).
     - Refletir a nova decisão, garantindo que não quebre a consistência com os outros documentos.
     - Atualizar o `README.md` ou `docs/02-architecture-principles.md` se for uma decisão transversal.
   - `/test {local|prod}`: Executa a bateria de testes automatizados. 
     - `local`: Roda testes de integração via Jest/Supertest contra o ambiente de desenvolvimento.
     - `prod`: Roda testes E2E via Cypress (headless) contra a URL de produção.
     - O agente deve reportar os resultados detalhados como evidência para o DOD.
   - `/done {ID}`: Comando exclusivo do usuário. O agente deve:
     - Marcar a especificação `docs/spec/F{ID}` e o Roadmap `docs/06` como **[CONCLUÍDO]**.
     - Arquivar o plano em `docs/plans/archive/`.

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
