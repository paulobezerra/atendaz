import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import { validateSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("slug") ?? "";

  const check = validateSlug(raw);
  if (!check.valid) {
    return NextResponse.json({
      available: false,
      slug: check.slug,
      reason: check.reason,
    });
  }

  await dbConnect();
  const taken = await Business.exists({ slug: check.slug });
  return NextResponse.json({
    available: !taken,
    slug: check.slug,
    reason: taken ? "Slug já está em uso." : undefined,
  });
}
