/**
 * @jest-environment node
 */
import { firestoreTaskRepository } from "../task.repository";
import { AppError } from "@/utils/app-error";

// Documento Firestore simulado
const mockDocument = {
  name: "projects/proj/databases/(default)/documents/users/user_1/tasks/task_1",
  fields: {
    title: { stringValue: "Tarefa teste" },
    completed: { booleanValue: false },
    createdAt: { integerValue: "1000" },
    updatedAt: { integerValue: "2000" },
  },
};

const mockTask = {
  id: "task_1",
  title: "Tarefa teste",
  completed: false,
  createdAt: 1000,
  updatedAt: 2000,
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.FIREBASE_WEB_API_KEY = "test-api-key";
  global.fetch = jest.fn();
});

function mockFetchOk(body: unknown) {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

function mockFetchError(status: number) {
  (fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: "erro" }),
  });
}

describe("firestoreTaskRepository.listByUser", () => {
  it("retorna lista de tarefas ordenadas por createdAt desc", async () => {
    const doc1 = { ...mockDocument, fields: { ...mockDocument.fields, createdAt: { integerValue: "1000" } } };
    const doc2 = {
      name: "projects/proj/databases/(default)/documents/users/user_1/tasks/task_2",
      fields: { ...mockDocument.fields, createdAt: { integerValue: "2000" } },
    };

    mockFetchOk({ documents: [doc1, doc2] });

    const tasks = await firestoreTaskRepository.listByUser("user_1");

    expect(tasks[0].createdAt).toBe(2000);
    expect(tasks[1].createdAt).toBe(1000);
  });

  it("retorna array vazio quando status 404", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    const tasks = await firestoreTaskRepository.listByUser("user_1");

    expect(tasks).toEqual([]);
  });

  it("retorna array vazio quando não há documentos", async () => {
    mockFetchOk({});

    const tasks = await firestoreTaskRepository.listByUser("user_1");

    expect(tasks).toEqual([]);
  });

  it("lança AppError quando fetch falha", async () => {
    mockFetchError(500);

    await expect(firestoreTaskRepository.listByUser("user_1")).rejects.toThrow(AppError);
  });
});

describe("firestoreTaskRepository.createForUser", () => {
  it("cria e retorna tarefa", async () => {
    mockFetchOk(mockDocument);

    const task = await firestoreTaskRepository.createForUser("user_1", "Tarefa teste");

    expect(task).toEqual(mockTask);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("user_1"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("lança AppError quando resposta não é ok", async () => {
    mockFetchError(403);

    await expect(
      firestoreTaskRepository.createForUser("user_1", "Tarefa")
    ).rejects.toThrow(AppError);
  });

  it("lança AppError quando resposta JSON é inválida", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new Error("invalid json"); },
    });

    await expect(
      firestoreTaskRepository.createForUser("user_1", "Tarefa")
    ).rejects.toThrow(AppError);
  });
});

describe("firestoreTaskRepository.updateCompletion", () => {
  it("atualiza e retorna tarefa", async () => {
    const updatedDoc = {
      ...mockDocument,
      fields: { ...mockDocument.fields, completed: { booleanValue: true } },
    };
    mockFetchOk(updatedDoc);

    const task = await firestoreTaskRepository.updateCompletion("user_1", "task_1", true);

    expect(task.completed).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("task_1"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("lança AppError quando resposta não é ok", async () => {
    mockFetchError(404);

    await expect(
      firestoreTaskRepository.updateCompletion("user_1", "task_1", true)
    ).rejects.toThrow(AppError);
  });

  it("lança AppError quando resposta JSON é inválida", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new Error("invalid json"); },
    });

    await expect(
      firestoreTaskRepository.updateCompletion("user_1", "task_1", false)
    ).rejects.toThrow(AppError);
  });
});

describe("firestoreTaskRepository.deleteForUser", () => {
  it("deleta tarefa com sucesso", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });

    await expect(
      firestoreTaskRepository.deleteForUser("user_1", "task_1")
    ).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("task_1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("lança AppError quando resposta não é ok", async () => {
    mockFetchError(404);

    await expect(
      firestoreTaskRepository.deleteForUser("user_1", "task_1")
    ).rejects.toThrow(AppError);
  });
});

describe("getFirestoreSettings", () => {
  it("lança AppError quando variáveis de ambiente não estão definidas", async () => {
    const original = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      apiKey: process.env.FIREBASE_WEB_API_KEY,
    };

    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_WEB_API_KEY;

    jest.resetModules();

    const { firestoreTaskRepository: repo } = await import("../task.repository");

    await expect(repo.listByUser("user_1")).rejects.toMatchObject({
      message: "Defina FIREBASE_PROJECT_ID e FIREBASE_WEB_API_KEY no arquivo .env.local."
    });

    process.env.FIREBASE_PROJECT_ID = original.projectId;
    process.env.FIREBASE_WEB_API_KEY = original.apiKey;
  });
});