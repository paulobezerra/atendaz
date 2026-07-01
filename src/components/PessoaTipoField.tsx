"use client";

import { cn } from "@/lib/utils";
import { MaskedInput } from "@/components/MaskedInput";

export type TipoPessoa = "FISICA" | "JURIDICA";

/**
 * Seleção de tipo de pessoa (PF/PJ) + campo de documento (docs/10).
 * **Nunca** um campo único para CPF/CNPJ: o switch decide a máscara/validação.
 * O valor persistido é só o documento (string formatada); `tipo` controla a máscara.
 */
export function PessoaTipoField({
  tipo,
  onTipoChange,
  documento,
  onDocumentoChange,
  id = "documento",
  disabled,
}: {
  tipo: TipoPessoa;
  onTipoChange: (t: TipoPessoa) => void;
  documento: string;
  onDocumentoChange: (v: string) => void;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        role="tablist"
        aria-label="Tipo de pessoa"
        className="inline-flex rounded-md border border-input p-0.5"
      >
        {(
          [
            ["FISICA", "Pessoa Física"],
            ["JURIDICA", "Pessoa Jurídica"],
          ] as [TipoPessoa, string][]
        ).map(([val, label]) => (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={tipo === val}
            disabled={disabled}
            onClick={() => onTipoChange(val)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              tipo === val
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <MaskedInput
        id={id}
        kind={tipo === "FISICA" ? "cpf" : "cnpj"}
        value={documento}
        onChange={onDocumentoChange}
        disabled={disabled}
        placeholder={tipo === "FISICA" ? "000.000.000-00" : "00.000.000/0000-00"}
      />
    </div>
  );
}
