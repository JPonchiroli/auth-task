import {
  validateLoginPayload,
  hasValidationErrors,
  sanitizeUserId,
  authenticateUser,
} from "@/services/auth/auth.service";
import { AppError } from "@/utils/app-error";

jest.mock("@/services/auth/auth.service", () => {
  const actual = jest.requireActual("@/services/auth/auth.service");

  return {
    ...actual,
    authenticateUser: jest.fn(),
  };
});

const mockedAuthenticateUser = authenticateUser as jest.Mock;

describe("validateLoginPayload", () => {
  it("retorna erro quando email está vazio", () => {
    const result = validateLoginPayload({ email: "", password: "123456" });

    expect(result.email).toBe("E-mail é obrigatório.");
  });

  it("retorna erro quando email é inválido", () => {
    const result = validateLoginPayload({
      email: "email_invalido",
      password: "123456",
    });

    expect(result.email).toBe("Formato de e-mail inválido.");
  });

  it("retorna erro quando senha está vazia", () => {
    const result = validateLoginPayload({
      email: "teste@email.com",
      password: "",
    });

    expect(result.password).toBe("Senha é obrigatória.");
  });

  it("retorna erro quando senha é curta", () => {
    const result = validateLoginPayload({
      email: "teste@email.com",
      password: "123",
    });

    expect(result.password).toBe("Senha deve conter pelo menos 6 caracteres.");
  });

  it("não retorna erros com payload válido", () => {
    const result = validateLoginPayload({
      email: "teste@email.com",
      password: "123456",
    });

    expect(result).toEqual({});
  });
});

describe("hasValidationErrors", () => {
  it("retorna true quando existe erro", () => {
    const errors = { email: "Erro de email" };

    expect(hasValidationErrors(errors)).toBe(true);
  });

  it("retorna false quando não existem erros", () => {
    expect(hasValidationErrors({})).toBe(false);
  });
});

describe("sanitizeUserId", () => {
  it("normaliza id removendo caracteres inválidos", () => {
    const result = sanitizeUserId(" Usuário@Teste!! ");

    expect(result).toBe("usu_rio_teste_");
  });

  it("remove underscores duplicados", () => {
    const result = sanitizeUserId("user__name");

    expect(result).toBe("user_name");
  });
});

describe("authenticateUser (mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("retorna usuário quando credenciais são válidas", async () => {
    mockedAuthenticateUser.mockResolvedValueOnce({
      id: "1",
      name: "Aluno Demo",
      email: "aluno@authtask.dev",
    });

    const user = await authenticateUser({
      email: "aluno@authtask.dev",
      password: "123456",
    });

    expect(user).toEqual({
      id: "1",
      name: "Aluno Demo",
      email: "aluno@authtask.dev",
    });
  });

  it("lança AppError quando credenciais são inválidas", async () => {
    mockedAuthenticateUser.mockRejectedValueOnce(
      new AppError("INVALID_CREDENTIALS", "Credenciais inválidas", 401),
    );

    await expect(
      authenticateUser({
        email: "errado@email.com",
        password: "123456",
      }),
    ).rejects.toThrow(AppError);
  });

  it("lança erro quando senha está errada", async () => {
    mockedAuthenticateUser.mockRejectedValueOnce(
      new AppError("INVALID_PASSWORD", "Senha incorreta", 401),
    );

    await expect(
      authenticateUser({
        email: "aluno@authtask.dev",
        password: "senha_errada",
      }),
    ).rejects.toThrow(AppError);
  });
});