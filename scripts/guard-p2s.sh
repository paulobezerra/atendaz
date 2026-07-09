#!/usr/bin/env bash
# Trava do framework P2S.
# Bloqueia qualquer commit que altere `docs/p2s/**` (o framework) — a não ser que
# destravado EXPLICITAMENTE com a variável de ambiente P2S_UNLOCK=1.
#
# É agnóstico de agente por design: roda no git (pre-commit), não em nenhuma IA —
# então protege igual seja Claude, Junie, Cursor ou um humano. É o pilar
# "DRY & automação" (docs/p2s/automation.md): um invariante determinístico mora
# num hook, não na memória de um agente.
#
# Uso intencional (quando VOCÊ decide mexer no framework):
#   P2S_UNLOCK=1 git commit -m "doc(p2s): ..."

set -euo pipefail

changed="$(git diff --cached --name-only -- docs/p2s/ || true)"

if [ -z "$changed" ]; then
  exit 0
fi

if [ "${P2S_UNLOCK:-}" = "1" ]; then
  echo "🔓 P2S destravado (P2S_UNLOCK=1) — alteração do framework permitida:"
  echo "$changed" | sed 's/^/   • /'
  exit 0
fi

echo "──────────────────────────────────────────────────────────────"
echo " ⛔ TRAVA DO FRAMEWORK P2S"
echo " Este commit altera o framework (docs/p2s/), que está travado:"
echo "$changed" | sed 's/^/   • /'
echo ""
echo " Só mude o P2S de forma explícita. Se é intencional, destrave:"
echo "     P2S_UNLOCK=1 git commit ..."
echo " Se não era intencional, tire do stage:"
echo "     git restore --staged docs/p2s/"
echo "──────────────────────────────────────────────────────────────"
exit 1
