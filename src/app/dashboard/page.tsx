import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { ServerTaskSummary } from "@/components/dashboard/ServerTaskSummary";
import { getSessionUserFromCookies } from "@/services/auth/session.service";

export default async function DashboardPage() {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="page-shell stack-lg">
      <section className="card">
        <h1>Dashboard protegido</h1>
        <p className="hint">
          Esta área é protegida por middleware e validação de sessão no servidor.
        </p>
      </section>

      <ServerTaskSummary userId={user.id} />
      <DashboardClient />
    </main>
  );
}
