import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Configuração do Auth.js v5 com estratégia JWT (sem adapter de banco).
 * Edge-safe: nenhum callback acessa o MongoDB, para que o middleware
 * possa usar `auth` no runtime Edge. A resolução de `business`/onboarding
 * é feita nas server components/rotas (runtime Node), via `googleId`.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      if (session.user && token.googleId) {
        session.user.googleId = token.googleId as string;
      }
      return session;
    },
  },
});
