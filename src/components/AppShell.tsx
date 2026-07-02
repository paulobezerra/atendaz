"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { Home, Users, LogOut, type LucideIcon } from "lucide-react";
import Logo from "@/components/Logo";
import { initials } from "@/lib/initials";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module?: "agenda" | "cobranca" | "nfse";
}

export interface AppShellProps {
  business: {
    nomeFantasia: string;
    slug: string;
    modulos: { agenda: boolean; cobranca: boolean; nfse: boolean };
  };
  user?: { nome?: string | null };
  children: ReactNode;
}

/**
 * Itens de navegação. Progressive disclosure: itens com `module` só aparecem
 * se o módulo estiver ativo no business (Guardrail 2). Destinos ainda não
 * implementados nas próximas fases não são listados aqui para evitar links
 * mortos — serão adicionados em F3+.
 */
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/profissionais", label: "Profissionais", icon: Users },
];

function visibleItems(modulos: AppShellProps["business"]["modulos"]) {
  return NAV.filter((i) => !i.module || modulos[i.module]);
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppShell({ business, user, children }: AppShellProps) {
  const pathname = usePathname() ?? "";
  const items = visibleItems(business.modulos);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-gray-100 px-5">
          <Logo className="h-7" />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((i) => {
            const active = isActive(pathname, i.href);
            const Icon = i.icon;
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-indigo-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {i.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(user?.nome ?? business.nomeFantasia)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.nome ?? "Conta"}
              </p>
              <p className="truncate text-xs text-gray-400">{business.nomeFantasia}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {business.nomeFantasia}
            </p>
            <p className="truncate text-xs text-gray-500">/agendar/{business.slug}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-gray-900 lg:hidden"
          >
            Sair
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-gray-200 bg-white lg:hidden">
        {items.map((i) => {
          const active = isActive(pathname, i.href);
          const Icon = i.icon;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? "text-primary" : "text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {i.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
