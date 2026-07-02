"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  CalendarCheck,
  CreditCard,
  FileText,
  ArrowRight,
  Lock,
  X,
  Check,
} from "lucide-react";
import Logo from "@/components/Logo";
import AppMockupCard from "@/components/AppMockupCard";
import { Button } from "@/components/ui/button";

const RECURSOS = [
  {
    icon: CalendarCheck,
    tone: "bg-primary/10 text-primary",
    title: "Agenda inteligente",
    desc: "Página pública de agendamento, confirmação por WhatsApp e controle por profissional.",
  },
  {
    icon: CreditCard,
    tone: "bg-success/10 text-success",
    title: "Cobrança automática",
    desc: "Pix, cartão e boleto pelo parceiro de pagamentos. Recebeu, seu financeiro atualiza sozinho.",
  },
  {
    icon: FileText,
    tone: "bg-warning/10 text-warning",
    title: "Nota fiscal (NFS-e)",
    desc: "Emissão automática após o pagamento — ou manual, do seu jeito. Sem digitar nota a nota.",
  },
];

const PASSOS = [
  { num: "01", title: "Crie sua conta", desc: "Entre com o Google e dê um nome e endereço ao seu negócio. Só isso." },
  { num: "02", title: "Comece a usar no teste", desc: "Sistema completo liberado. Explore agenda, cobrança e nota sem escolher plano." },
  { num: "03", title: "Escolha seu plano", desc: "Gostou? Selecione o plano e conecte seu meio de pagamento quando quiser." },
];

const PLANOS = [
  {
    nome: "Agenda Simples",
    preco: "R$ 29",
    destaque: false,
    itens: ["Agenda + página pública", "Confirmação por WhatsApp"],
  },
  {
    nome: "Completo",
    preco: "R$ 59",
    destaque: true,
    itens: ["Tudo da Agenda", "Cobrança automática", "NFS-e integrada"],
  },
  {
    nome: "Cobrança + Nota",
    preco: "R$ 39",
    destaque: false,
    itens: ["Cobrança automática", "NFS-e integrada"],
  },
];

/**
 * Home = landing de marketing + modal de login (docs/10 → "Padrão: Home").
 * Não há rota `/login` própria: "Entrar"/"Começar grátis" (nav, hero, preços,
 * CTA final) abrem este modal, ancorado no canto superior direito sobre um
 * overlay leve. Aprovado via protótipo em `templates/prototipos/home.html`.
 */
export default function HomeLanding() {
  const [loginOpen, setLoginOpen] = useState(false);

  function openLogin() {
    setLoginOpen(true);
  }

  useEffect(() => {
    if (!loginOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLoginOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [loginOpen]);

  return (
    <div className="bg-white text-gray-900">
      {/* ==================== NAV ==================== */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="AtendAZ">
            <Logo className="h-7" />
          </Link>
          <div className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
            <a href="#recursos" className="hover:text-gray-900">Recursos</a>
            <a href="#como" className="hover:text-gray-900">Como funciona</a>
            <a href="#precos" className="hover:text-gray-900">Preços</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openLogin}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Entrar
            </button>
            <Button size="sm" onClick={openLogin}>
              Começar grátis
            </Button>
          </div>
        </nav>
      </header>

      {/* ==================== HERO ==================== */}
      <section
        className="relative overflow-hidden"
        style={{ background: "radial-gradient(60% 60% at 70% 10%, rgba(79,70,229,.18), transparent 70%)" }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Feito para
              barbearias, clínicas e estética
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Agenda, cobrança e <span className="text-primary">nota fiscal</span> num
              só lugar.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-gray-500">
              O Atendaz organiza seus agendamentos, cobra automaticamente pelo
              Pix/cartão e emite a NFS-e sozinho. Você cuida dos clientes; o
              financeiro roda no automático.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" onClick={openLogin}>
                Começar grátis <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#como">Ver como funciona</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Sem cartão de crédito · Teste com o sistema completo liberado
            </p>
          </div>

          <AppMockupCard />
        </div>

        <div className="border-y border-gray-100 bg-gray-50/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm text-gray-400">
            <span>Mais de <b className="text-gray-600">500 negócios</b> confiam no Atendaz</span>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" />
            <span>Pix · Cartão · Boleto</span>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" />
            <span>NFS-e integrada</span>
          </div>
        </div>
      </section>

      {/* ==================== RECURSOS ==================== */}
      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Recursos</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Tudo que o seu negócio precisa, modular</h2>
          <p className="mt-3 text-gray-500">Ative só o que usa. Comece pela agenda e ligue cobrança e nota fiscal quando quiser.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {RECURSOS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${r.tone}`}>
                <r.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== COMO FUNCIONA ==================== */}
      <section id="como" className="border-y border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">Como funciona</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">No ar em menos de 1 minuto</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PASSOS.map((p) => (
              <div key={p.num} className="relative rounded-2xl border border-gray-200 bg-white p-6">
                <span className="text-sm font-bold text-primary">{p.num}</span>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PREÇOS ==================== */}
      <section id="precos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Planos</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Preço simples, sem surpresa</h2>
          <p className="mt-3 text-gray-500">Modular: pague só pelos módulos que ativar.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={
                plano.destaque
                  ? "relative rounded-2xl border-2 border-primary bg-white p-6 shadow-lg"
                  : "rounded-2xl border border-gray-200 bg-white p-6"
              }
            >
              {plano.destaque && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                  Mais popular
                </span>
              )}
              <h3 className="font-semibold">{plano.nome}</h3>
              <p className="mt-2 text-3xl font-bold">
                {plano.preco}
                <span className="text-sm font-normal text-gray-400">/mês</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {plano.itens.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 text-success" /> {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={openLogin}
                variant={plano.destaque ? "default" : "outline"}
                className="mt-6 w-full"
              >
                {plano.destaque ? "Começar grátis" : "Começar"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center">
          <Logo variant="dark" className="mx-auto mb-6 h-8" />
          <h2 className="text-3xl font-bold text-white">Pronto para automatizar seu financeiro?</h2>
          <p className="mx-auto mt-3 max-w-lg text-indigo-200">
            Comece hoje com o sistema completo liberado. Sem cartão de crédito.
          </p>
          <Button
            onClick={openLogin}
            className="mt-8 gap-2 bg-white text-primary-dark hover:bg-indigo-50"
          >
            Criar minha conta <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:px-6">
          <Logo className="h-6" />
          <p>© {new Date().getFullYear()} Atendaz</p>
        </div>
      </footer>

      {/* ==================== LOGIN (modal no canto superior direito) ==================== */}
      {loginOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-gray-900/10 backdrop-blur-[1px]"
            onClick={() => setLoginOpen(false)}
            aria-hidden
          />
          <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm sm:right-6">
            <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-900/10">
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 pr-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Acesse sua conta</h2>
                  <p className="text-sm text-gray-500">Entre com sua conta Google</p>
                </div>
              </div>
              <Button
                className="mt-5 w-full gap-3"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <GoogleIcon />
                Entrar com Google
              </Button>
              <p className="mt-4 text-center text-xs text-gray-400">
                Ao entrar, você concorda com os Termos de Uso e a Política de Privacidade.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" opacity=".95" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#fff" opacity=".8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#fff" opacity=".65" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#fff" opacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
