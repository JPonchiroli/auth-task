"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser } from "@/services/auth/auth.types";

type LoginResult = {
  ok: boolean;
  message?: string;
  errors?: {
    email?: string;
    password?: string;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  initialUser: AuthUser | null;
  children: React.ReactNode;
};

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string): Promise<LoginResult> {
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as {
        message?: string;
        user?: AuthUser;
        errors?: {
          email?: string;
          password?: string;
        };
      };

      if (!response.ok || !payload.user) {
        return {
          ok: false,
          message: payload.message ?? "Falha ao realizar login.",
          errors: payload.errors,
        };
      }

      setUser(payload.user);
      router.push("/dashboard");
      router.refresh();

      return { ok: true };
    } catch {
      return { ok: false, message: "Erro de rede ao realizar login." };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);

    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push("/login");
      router.refresh();
    }
  }

  const value: AuthContextValue = { user, setUser, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider />.");
  }

  return context;
}
