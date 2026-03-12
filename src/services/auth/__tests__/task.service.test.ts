import { buildTaskService, validateTaskTitle } from "@/services/tasks/task.service";
import { AppError } from "@/utils/app-error";

const mockRepository = {
  listByUser: jest.fn(),
  createForUser: jest.fn(),
  updateCompletion: jest.fn(),
  deleteForUser: jest.fn(),
};

const service = buildTaskService({ repository: mockRepository });

describe("validateTaskTitle", () => {
  it("lança AppError quando título é vazio", () => {
    expect(() => validateTaskTitle("")).toThrow(AppError);
    expect(() => validateTaskTitle("   ")).toThrow(AppError);
  });

  it("lança AppError quando título é muito curto", () => {
    expect(() => validateTaskTitle("ab")).toThrow(AppError);
  });

  it("lança AppError quando título é muito longo", () => {
    const longTitle = "a".repeat(121);
    expect(() => validateTaskTitle(longTitle)).toThrow(AppError);
  });

  it("retorna título válido trimado", () => {
    const result = validateTaskTitle("  Fazer exercícios  ");
    expect(result).toBe("Fazer exercícios");
  });
});