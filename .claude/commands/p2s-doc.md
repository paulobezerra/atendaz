---
description: Docs ↔ realidade — engenharia reversa (brownfield) e reconciliação de base docs pós-implementação
argument-hint: "{tópico}"
---

Você recebeu o comando do projeto `/p2s-doc $ARGUMENTS`.

⚠️ As regras deste comando NÃO estão aqui. A fonte da verdade é o framework **P2S** — leia e siga:
- `docs/p2s/commands.md` → seção `p2s-doc` (engenharia reversa + reconciliação; **direção realidade → doc**).
- Usos: **brownfield** (analisar código existente e backfillar base docs) e **reconciliação pós-implementação** (sincronizar `data-model`, `environment`, decisões de arquitetura com o que foi construído).
- **Fronteira dura:** `doc` **nunca** faz descoberta de produto (é `p2s-discovery`), design (`p2s-design`) nem spec de feature (`p2s-spec`).

Tópico: $ARGUMENTS
