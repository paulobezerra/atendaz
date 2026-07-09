# Protótipos de Fronteira

Workspace **vivo** de protótipos **navegáveis e descartáveis** por fronteira — ver
[`docs/p2s/principles.md` → §2 (prototipação da fronteira inteira)](../../docs/p2s/principles.md)
e o comando [`p2s-spec`](../../docs/p2s/commands.md). Aqui o usuário **testa e aprova** cada
fronteira **antes** de qualquer código real; **todo protótipo aprovado vira spec**.

Diferente de [`../referencia/`](../referencia/) (referência visual **fixa** — landing/dashboard de
exemplo, não muda por feature), aqui cada arquivo é o protótipo **de uma fronteira específica**, em
refinamento até o usuário aprovar.

## Convenção

- **UX/telas** — um arquivo por tela: `{slug}.html` (ex.: `login.html`, `onboarding.html`).
- **Contrato de API** — em [`api/`](./api/): uma **doc OpenAPI** `api/{feature}.yaml` e/ou uma
  **API fake executável** (mock) que o usuário consegue chamar.
- Mesmo espírito de `../referencia/`: **HTML puro + Tailwind via CDN + JS vanilla quando precisar de
  interação** (toggle, abas, estados). Sem framework, sem build, sem dados/API reais — só o visual e
  o comportamento de interface.
- O protótipo é apresentado ao usuário (normalmente via Artifact) para revisão; ajustado em ciclo até
  aprovação **explícita**.

## Descartável (regra dura do P2S)

O protótipo é **barato e descartável**: **nunca**, em hipótese alguma, é reaproveitado como código
de produção — ele serve para **decidir a fronteira** e a decisão vira spec. Ele **permanece
versionado** no repo e **linkado na spec** como registro da decisão aprovada (é contra ele que a
revisão humana compara a implementação), mas isso **não** o torna parte da solução: o código
React/Next é escrito do zero, replicando o protótipo, nunca colando-o.

## Estado atual (F0002.7)

Ver `docs/project/plans/archive/0002.7-ux-corrections.md` (seção H) para o acompanhamento tela a tela.
