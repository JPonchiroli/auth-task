import type { AuthUser } from "./auth.types";

type UnverifiedSessionPayload = {
  user: AuthUser;
  exp: number;
};

function decodeBase64(value: string): string {
  try {
    if (typeof atob === "function") {
      return atob(value);
    }
  } catch {
    return "";
  }

  return "";
}

export function readUnverifiedSessionToken(
  token: string | undefined,
): UnverifiedSessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload] = token.split(".");
  if (!encodedPayload) {
    return null;
  }

  const decoded = decodeBase64(encodedPayload);
  if (!decoded) {
    return null;
  }

  try {
    const payload = JSON.parse(decoded) as UnverifiedSessionPayload;

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
