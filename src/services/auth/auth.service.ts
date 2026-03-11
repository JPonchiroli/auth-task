import { AppError } from "@/utils/app-error";

import type { AuthUser, LoginPayload } from "./auth.types";

type LoginValidationErrors = {
  email?: string;
  password?: string;
};

const DEMO_USER = {
  id: process.env.AUTH_DEMO_USER_ID ?? "aluno_demo",
  name: process.env.AUTH_DEMO_USER_NAME ?? "Aluno Demo",
  email: process.env.AUTH_DEMO_EMAIL ?? "aluno@authtask.dev",
  password: process.env.AUTH_DEMO_PASSWORD ?? "123456",
};

export function validateLoginPayload(
  payload: Partial<LoginPayload>,
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};
  const email = payload.email?.trim() ?? "";
  const password = payload.password?.trim() ?? "";

  if (!email) {
    errors.email = "E-mail é obrigatório.";
  } else if (!/^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/.test(email)) {
    errors.email = "Formato de e-mail inválido.";
  }

  if (!password) {
    errors.password = "Senha é obrigatória.";
  } else if (password.length < 6) {
    errors.password = "Senha deve conter pelo menos 6 caracteres.";
  }

  return errors;
}

export function hasValidationErrors(errors: LoginValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function sanitizeUserId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_");
}

export async function authenticateUser(payload: LoginPayload): Promise<AuthUser> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();

  if (email !== DEMO_USER.email.toLowerCase() || password !== DEMO_USER.password) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "Credenciais inválidas. Verifique e-mail e senha.",
      401,
    );
  }

  return {
    id: sanitizeUserId(DEMO_USER.id || DEMO_USER.email),
    name: DEMO_USER.name,
    email: DEMO_USER.email,
  };
}
