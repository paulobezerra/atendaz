import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Gate de autenticação (edge-safe — `auth` não acessa o banco).
 * Apenas exige login nas rotas protegidas. O redirecionamento fino
 * entre /onboarding e /dashboard (PENDING vs COMPLETE) é feito nas
 * server components, que podem consultar o MongoDB.
 */
export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
