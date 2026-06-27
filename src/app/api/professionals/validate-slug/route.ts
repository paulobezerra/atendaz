import { NextResponse } from "next/server";
import Professional from "@/models/Professional";
import { validateSlug } from "@/lib/slug";
import { requireBusiness, HttpError } from "@/lib/professionals";

export const dynamic = "force-dynamic";

// Disponibilidade de slugInterno no escopo do business (validação onBlur).
export async function GET(req: Request) {
  try {
    const business = await requireBusiness();
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("slug") ?? "";
    const exceptId = searchParams.get("exceptId") ?? undefined;

    const check = validateSlug(raw);
    if (!check.valid) {
      return NextResponse.json({ available: false, slug: check.slug, reason: check.reason });
    }

    const query: Record<string, unknown> = {
      businessId: business._id,
      slugInterno: check.slug,
    };
    if (exceptId) query._id = { $ne: exceptId };

    const taken = await Professional.exists(query);
    return NextResponse.json({
      available: !taken,
      slug: check.slug,
      reason: taken ? "Slug já usado neste negócio." : undefined,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ available: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ available: false, error: "Falha inesperada." }, { status: 500 });
  }
}
