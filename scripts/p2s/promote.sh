#!/usr/bin/env bash
# Gatilho de promoção do Atendaz (p2s-done): merge --no-ff da feature na master +
# push (dispara o deploy de produção). É o git flow declarado/autorizado do projeto
# (ver docs/project/base/workflow.md) — não é "merge por conta própria".
# Uso: bash scripts/p2s/promote.sh {ID}-{slug}
set -euo pipefail
[ $# -eq 1 ] || { echo "uso: $0 {ID}-{slug}"; exit 2; }
name="$1"; branch="feature/$name"

git show-ref --verify --quiet "refs/heads/$branch" || { echo "branch $branch não existe"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "working tree sujo — commite/limpe antes de promover"; exit 1; }

git checkout master
git pull --ff-only origin master 2>/dev/null || true
# Merges não disparam o pre-commit (guard-p2s); o pre-push roda os testes e bloqueia se vermelho.
git merge --no-ff "$branch" -m "merge($name): promoção para produção"
git push origin master
echo "✓ $branch promovido para master — deploy de produção disparado. Valide prod (DOD)."
