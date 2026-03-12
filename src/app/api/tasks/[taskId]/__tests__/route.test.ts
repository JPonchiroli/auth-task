/**
 * @jest-environment node
 */
import { PATCH, DELETE } from "../route";

const mockUser = { id: "user_1", name: "Test", email: "test@test.com" };
const mockContext = { params: Promise.resolve({ taskId: "task_1" }) };

jest.mock("@/services/auth/session.service", () => ({
  requireSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    toggleTaskCompletion: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

function createRequest(body: object): Request {
  return new Request("http://localhost/api/tasks/task_1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/tasks/[taskId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 200 com tarefa atualizada", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { taskService } = await import("@/services/tasks/task.service");

    const mockTask = { id: "task_1", title: "Tarefa", completed: true };
    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);
    (taskService.toggleTaskCompletion as jest.Mock).mockResolvedValue(mockTask);

    const response = await PATCH(createRequest({ completed: true }), mockContext);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.task).toEqual(mockTask);
    expect(taskService.toggleTaskCompletion).toHaveBeenCalledWith({
      userId: mockUser.id,
      taskId: "task_1",
      completed: true,
    });
  });

  it("retorna 400 quando completed não é boolean", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);

    const response = await PATCH(createRequest({ completed: "true" }), mockContext);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });

  it("retorna 400 quando completed está ausente", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);

    const response = await PATCH(createRequest({}), mockContext);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });

  it("retorna 401 quando sessão inválida", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { AppError } = await import("@/utils/app-error");

    (requireSessionUserFromCookies as jest.Mock).mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    const response = await PATCH(createRequest({ completed: true }), mockContext);

    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/tasks/[taskId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 200 com mensagem de sucesso", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { taskService } = await import("@/services/tasks/task.service");

    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);
    (taskService.deleteTask as jest.Mock).mockResolvedValue(undefined);

    const deleteRequest = new Request("http://localhost/api/tasks/task_1", {
      method: "DELETE",
    });

    const response = await DELETE(deleteRequest, mockContext);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("Tarefa removida com sucesso.");
    expect(taskService.deleteTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      taskId: "task_1",
    });
  });

  it("retorna 401 quando sessão inválida", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { AppError } = await import("@/utils/app-error");

    (requireSessionUserFromCookies as jest.Mock).mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    const deleteRequest = new Request("http://localhost/api/tasks/task_1", {
      method: "DELETE",
    });

    const response = await DELETE(deleteRequest, mockContext);

    expect(response.status).toBe(401);
  });

  it("retorna erro quando deleteTask falha", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { taskService } = await import("@/services/tasks/task.service");
    const { AppError } = await import("@/utils/app-error");

    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);
    (taskService.deleteTask as jest.Mock).mockRejectedValue(
      new AppError("NOT_FOUND", "Tarefa não encontrada.", 404)
    );

    const deleteRequest = new Request("http://localhost/api/tasks/task_1", {
      method: "DELETE",
    });

    const response = await DELETE(deleteRequest, mockContext);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });
});