"use client";

import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type ToastType = "success" | "error";

/**
 * API estável de toasts (mantida desde F1): `useToast().toast(msg, type)`.
 * A partir da F0002.5 o backend é o `sonner` (shadcn) — um único sistema de
 * toast no app (docs/10). Os call sites existentes não mudam.
 */
export function useToast() {
  return {
    toast: (message: string, type: ToastType = "success") =>
      type === "error"
        ? sonnerToast.error(message)
        : sonnerToast.success(message),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
    </>
  );
}
