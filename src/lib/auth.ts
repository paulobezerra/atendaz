import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Configuração do NextAuth v4 (stable) com estratégia JWT (sem adapter).
 * Edge-safe para o middleware (nenhum callback acessa o MongoDB). A
 * resolução de `business`/onboarding é feita nas server components via
 * `googleId`. O segredo reusa `AUTH_SECRET` (definido em `docs/05`).
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.sub) {
        token.googleId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.googleId = token.googleId;
      }
      return session;
    },
  },
};

/** Sessão no servidor (App Router). */
export function getSession() {
  return getServerSession(authOptions);
}
