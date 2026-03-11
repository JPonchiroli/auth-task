import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { AppError } from "@/utils/app-error";

import { AUTH_COOKIE_NAME, SESSION_TTL_SECONDS } from "./auth.constants";
import type { AuthUser } from "./auth.types";

type SessionPayload = {
  user: AuthUser;
  exp: number;
};

type SessionCookieOptions = {
  maxAge?: number;
};

const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "change-this-secret";

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const json = Buffer.from(value, "base64").toString("utf8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(encodedPayload).digest("hex");
}

function safeSignatureMatch(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function createSessionToken(user: AuthUser): string {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeSignatureMatch(signature, expectedSignature)) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload || payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
}

export function getSessionCookieOptions(
  options: SessionCookieOptions = {},
): {
  name: string;
  value: string;
  cookieOptions: {
    path: string;
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    maxAge: number;
  };
} {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: options.maxAge ?? SESSION_TTL_SECONDS,
    },
  };
}

export async function getSessionUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);

  return payload?.user ?? null;
}

export async function requireSessionUserFromCookies(): Promise<AuthUser> {
  const user = await getSessionUserFromCookies();

  if (!user) {
    throw new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401);
  }

  return user;
}
