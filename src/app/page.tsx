import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import HomeLanding from "@/components/HomeLanding";

export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
  return <HomeLanding />;
}
