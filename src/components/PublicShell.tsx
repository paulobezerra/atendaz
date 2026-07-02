import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

/**
 * Shell Público (docs/10) — moldura de páginas abertas fora da Home (hoje só
 * `/onboarding`), baseada em `templates/referencia/landing.html`: nav fixa com logo
 * claro + rodapé enxuto. Login não tem rota própria — vive como modal na Home
 * (`HomeLanding`).
 *
 * `headerRight` sobrescreve as ações padrão da nav (ex.: onboarding troca por
 * "Voltar", que desloga o usuário).
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
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="AtendAZ">
            <Logo className="h-7" />
          </Link>
          <div className="flex items-center gap-3">
            {headerRight ?? (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Entrar
                </Link>
                <Button asChild size="sm">
                  <Link href="/onboarding">Começar grátis</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6">
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
