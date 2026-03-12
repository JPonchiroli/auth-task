/**
 * @jest-environment node
 */
import { POST } from "../route";

jest.mock("@/services/auth/session.service", () => ({
  getSessionCookieOptions: jest.fn(() => ({
    name: "session",
    value: "",
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 0,
    },
  })),
}));

describe("POST /api/logout", () => {
  it("retorna 200 com mensagem de sucesso", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("Logout realizado com sucesso.");
  });

  it("chama getSessionCookieOptions com maxAge 0", async () => {
    const { getSessionCookieOptions } = await import(
      "@/services/auth/session.service"
    );

    await POST();

    expect(getSessionCookieOptions).toHaveBeenCalledWith({ maxAge: 0 });
  });

  it("define cookie com maxAge 0 na resposta", async () => {
    const response = await POST();

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toContain("Max-Age=0");
  });
});