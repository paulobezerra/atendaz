"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Label com ícone de ajuda (ⓘ) e tooltip explicando o termo (docs/10).
 * Usar para jargão do produto (segmento, endereço público, NFS-e, etc.).
 */
export function JargonLabel({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>
        {children}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {hint && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Ajuda"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs leading-relaxed">
              {hint}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
