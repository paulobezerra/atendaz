"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import PublicShell from "@/components/PublicShell";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <PublicShell
      headerRight={
        <span className="text-sm text-gray-500">
          Novo por aqui?{" "}
          <Link href="/onboarding" className="font-medium text-primary hover:underline">
            Começar grátis
          </Link>
        </span>
      }
    >
      <div className="grid flex-1 items-center gap-12 py-6 lg:grid-cols-2 lg:py-16">
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
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-3 text-sm text-gray-400">
            <span>
              Mais de <b className="text-gray-600">500 negócios</b> confiam no
              Atendaz
            </span>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" />
            <span>Pix · Cartão · Boleto</span>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" />
            <span>NFS-e integrada</span>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/60">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Entre com o Google para acessar o painel.
          </p>

          <Button
            variant="outline"
            size="lg"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-8 w-full gap-3"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>

          <p className="mt-6 text-xs text-gray-400">
            Ao entrar, você concorda com os Termos de Uso e a Política de
            Privacidade.
          </p>
        </div>
      </div>
    </PublicShell>
  );
}
