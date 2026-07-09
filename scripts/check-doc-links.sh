#!/usr/bin/env bash
# Verifica se todos os links relativos de arquivos em docs/ resolvem para um
# arquivo/diretório existente. Determinístico → é script, não trabalho do agente
# (pilar DRY & automação, docs/p2s/automation.md). Sai 1 se houver link quebrado.
#
# Uso: bash scripts/check-doc-links.sh [dir]   (default: docs)

set -euo pipefail
root="${1:-docs}"
broken=0

# Captura "](alvo...)" ignorando âncoras (#), http(s):, mailto:.
while IFS= read -r hit; do
  file="${hit%%::*}"
  target="${hit##*::}"
  # ignora externos e âncoras puras
  case "$target" in
    http://*|https://*|mailto:*|\#*) continue ;;
  esac
  # tira âncora do fim (arquivo.md#secao)
  target="${target%%#*}"
  [ -z "$target" ] && continue
  dir="$(dirname "$file")"
  resolved="$(cd "$dir" 2>/dev/null && realpath -m "$target" 2>/dev/null || true)"
  if [ -z "$resolved" ] || [ ! -e "$resolved" ]; then
    echo "BROKEN  $target   (em $file)"
    broken=1
  fi
done < <(grep -rn -oE "\]\([^)]+\)" "$root" --include="*.md" 2>/dev/null \
          | sed -E 's/^([^:]+):[0-9]+:\]\((.*)\)$/\1::\2/')

if [ "$broken" -eq 0 ]; then
  echo "✓ links de $root/ ok"
fi
exit "$broken"
