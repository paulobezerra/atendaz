# P2S — Os Três Pilares Inegociáveis

Estas três regras são a razão de o P2S existir. São **invioláveis**: nenhum prazo, nenhum "só
desta vez" e nenhuma conveniência do agente as sobrepõe. Se uma situação parece exigir quebrar
uma delas, a situação é que está errada — pare e conserte a situação, não a regra.

Todo o resto do framework (comandos, portões, fluxo de branches, automação) existe para
**garantir** estes três pilares.

---

## 1. Testes antes de tocar no código

**Regra.** Código não é escrito e depois testado; o comportamento é fixado por testes
**primeiro**, no nível de rigor que o projeto já pratica.

- **Lógica crítica é test-first (TDD).** Tudo onde a corretude é sutil — cálculo de dinheiro,
  matemática de agenda/slots, idempotência, transições de estado, permissão/isolamento — tem o
  teste escrito *antes* da implementação.
- **A correção de bug começa pelo teste que falha** e o reproduz. O teste fica vermelho, então a
  correção o deixa verde. Uma correção sem teste que reproduza não é aceita.
- **A cobertura viaja com a mudança.** UI com lógica sai com teste de render/interação da parte
  tocada. "Verde" que não exercita o código alterado **não** é "pronto" — é uma mudança sem
  teste que por acaso passa nos testes antigos.
- **Determinismo.** Testes rodam sem serviços externos (dependências em memória / mockadas), para
  serem rápidos, isolados e executáveis por um git hook a cada commit.

**Por quê.** Testes são a metade executável da spec. São como a mudança de um agente se prova
alinhada ao comportamento pretendido, em vez de apenas "parecer certa". Também dão sentido aos
git hooks — um hook que roda testes só protege se os testes forem reais.

---

## 2. Prototipação da fronteira inteira antes de implementar

**Regra.** Tudo que **entra e sai** da aplicação é prototipado de forma **navegável** e aprovado
pelo humano **antes** de qualquer código real. Prototipação **não é só de tela**: a IA **não
decide sozinha** nenhuma fronteira — ela **propõe um protótipo para ser testado e aprovado**, e
**todo protótipo aprovado vira spec**. As fronteiras a cobrir:

- **UX / interface.** Toda tela **nova** ou **substancialmente refeita** vira um protótipo
  estático navegável (HTML/CSS + JS vanilla — sem framework, sem build, sem dados/APIs reais).
  Captura layout, estados e interação.
- **Contrato de API.** Todo contrato de troca de dados que a aplicação **expõe ou consome** —
  REST, GraphQL, gRPC, eventos/webhooks — vira um artefato navegável: uma **doc OpenAPI** e/ou uma
  **API fake executável** (mock server) que o humano consegue **chamar** e ver as
  requisições/respostas reais. Para outros protocolos, o equivalente (ex.: gRPC → o `.proto` + um
  stub que responde).
- **Formato dos dados persistidos.** Como o dado é estruturado no banco/armazenamento — schema,
  tipos, relações, índices, invariantes — é prototipado e aprovado **antes** de existir modelo
  real. É a fronteira app↔persistência, que fecha o par completo de **input e output** do dado.
  Prototipe-o como um **diagrama ER navegável em notação descartável** (ex.: Mermaid `erDiagram`,
  que renderiza inline no próprio markdown, sem ferramenta externa).
