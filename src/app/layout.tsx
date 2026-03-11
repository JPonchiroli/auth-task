import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/AppProviders";
import { getSessionUserFromCookies } from "@/services/auth/session.service";

import "./globals.css";

export const metadata: Metadata = {
  title: "AuthTask Manager",
  description: "Aplicação base para trabalho de testes com Next.js + Jest + RTL.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getSessionUserFromCookies();

  return (
    <html lang="pt-BR">
      <body>
        <AppProviders initialUser={initialUser}>{children}</AppProviders>
      </body>
    </html>
  );
}
