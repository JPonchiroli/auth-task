import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUserFromCookies } from "@/services/auth/session.service";

export default async function LoginPage() {
  const user = await getSessionUserFromCookies();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell">
      <LoginForm />
    </main>
  );
}
