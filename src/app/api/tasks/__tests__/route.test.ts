/**
 * @jest-environment node
 */
import { GET, POST } from "../route";

const mockUser = { id: "user_1", name: "Test", email: "test@test.com" };

jest.mock("@/services/auth/session.service", () => ({
  requireSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    listTasks: jest.fn(),
    createTask: jest.fn(),
  },
}));

function createRequest(body: object): Request {
  return new Request("http://localhost/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/tasks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 200 com lista de tarefas", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { taskService } = await import("@/services/tasks/task.service");

    const mockTasks = [{ id: "t1", title: "Tarefa 1", completed: false }];
    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);
    (taskService.listTasks as jest.Mock).mockResolvedValue(mockTasks);

    const response = await GET();

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.tasks).toEqual(mockTasks);
    expect(taskService.listTasks).toHaveBeenCalledWith(mockUser.id);
  });

  it("retorna erro quando sessão inválida", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { AppError } = await import("@/utils/app-error");

    (requireSessionUserFromCookies as jest.Mock).mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    const response = await GET();

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });
});

describe("POST /api/tasks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 201 com tarefa criada", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { taskService } = await import("@/services/tasks/task.service");

    const mockTask = { id: "t1", title: "Nova tarefa", completed: false };
    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);
    (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);

    const response = await POST(createRequest({ title: "Nova tarefa" }));

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.task).toEqual(mockTask);
    expect(taskService.createTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      title: "Nova tarefa",
    });
  });

  it("usa string vazia quando title não informado", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { taskService } = await import("@/services/tasks/task.service");

    const mockTask = { id: "t2", title: "", completed: false };
    (requireSessionUserFromCookies as jest.Mock).mockResolvedValue(mockUser);
    (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);

    const response = await POST(createRequest({}));

    expect(taskService.createTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      title: "",
    });
    expect(response.status).toBe(201);
  });

  it("retorna erro quando sessão inválida", async () => {
    const { requireSessionUserFromCookies } = await import(
      "@/services/auth/session.service"
    );
    const { AppError } = await import("@/utils/app-error");

    (requireSessionUserFromCookies as jest.Mock).mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    const response = await POST(createRequest({ title: "Tarefa" }));

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });
});