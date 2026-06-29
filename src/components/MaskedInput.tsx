"use client";

import * as React from "react";
import { IMaskInput } from "react-imask";
import { cn } from "@/lib/utils";

export type MaskKind = "phone" | "cpf" | "cnpj" | "cep" | "currency";

/* Definições de máscara (docs/10 — máscaras de input). */
const MASKS: Record<MaskKind, Record<string, unknown>> = {
  phone: { mask: "(00) 00000-0000" },
  cpf: { mask: "000.000.000-00" },
  cnpj: { mask: "00.000.000/0000-00" },
  cep: { mask: "00000-000" },
  currency: {
    mask: "R$ num",
    blocks: {
      num: {
        mask: Number,
        thousandsSeparator: ".",
        radix: ",",
        scale: 2,
        padFractionalZeros: true,
      },
    },
  },
};

export interface MaskedInputProps {
  kind: MaskKind;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

/**
 * Input com máscara (react-imask) estilizado como o Input do shadcn. O valor
 * propagado é o texto formatado (display); integrável ao react-hook-form via
 * `Controller` (passe `value`/`onChange`/`onBlur`).
 */
export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ kind, value, onChange, onBlur, className, ...props }, ref) => {
    return (
      <IMaskInput
        {...MASKS[kind]}
        inputRef={ref}
        value={value ?? ""}
        unmask={false}
        onAccept={(val: string) => onChange?.(val)}
        onBlur={onBlur}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = "MaskedInput";
