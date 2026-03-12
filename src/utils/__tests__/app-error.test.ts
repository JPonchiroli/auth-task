import { AppError, isAppError } from "@/utils/app-error";

describe("AppError", () => {
  it("cria erro com propriedades corretas", () => {
    const error = new AppError("TEST_CODE", "Mensagem de erro", 400, { field: "email" });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);

    expect(error.name).toBe("AppError");
    expect(error.code).toBe("TEST_CODE");
    expect(error.message).toBe("Mensagem de erro");
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ field: "email" });
  });

  it("usa status 500 por padrão", () => {
    const error = new AppError("TEST_CODE", "Erro padrão");

    expect(error.status).toBe(500);
  });
});

describe("isAppError", () => {
  it("retorna true para AppError", () => {
    const error = new AppError("TEST", "Erro");

    expect(isAppError(error)).toBe(true);
  });

  it("retorna false para Error comum", () => {
    const error = new Error("Erro genérico");

    expect(isAppError(error)).toBe(false);
  });

  it("retorna false para null", () => {
    expect(isAppError(null)).toBe(false);
  });

  it("retorna false para objeto comum", () => {
    expect(isAppError({})).toBe(false);
  });
});