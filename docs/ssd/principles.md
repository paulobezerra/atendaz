# SSD — Os Três Pilares Inegociáveis

Estas três regras são a razão de o SSD existir. São **invioláveis**: nenhum prazo, nenhum "só
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

## 2. Prototipação de interface antes de implementar

**Regra.** Nenhuma tela **nova**, e nenhuma tela **substancialmente refeita**, chega ao código
de produção sem um **protótipo estático que o humano aprovou antes**.

- O protótipo é feito num **meio barato e rápido** (HTML/CSS puro + um pouco de JS vanilla — sem
  framework, sem build, sem dados ou APIs reais). Captura layout, estados e interação — não a
  fiação de produção.
- É **apresentado ao humano e iterado** até a aprovação **explícita** ("aprovado", "pode
  implementar"). Silêncio, ou "tá melhor", **não** é aprovação.
- O protótipo aprovado é **versionado** e **linkado na seção UX da spec**. É ele — não a
  intuição do agente — que a implementação deve replicar fielmente, e contra ele que a revisão
  humana compara.
- A prototipação é parte da **spec** (acontece no `ssd-doc`) e é **requisito de DOR**: uma spec
  com UI sem protótipo aprovado não entra no `ssd-plan`.

**Por quê.** Decidir o visual em código de produção é o lugar mais caro de iterar: cada rodada de
"tá feio, refaz" custa um ciclo inteiro de código + teste + deploy. Prototipar move a decisão
visual para *antes* de qualquer linha de produção, onde uma rodada custa segundos.

---

## 3. Spec como fonte da verdade — não o código

**Regra.** Comportamento e arquitetura são decididos na **spec** primeiro. O código é a spec
tornada executável. Quando código e spec divergem, a **spec está certa** e o código tem um bug.

- **Documentação antes do código.** Nenhuma feature é implementada antes de sua spec
  (`project/spec`) e seu plano de execução (`project/plans`) estarem alinhados. Toda mudança de
  regra de negócio ou arquitetura se reflete na doc **primeiro**, depois no código.
- **A spec é onde a ambiguidade se resolve.** Se o agente esbarra numa dúvida imprevista durante
  o código, ele **para** e devolve a pergunta à spec (`ssd-doc`) — não improvisa uma decisão no
  código.
- **O código nunca vira a autoridade por padrão.** "O código faz X, logo X deve estar certo" é o
  modo de falha que o SSD existe para evitar. Se X não está na spec, X é deriva não revisada.
- **A config do agente não é a fonte da verdade.** Arquivos de atalho de comando (`.claude/`,
  configs de IDE) apenas redirecionam para estes docs. As regras vivem aqui; trocar de agente não
  perde nada.

**Por quê.** Um agente de IA vai gerar, com confiança, comportamento plausível que ninguém pediu.
A única defesa durável é um enunciado de intenção legível e de posse do humano, que tem
precedência sobre o que o código faz — revisado *antes* de o código existir, não engenharia-
reversa dele depois.

---

## Como os pilares são garantidos

| Pilar | Garantido por |
| :--- | :--- |
| Testes antes do código | O `ssd-code` escreve testes junto com a mudança; git hooks rodam a suíte no commit/push; uma suíte vermelha bloqueia o push ([`automation.md`](automation.md)). |
| Protótipo antes de implementar | Portão de DOR no `ssd-plan` (para se a UI não estiver prototipada); portão de aprovação humana antes de o `ssd-code` replicar uma tela ([`commands.md`](commands.md)). |
| Spec como fonte da verdade | O `ssd-doc` governa toda decisão de comportamento; `ssd-plan`/`ssd-code` revalidam contra a spec e se recusam a prosseguir com inconsistência. |
