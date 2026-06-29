"use client";

import { signIn } from "next-auth/react";
import { Check } from "lucide-react";
import SplitLayout from "@/components/SplitLayout";
import { Button } from "@/components/ui/button";

const BULLETS = [
  "Agendamento online em 2 minutos",
  "Cobrança via Pix e cartão sem esforço",
  "NFS-e emitida automaticamente",
];

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
    <SplitLayout
      mobileHeader={<span className="text-lg font-bold">◈ Atendaz</span>}
      left={
        <>
          <p className="text-2xl font-bold">◈ Atendaz</p>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              Agenda inteligente, cobrança automática e NFS-e integrada.
            </h1>
            <ul className="mt-10 space-y-4">
              {BULLETS.map((b, i) => (
                <li
                  key={b}
                  className="flex animate-fade-in-up items-start gap-3 text-indigo-100"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-400/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-indigo-200">500+ negócios já usam o Atendaz</p>
        </>
      }
    >
      <h2 className="text-2xl font-bold text-gray-900">Bom te ver por aqui</h2>
      <p className="mt-2 text-sm text-gray-500">
        Entre com sua conta para acessar o painel.
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
        Ao entrar, você concorda com os Termos de Uso e a Política de Privacidade.
      </p>
    </SplitLayout>
  );
}
