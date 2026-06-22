import type { ReactNode } from "react";

/**
 * Split Layout (docs/10): painel esquerdo de branding/contexto (indigo
 * escuro) + painel direito com o formulário. No mobile (< lg) o painel
 * esquerdo colapsa em um header compacto.
 */
export default function SplitLayout({
  left,
  mobileHeader,
  children,
}: {
  left: ReactNode;
  mobileHeader?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="hidden bg-gradient-to-br from-indigo-700 to-indigo-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        {left}
      </aside>

      {mobileHeader && (
        <header className="flex h-14 items-center justify-between bg-primary-dark px-4 text-white lg:hidden">
          {mobileHeader}
        </header>
      )}

      <main className="flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
