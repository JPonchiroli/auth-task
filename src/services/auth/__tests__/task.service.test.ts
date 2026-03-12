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

describe("taskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listTasks", () => {
    it("chama repository.listByUser com userId válido", async () => {
      const tasks = [{ id: "1", title: "task", completed: false }];

      mockRepository.listByUser.mockResolvedValue(tasks);

      const result = await service.listTasks("user-1");

      expect(mockRepository.listByUser).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(tasks);
    });

    it("lança AppError se userId for vazio", async () => {
      await expect(service.listTasks("")).rejects.toThrow(AppError);
    });
  });

  describe("createTask", () => {
    it("chama repository.createForUser com dados válidos", async () => {
      const task = { id: "1", title: "Estudar", completed: false };

      mockRepository.createForUser.mockResolvedValue(task);

      const result = await service.createTask({
        userId: "user-1",
        title: "  Estudar  ",
      });

      expect(mockRepository.createForUser).toHaveBeenCalledWith(
        "user-1",
        "Estudar"
      );

      expect(result).toEqual(task);
    });

    it("lança AppError se userId for vazio", async () => {
      await expect(
        service.createTask({
          userId: "",
          title: "Estudar",
        })
      ).rejects.toThrow(AppError);
    });

    it("lança AppError se título for inválido", async () => {
      await expect(
        service.createTask({
          userId: "user-1",
          title: "ab",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("deleteTask", () => {
    it("chama repository.deleteForUser com ids válidos", async () => {
      mockRepository.deleteForUser.mockResolvedValue(undefined);

      await service.deleteTask({
        userId: "user-1",
        taskId: "task-1",
      });

      expect(mockRepository.deleteForUser).toHaveBeenCalledWith(
        "user-1",
        "task-1"
      );
    });

    it("lança AppError se userId for vazio", async () => {
      await expect(
        service.deleteTask({
          userId: "",
          taskId: "task-1",
        })
      ).rejects.toThrow(AppError);
    });

    it("lança AppError se taskId for vazio", async () => {
      await expect(
        service.deleteTask({
          userId: "user-1",
          taskId: "",
        })
      ).rejects.toThrow(AppError);
    });
  });
});