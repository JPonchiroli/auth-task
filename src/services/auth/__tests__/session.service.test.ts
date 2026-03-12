/**
 * @jest-environment node
 */
import {
  createSessionToken,
  verifySessionToken,
  getSessionCookieOptions,
  getSessionUserFromCookies,
  requireSessionUserFromCookies,
} from "../session.service";
import { AppError } from "@/utils/app-error";
import { AUTH_COOKIE_NAME, SESSION_TTL_SECONDS } from "../auth.constants";

const mockUser = { id: "user_1", name: "Test", email: "test@test.com" };

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  process.env.AUTH_SESSION_SECRET = "test-secret";
});

describe("createSessionToken", () => {
  it("retorna token no formato payload.signature", () => {
    const token = createSessionToken(mockUser);
    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBeTruthy();
    expect(parts[1]).toBeTruthy();
  });

  it("token contém dados do usuário no payload", () => {
    const token = createSessionToken(mockUser);
    const [encodedPayload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
    expect(decoded.user).toEqual(mockUser);
  });

  it("token contém exp no futuro", () => {
    const token = createSessionToken(mockUser);
    const [encodedPayload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});

describe("verifySessionToken", () => {
  it("retorna null quando token é undefined", () => {
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("retorna null quando token é string vazia", () => {
    expect(verifySessionToken("")).toBeNull();
  });

  it("retorna null quando token não tem assinatura", () => {
    expect(verifySessionToken("somentePayload")).toBeNull();
  });

  it("retorna null quando assinatura é inválida", () => {
    const token = createSessionToken(mockUser);
    const [encodedPayload] = token.split(".");
    expect(verifySessionToken(`${encodedPayload}.assinatura-invalida`)).toBeNull();
  });

  it("retorna null quando token está expirado", () => {
    const expiredPayload = {
      user: mockUser,
      exp: Math.floor(Date.now() / 1000) - 3600,
    };
    const encoded = Buffer.from(JSON.stringify(expiredPayload)).toString("base64");
    const { createHmac } = require("node:crypto");
    const signature = createHmac("sha256", "test-secret").update(encoded).digest("hex");
    expect(verifySessionToken(`${encoded}.${signature}`)).toBeNull();
  });

  it("retorna payload quando token é válido", () => {
    const token = createSessionToken(mockUser);
    const result = verifySessionToken(token);
    expect(result).not.toBeNull();
    expect(result?.user).toEqual(mockUser);
  });
});

describe("getSessionCookieOptions", () => {
  it("retorna opções padrão com TTL correto", () => {
    const result = getSessionCookieOptions();
    expect(result.name).toBe(AUTH_COOKIE_NAME);
    expect(result.cookieOptions.httpOnly).toBe(true);
    expect(result.cookieOptions.sameSite).toBe("lax");
    expect(result.cookieOptions.maxAge).toBe(SESSION_TTL_SECONDS);
    expect(result.cookieOptions.path).toBe("/");
  });

  it("respeita maxAge customizado", () => {
    const result = getSessionCookieOptions({ maxAge: 0 });
    expect(result.cookieOptions.maxAge).toBe(0);
  });

  it("secure é false fora de produção", () => {
    const result = getSessionCookieOptions();
    expect(result.cookieOptions.secure).toBe(false);
  });

  it("secure é true em produção", () => {
    const original = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true });
    const result = getSessionCookieOptions();
    expect(result.cookieOptions.secure).toBe(true);
    Object.defineProperty(process.env, "NODE_ENV", { value: original, writable: true });
  });
});

describe("getSessionUserFromCookies", () => {
  it("retorna usuário quando cookie tem token válido", async () => {
    const token = createSessionToken(mockUser);
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: token }),
    });

    const user = await getSessionUserFromCookies();
    expect(user).toEqual(mockUser);
  });

  it("retorna null quando cookie está ausente", async () => {
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => undefined,
    });

    const user = await getSessionUserFromCookies();
    expect(user).toBeNull();
  });

  it("retorna null quando token é inválido", async () => {
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: "token.invalido" }),
    });

    const user = await getSessionUserFromCookies();
    expect(user).toBeNull();
  });
});

describe("requireSessionUserFromCookies", () => {
  it("retorna usuário quando sessão é válida", async () => {
    const token = createSessionToken(mockUser);
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: token }),
    });

    const user = await requireSessionUserFromCookies();
    expect(user).toEqual(mockUser);
  });

  it("lança AppError quando sessão é inválida", async () => {
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => undefined,
    });

    await expect(requireSessionUserFromCookies()).rejects.toThrow(AppError);
  });
});