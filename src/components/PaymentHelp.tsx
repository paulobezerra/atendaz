"use client";

import { BookOpen, X, AlertTriangle, KeyRound, Shield } from "lucide-react";

const STEPS = [
  {
    title: "Crie sua conta no Asaas",
    body: (
      <>
        Acesse <span className="font-mono text-xs text-primary">asaas.com</span> e conclua o cadastro
        com os dados do seu negócio. Para testes, use o Sandbox em{" "}
        <span className="font-mono text-xs text-primary">sandbox.asaas.com</span>.
      </>
    ),
  },
  {
    title: 'Abra "Integrações"',
    body: (
      <>
        No painel do Asaas, no menu do usuário, abra <span className="font-medium">Integrações</span>.
        Só usuários <span className="font-medium">administradores</span> geram a chave — não é possível
        pelo app mobile.
      </>
    ),
  },
  {
    title: "Gere a chave de API",
    body: (
      <>
        Clique em <span className="font-medium">&quot;Gerar nova Chave de API&quot;</span> e copie o
        conteúdo exibido.
        <span className="mt-2 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-gray-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>
            A chave é mostrada <span className="font-medium">uma única vez</span> (irrecuperável).
            Copie e guarde com segurança.
          </span>
        </span>
      </>
    ),
  },
  {
    title: "Cole aqui e salve",
    body: (
      <>
        Cole o token no campo <span className="font-medium">&quot;Token de API&quot;</span> e clique em
        Salvar. Validamos com o Asaas e guardamos criptografado.
      </>
    ),
  },
];

export default function PaymentHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Como conectar">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Como conectar</h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="text-sm text-gray-600">
            O Atendaz usa o <span className="font-medium text-gray-800">Asaas</span> (parceiro de
            pagamentos) para cobrar seus clientes e emitir notas. Siga os passos para pegar seu token.
          </p>

          <ol className="mt-6 space-y-5">
            {STEPS.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900">{s.title}</p>
                  <p className="mt-0.5">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
            <p className="flex items-start gap-2">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>
                Chaves de <span className="font-medium">Sandbox</span> começam com{" "}
                <span className="font-mono">$aact_hmlg_</span> e as de{" "}
                <span className="font-medium">Produção</span> com{" "}
                <span className="font-mono">$aact_prod_</span>. Use a do ambiente correspondente.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>Nunca compartilhe o token por e-mail ou print. Ele fica criptografado no Atendaz.</span>
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Entendi
          </button>
        </div>
      </aside>
    </div>
  );
}
