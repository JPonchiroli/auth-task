import { AuthProvider } from "@/context/AuthContext";
import type { AuthUser } from "@/services/auth/auth.types";

type AppProvidersProps = {
  children: React.ReactNode;
  initialUser: AuthUser | null;
};

export function AppProviders({ children, initialUser }: AppProvidersProps) {
  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
