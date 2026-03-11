"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "aluno@authtask.dev";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "123456";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const result = await login(email, password);
    if (!result.ok) {
      setErrors({
        email: result.errors?.email,
        password: result.errors?.password,
        form: result.message,
      });
      return;
    }

    if (redirectTo && redirectTo.startsWith("/")) {
      window.location.assign(redirectTo);
    }
  }

  return (
    <div className="card">
      <h1>Entrar no AuthTask Manager</h1>
      <p className="hint">
        Login de demonstração para foco em arquitetura e testes.
      </p>
      <form onSubmit={handleSubmit} className="stack-md">
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <small className="error">{errors.email}</small> : null}
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? <small className="error">{errors.password}</small> : null}
        </label>

        {errors.form ? <p className="error-banner">{errors.form}</p> : null}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="hint">
        Credenciais padrão: <strong>{DEMO_EMAIL}</strong> / <strong>{DEMO_PASSWORD}</strong>
      </p>
    </div>
  );
}
