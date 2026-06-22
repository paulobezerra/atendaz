import dbConnect from "@/lib/mongodb";
import Plano from "@/models/Plano";
import Segmento from "@/models/Segmento";
import { normalizeSlug } from "@/lib/slug";
import { PLANOS, SEGMENTOS_NOMES } from "@/lib/seedData";

export interface SeedResult {
  planos: string[];
  segmentos: number;
}

// Guard em memória: roda 1x por instância/cold start (idempotente de qualquer forma).
let seeded = false;

/**
 * Garante os dados de referência (planos + segmentos) no banco, via upsert
 * idempotente. Chamado automaticamente nos pontos de entrada (lazy) e
 * manualmente por `/api/admin/seed` (com `force`).
 *
 * - `force = false` (lazy): pula se já rodou nesta instância ou em ambiente de teste.
 * - `force = true` (manual/endpoint): sempre executa.
 */
export async function ensureSeed(force = false): Promise<SeedResult> {
  if (!force) {
    if (seeded) return { planos: PLANOS.map((p) => p.slug), segmentos: SEGMENTOS_NOMES.length };
    if (process.env.NODE_ENV === "test") return { planos: [], segmentos: 0 };
  }

  await dbConnect();

  const planos = await Promise.all(
    PLANOS.map((p) =>
      Plano.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true })
    )
  );

  const segmentos = await Promise.all(
    SEGMENTOS_NOMES.map((nome, ordem) => {
      const slug = normalizeSlug(nome);
      return Segmento.findOneAndUpdate(
        { slug },
        { slug, nome, ordem, ativo: true },
        { upsert: true, new: true }
      );
    })
  );

  seeded = true;
  return { planos: planos.map((r) => r.slug), segmentos: segmentos.length };
}
