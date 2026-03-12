jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { AppError } from "@/utils/app-error";
import { toErrorResponse, badRequest } from "@/utils/http-response";

describe("toErrorResponse", () => {
  it("retorna resposta com status do AppError", async () => {
    const error = new AppError("INVALID_TOKEN", "Token inválido", 401);

    const response = toErrorResponse(error);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: "Token inválido",
      code: "INVALID_TOKEN",
      details: undefined,
    });
  });

  it("retorna erro inesperado para erro genérico", async () => {
    const error = new Error("Algo deu errado");

    const response = toErrorResponse(error);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      message: "Erro inesperado no servidor.",
      code: "UNEXPECTED_ERROR",
    });
  });
});

describe("badRequest", () => {
  it("lança AppError com status 400", () => {
    expect(() => {
      badRequest("Requisição inválida", { field: "email" });
    }).toThrow(AppError);

    try {
      badRequest("Requisição inválida", { field: "email" });
    } catch (error) {
      const appError = error as AppError;

      expect(appError.code).toBe("BAD_REQUEST");
      expect(appError.status).toBe(400);
      expect(appError.message).toBe("Requisição inválida");
      expect(appError.details).toEqual({ field: "email" });
    }
  });
});