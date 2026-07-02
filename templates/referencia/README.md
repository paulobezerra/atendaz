# templates/referencia/ — Protótipos de referência visual (NÃO é produção)

Protótipos **estáticos** (HTML + Tailwind via CDN + um pouco de JS) que servem de **alvo
estético fixo** para o revamp de UX do Atendaz. **Não** fazem parte do app Next.js, **não** são
buildados nem deployados (o `scripts/vercel-ignore-build.sh` ignora `templates/referencia/**`).

Diferente de [`../prototipos/`](../prototipos/) (workspace **vivo**, um protótipo por tela, em
refinamento até aprovação — ver `docs/00` → "Prototipação de Telas"), esta pasta é a referência
visual **fixa**: não muda por feature, é o "de onde viemos" estético do produto.

## Como abrir
Abra os arquivos direto no navegador (duplo clique) — não precisa de build nem servidor:
- [`landing.html`](landing.html) — página de marketing (hero + recursos + como funciona + planos + CTA).
- [`dashboard.html`](dashboard.html) — App Shell autenticado (sidebar + métricas + gráfico + tabela de cobranças).

## Para que serve
Alinhar a **direção visual** antes de refatorar as telas reais. O que for aprovado aqui vira
guia em [`docs/10-design-system.md`](../../docs/10-design-system.md) e insumo das specs por feature.
Reflete os tokens atuais da fundação (primary indigo-600, Inter, cards `rounded-2xl` com borda +
`shadow-sm`) elevando o acabamento com base nas referências shadcn coletadas (ver `docs/10` →
"Referências visuais").

## Limites (proposital)
- **CDN, não build**: Tailwind Play CDN e lucide via `<script>` — insustentável em produção, ótimo
  para protótipo. A implementação real usa shadcn/ui + tokens no `tailwind.config.ts`.
- **Dados fake** embutidos em JS; sem back-end, sem rotas, sem acessibilidade completa.
- Serve como **maquete**, não como código a ser copiado 1:1.
