# Protótipos de Tela

Workspace **vivo** de protótipos HTML estáticos por tela — ver
[`docs/00-agent-instructions.md` → "Prototipação de Telas"](../../docs/00-agent-instructions.md#prototipação-de-telas-obrigatória-para-telas-novas-ou-refeitas).

Diferente de [`../referencia/`](../referencia/) (referência visual **fixa** — landing/dashboard de
exemplo, não muda por feature), aqui cada arquivo é o protótipo **de uma tela específica**, em
refinamento até o usuário aprovar. Um arquivo só é considerado "pronto" quando o código React/Next
correspondente o replica fielmente.

## Convenção

- Um arquivo por tela: `{slug}.html` (ex.: `login.html`, `onboarding.html`).
- Mesmo espírito de `../referencia/`: **HTML puro + Tailwind via CDN + JS vanilla quando precisar de
  interação** (toggle, abas, estados). Sem framework, sem build, sem dados/API reais — só o visual e
  o comportamento de interface.
- O protótipo é apresentado ao usuário (normalmente via Artifact) para revisão; ajustado em ciclo até
  aprovação **explícita**.
- Depois de aprovado, o arquivo **permanece no repo** como registro histórico da decisão visual — não
  é descartado após a implementação em código.

## Estado atual (F0002.7)

Em prototipação — ver `docs/plans/0002.7-ux-corrections.md` (na branch `feature/0002.7-ux-corrections`,
seção H, tarefa T27) para o acompanhamento tela a tela.
