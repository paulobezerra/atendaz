---
description: Executa a bateria de testes (local Jest ou prod Cypress)
argument-hint: "local|prod"
---

Você recebeu o comando do projeto `/ssd-test $ARGUMENTS`.

Conforme `docs/00-agent-instructions.md`, esta é a única porta para executar baterias de testes:
- `local`: rode `npm run test:local` (Jest + Supertest contra MongoDB em memória).
- `prod`: rode `npm run test:prod` (Cypress headless contra a URL de produção na Vercel).

Reporte os resultados detalhados como evidência para o DOD (Definition of Done).

Ambiente: $ARGUMENTS
