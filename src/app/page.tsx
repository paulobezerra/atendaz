import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import HomeLanding from "@/components/HomeLanding";

/**
 * Home (`/`) — pública: landing de marketing + modal de login (F0002.7).
 * Usuário já autenticado é mandado direto ao painel; visitante vê a landing.
 */
export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
  return <HomeLanding />;
}
