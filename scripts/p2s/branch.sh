#!/usr/bin/env bash
# Gatilho de branch do Atendaz (p2s-plan): cria a branch da feature a partir da
# master. Se já existir, apenas entra nela (não reseta — use --reset p/ reconciliar).
# Uso: bash scripts/p2s/branch.sh {ID}-{slug} [--reset]
set -euo pipefail
[ $# -ge 1 ] || { echo "uso: $0 {ID}-{slug} [--reset]"; exit 2; }
name="$1"; reset="${2:-}"
branch="feature/$name"

git checkout master
git pull --ff-only origin master 2>/dev/null || true

if git show-ref --verify --quiet "refs/heads/$branch"; then
  git checkout "$branch"
  if [ "$reset" = "--reset" ]; then
    git reset --hard master
    echo "✓ $branch resetada para a master (reconciliação)"
  else
    echo "✓ já na branch $branch (existente; use --reset para reconciliar com a master)"
  fi
else
  git checkout -b "$branch" master
  echo "✓ criada e na branch $branch (base = master)"
fi
