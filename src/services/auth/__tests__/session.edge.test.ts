/**
 * @jest-environment node
 */
import { readUnverifiedSessionToken } from "../session.edge";

function makeToken(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `${encoded}.fake-signature`;
}

const validPayload = {
  user: { id: "user_1", name: "Test", email: "test@test.com" },
  exp: Math.floor(Date.now() / 1000) + 3600,
};

describe("readUnverifiedSessionToken", () => {
  it("retorna null quando token é undefined", () => {
    expect(readUnverifiedSessionToken(undefined)).toBeNull();
  });

  it("retorna null quando token é string vazia", () => {
    expect(readUnverifiedSessionToken("")).toBeNull();
  });

  it("retorna null quando token não tem ponto separador", () => {
    expect(readUnverifiedSessionToken("sempontoalgum")).toBeNull();
  });

  it("retorna null quando payload não é base64 válido", () => {
    expect(readUnverifiedSessionToken("!!!.signature")).toBeNull();
  });

  it("retorna null quando payload não é JSON válido", () => {
    const invalidJson = Buffer.from("não é json").toString("base64");
    expect(readUnverifiedSessionToken(`${invalidJson}.signature`)).toBeNull();
  });

  it("retorna null quando token está expirado", () => {
    const expiredPayload = {
      ...validPayload,
      exp: Math.floor(Date.now() / 1000) - 3600,
    };
    expect(readUnverifiedSessionToken(makeToken(expiredPayload))).toBeNull();
  });

  it("retorna null quando exp está ausente", () => {
    const { exp: _, ...withoutExp } = validPayload;
    expect(readUnverifiedSessionToken(makeToken(withoutExp))).toBeNull();
  });

  it("retorna payload quando token é válido", () => {
    const result = readUnverifiedSessionToken(makeToken(validPayload));

    expect(result).not.toBeNull();
    expect(result?.user.email).toBe("test@test.com");
    expect(result?.exp).toBe(validPayload.exp);
  });

  it("retorna null quando atob não está disponível e Buffer falha", () => {
    const originalAtob = global.atob;
    // @ts-expect-error — simula ambiente sem atob
    global.atob = undefined;

    const result = readUnverifiedSessionToken(makeToken(validPayload));

    expect(result).toBeNull();

    global.atob = originalAtob;
  });
});