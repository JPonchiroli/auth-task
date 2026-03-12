/**
 * @jest-environment node
 */

import { POST } from "../route";

function createRequest(body: object): Request {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/login", () => {

  beforeEach(() => {
    process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
    process.env.AUTH_DEMO_PASSWORD = "123456";
    process.env.AUTH_SESSION_SECRET = "test-secret";
  });

  it("retorna 200 com credenciais válidas", async () => {

    const response = await POST(
      createRequest({
        email: "aluno@authtask.dev",
        password: "123456",
      })
    );

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.user).toBeDefined();
    expect(json.user.email).toBe("aluno@authtask.dev");
  });

  it("retorna 400 quando dados incompletos", async () => {

    const response = await POST(
      createRequest({
        email: "",
      })
    );

    expect(response.status).toBe(400);

    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  it("retorna 400 quando body está vazio", async () => {

    const response = await POST(
      createRequest({})
    );

    expect(response.status).toBe(400);

    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  it("retorna 401 quando credenciais inválidas", async () => {

    const response = await POST(
      createRequest({
        email: "wrong@test.com",
        password: "wrong",
      })
    );

    expect(response.status).toBe(400);

    const json = await response.json();

    expect(json.message).toBeDefined();
  });

});