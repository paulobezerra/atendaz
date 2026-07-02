import { cn } from "@/lib/utils";

/**
 * Wordmark AtendAZ (docs/10). Duas variantes transparentes servidas de `public/`:
 * - `light` (padrão): "Atend" escuro + "AZ" indigo → fundos claros.
 * - `dark`: "Atend" branco + "AZ" indigo-claro → faixas/superfícies escuras.
 * Escolher pela cor do fundo. Altura via `className` (`h-6`/`h-7`), largura auto.
 */
export default function Logo({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const src =
    variant === "dark" ? "/atendaz-logo-inverted.svg" : "/atendaz-logo.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="AtendAZ" className={cn("h-7 w-auto", className)} />
  );
}
