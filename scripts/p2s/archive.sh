#!/usr/bin/env bash
# Arquiva um artefato descartável (plano ou review) no p2s-done: git mv para
# archive/ e corrige a profundidade dos links relativos (+1 "../", pois o arquivo
# desce um nível). Determinístico — evita o erro manual de "../" que o agente comete.
# Uso: bash scripts/p2s/archive.sh {plan|review} {ID}-{slug}
set -euo pipefail
[ $# -eq 2 ] || { echo "uso: $0 {plan|review} {ID}-{slug}"; exit 2; }
kind="$1"; name="$2"
case "$kind" in
  plan)   base="docs/project/plans" ;;
  review) base="docs/project/reviews" ;;
  *) echo "kind deve ser 'plan' ou 'review'"; exit 2 ;;
esac
src="$base/$name.md"; dst="$base/archive/$name.md"
[ -f "$src" ] || { echo "não encontrado: $src"; exit 1; }

mkdir -p "$base/archive"
git mv "$src" "$dst"
# Descer para archive/ acrescenta um nível: todo link relativo ganha +1 "../".
perl -i -pe 's{\]\(\.\./}{](../../}g' "$dst"
echo "✓ arquivado: $dst (links relativos ajustados)"
