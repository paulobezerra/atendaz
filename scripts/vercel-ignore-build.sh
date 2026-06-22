#!/usr/bin/env bash
# Vercel "Ignored Build Step".
# Convenção da Vercel: exit 0 = PULA o build/deploy; exit 1 = EXECUTA o build/deploy.
#
# Objetivo: não disparar deploy quando o commit mexeu APENAS em
# documentação/tooling (docs/, *.md, .claude/) — mantendo a master como
# fonte da verdade dos docs sem gerar deploys de produção desnecessários.
#
# Configurar no painel: Project Settings → Git → Ignored Build Step →
#   bash scripts/vercel-ignore-build.sh

if ! git rev-parse HEAD^ >/dev/null 2>&1; then
  # Sem commit anterior (primeiro deploy / clone raso): builda por segurança.
  exit 1
fi

if git diff --quiet HEAD^ HEAD -- . \
    ':(exclude)docs/**' \
    ':(exclude)*.md' \
    ':(exclude).claude/**'; then
  echo "Somente docs/tooling mudou — pulando build."
  exit 0
fi

exit 1
