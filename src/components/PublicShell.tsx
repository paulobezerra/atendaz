import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";

/**
 * Shell Público (docs/10) — moldura das páginas abertas (marketing, login,
 * onboarding), baseada em `TEMPLATE/landing.html`: nav fixa com logo claro,
 * fundo branco, conteúdo centralizado em `max-w-6xl`, rodapé enxuto.
 * **Sem** painel roxo full-height (o antigo Split Layout foi removido).
 *
 * `headerRight` recebe as ações da nav (ex.: Entrar / Começar grátis). Fica
 * opcional porque nas telas de auth o CTA já vive no card central; a landing
 * de marketing (F0012) preenche a nav completa.
 */
export default function PublicShell({
  children,
  headerRight,
}: {
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="AtendAZ">
            <Logo className="h-7" />
          </Link>
          {headerRight}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-gray-400 sm:px-6">
          <Logo className="h-5" />
          <span>© {new Date().getFullYear()} Atendaz</span>
        </div>
      </footer>
    </div>
  );
}
