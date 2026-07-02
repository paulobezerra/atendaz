import { withAuth } from "next-auth/middleware";

/**
 * Gate de autenticação (edge-safe). Exige token válido nas rotas
 * protegidas e redireciona para `/login` caso contrário. O redirect
 * fino PENDING↔COMPLETE fica nas server components (runtime Node).
 */
export default withAuth({
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/" },
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