- **Integrações externas.** Todo serviço de terceiro que a aplicação chama ou do qual recebe
  eventos tem seu contrato de troca prototipado (contra a doc oficial — ver
  [fidelidade a API externa](quality.md#fidelidade-a-api-externa)), nunca presumido.

O humano precisa **ter certeza de como os dados são estruturados e trafegam** — em todas as
fronteiras — antes de existir implementação.

**Navegável = interativo.** O protótipo não é uma imagem nem um ASCII: é algo com que o humano
**interage** (clica na tela, chama o endpoint fake) — e a **spec final emerge dessa interação**,
validada, não adivinhada. É o que separa o trabalho de *spec* do de *documentação* (ver o comando
[`p2s-spec`](commands.md)).

**Aprovação explícita.** É apresentado e iterado até o "aprovado" explícito. Silêncio, ou "tá
melhor", **não** é aprovação. O protótipo aprovado é **versionado** (em `templates/…`) e
**linkado na spec**; é ele — não a intuição do agente — que a implementação replica e contra ele
que a revisão humana compara.

**Baixo custo e descartável.** O protótipo é **deliberadamente barato**: não gaste tempo nem
tokens fazendo algo perfeito. Ele é **descartável** e **nunca**, em hipótese alguma, faz parte da
solução final — não é reaproveitado como código de produção; serve para **decidir a fronteira** e
depois é jogado fora. O objetivo é a decisão, não o artefato.

**Realista o bastante.** Ainda assim deve ser **realista e condizente com o resultado final** —
dar uma **impressão nítida** do que se pode obter. O equilíbrio é o ponto: barato **e** fiel o
suficiente para que a decisão tomada sobre ele seja válida. Fidelidade além disso é desperdício.

**Quando NÃO vale prototipar.** Se um protótipo barato **não** consegue dar essa impressão nítida
— porque um protótipo fiel custaria quase o mesmo que o código real, ou porque a fronteira não tem
superfície que valha previsualizar — **recomende explicitamente não prototipar** e **registre essa
decisão (com a justificativa) no DOR da spec**. Assim a ausência de protótipo é uma escolha
consciente e aprovada, não uma lacuna. Prototipar por prototipar, sem ganho de decisão, é
desperdício e viola o "baixo custo".

**Onde vive.** A prototipação é o coração do `p2s-spec` e é **requisito de DOR**: uma feature com
alguma fronteira (UX, API, dados, integrações) sem protótipo navegável aprovado **— ou sem a justificativa registrada
de que não vale prototipar —** **não** entra no `p2s-plan`.

**Por quê.** Um contrato errado — visual ou de dados — é o erro mais caro de descobrir depois do
código: cada "tá feio/tá errado, refaz" custa um ciclo inteiro de código + teste + deploy.
Prototipar a fronteira move a decisão para *antes* de qualquer linha de produção, onde uma rodada
custa segundos, e dá ao humano **controle total do que entra e sai da aplicação** — testando tudo
via protótipo antes de qualquer código real. Mas o protótipo é **meio, não fim**: barato,
descartável, e dispensável quando não agrega à decisão.

---

## 3. Spec como fonte da verdade — não o código

**Regra.** Comportamento e arquitetura são decididos na **spec** primeiro. O código é a spec
tornada executável. Quando código e spec divergem, a **spec está certa** e o código tem um bug.

- **Documentação antes do código.** Nenhuma feature é implementada antes de sua spec
  (`project/spec`) e seu plano de execução (`project/plans`) estarem alinhados. Toda mudança de
  regra de negócio ou arquitetura se reflete na doc **primeiro**, depois no código.
- **A spec é onde a ambiguidade se resolve.** Se o agente esbarra numa dúvida imprevista durante
  o código, ele **para** e devolve a pergunta à spec (`p2s-doc`) — não improvisa uma decisão no
  código.
- **O código nunca vira a autoridade por padrão.** "O código faz X, logo X deve estar certo" é o
  modo de falha que o P2S existe para evitar. Se X não está na spec, X é deriva não revisada.
- **A config do agente não é a fonte da verdade.** Arquivos de atalho de comando (`.claude/`,
  configs de IDE) apenas redirecionam para estes docs. As regras vivem aqui; trocar de agente não
  perde nada.

**Por quê.** Um agente de IA vai gerar, com confiança, comportamento plausível que ninguém pediu.
A única defesa durável é um enunciado de intenção legível e de posse do humano, que tem
precedência sobre o que o código faz — revisado *antes* de o código existir, não engenharia-
reversa dele depois.

---

## Pilar de apoio: automação

Além dos três inegociáveis, há um **pilar de apoio**. Ele **não é um fim em si** — é a alavanca que
torna os outros três **baratos e à prova de esquecimento**: **todo trabalho determinístico vai para
scripts e git hooks, nunca para o prompt de um agente.**

**Regra.** Se um passo é igual toda vez e tem um veredito binário (rodar testes, lint, build, audit,
pular o deploy de um commit só-de-doc), ele é um **script/hook** — não uma instrução que a IA
reexecuta de cabeça. O agente **orquestra e lê o veredito**; a maquinaria garante o invariante.

**Por quê.** Dois ganhos: **economia de tokens** (a IA não gasta contexto refazendo checagem
mecânica) e **integridade** (um humano ou uma IA pode pular um item de checklist; um pre-commit hook
não pode). É de **segundo nível** porque **serve** aos três pilares — sem ele os pilares ainda
valem, só custam mais caro e falham mais. Detalhes em [`automation.md`](automation.md).

---

## Como os pilares são garantidos

| Pilar | Garantido por |
| :--- | :--- |
| Testes antes do código | O `p2s-code` escreve testes junto com a mudança; git hooks rodam a suíte no commit/push; uma suíte vermelha bloqueia o push ([`automation.md`](automation.md)). |
| Protótipo da fronteira antes de implementar | Produzido no `p2s-spec` (UX, API, dados e integrações, navegáveis) sobre a linguagem visual do `p2s-discovery`; portão de DOR no `p2s-plan` (para se alguma fronteira não estiver prototipada e aprovada); revisão humana compara a implementação com o protótipo ([`commands.md`](commands.md)). |
| Spec como fonte da verdade | O `p2s-doc` governa toda decisão de comportamento; `p2s-plan`/`p2s-code` revalidam contra a spec e se recusam a prosseguir com inconsistência. |
| *Apoio:* automação | Hooks/scripts (husky/CI) garantem os invariantes determinísticos; os comandos confiam no veredito em vez de re-derivá-lo ([`automation.md`](automation.md)). |
