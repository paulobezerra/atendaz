"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Atendaz</h1>
        <p className="mt-2 text-sm text-gray-500">
          Agenda + Cobrança + NFS-e. Entre para configurar seu negócio.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-8 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          Entrar com Google
        </button>
      </div>
    </main>
  );
}
