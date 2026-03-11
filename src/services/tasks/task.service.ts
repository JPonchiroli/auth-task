import { AppError } from "@/utils/app-error";

import { firestoreTaskRepository } from "./task.repository";
import type {
  CreateTaskInput,
  DeleteTaskInput,
  Task,
  TaskSummary,
  ToggleTaskInput,
} from "./task.types";

export type TaskServiceDeps = {
  repository: {
    listByUser(userId: string): Promise<Task[]>;
    createForUser(userId: string, title: string): Promise<Task>;
    updateCompletion(userId: string, taskId: string, completed: boolean): Promise<Task>;
    deleteForUser(userId: string, taskId: string): Promise<void>;
  };
};

export function validateTaskTitle(title: string): string {
  const trimmed = title.trim();

  if (!trimmed) {
    throw new AppError("INVALID_TASK_TITLE", "Título da tarefa é obrigatório.", 400);
  }

  if (trimmed.length < 3) {
    throw new AppError(
      "INVALID_TASK_TITLE",
      "Título precisa ter pelo menos 3 caracteres.",
      400,
    );
  }

  if (trimmed.length > 120) {
    throw new AppError("INVALID_TASK_TITLE", "Título excede 120 caracteres.", 400);
  }

  return trimmed;
}

function assertIdentifier(value: string, field: string): string {
  const cleaned = value.trim();

  if (!cleaned) {
    throw new AppError("INVALID_IDENTIFIER", `${field} é obrigatório.`, 400);
  }

  return cleaned;
}

export function buildTaskService({ repository }: TaskServiceDeps) {
  return {
    async listTasks(userId: string): Promise<Task[]> {
      const safeUserId = assertIdentifier(userId, "Usuário");
      return repository.listByUser(safeUserId);
    },

    async createTask(input: CreateTaskInput): Promise<Task> {
      const safeUserId = assertIdentifier(input.userId, "Usuário");
      const title = validateTaskTitle(input.title);

      return repository.createForUser(safeUserId, title);
    },

    async toggleTaskCompletion(input: ToggleTaskInput): Promise<Task> {
      const safeUserId = assertIdentifier(input.userId, "Usuário");
      const safeTaskId = assertIdentifier(input.taskId, "Tarefa");

      return repository.updateCompletion(safeUserId, safeTaskId, input.completed);
    },

    async deleteTask(input: DeleteTaskInput): Promise<void> {
      const safeUserId = assertIdentifier(input.userId, "Usuário");
      const safeTaskId = assertIdentifier(input.taskId, "Tarefa");

      await repository.deleteForUser(safeUserId, safeTaskId);
    },

    async getSummary(userId: string): Promise<TaskSummary> {
      const tasks = await repository.listByUser(assertIdentifier(userId, "Usuário"));
      const completed = tasks.filter((task) => task.completed).length;

      return {
        total: tasks.length,
        completed,
        pending: tasks.length - completed,
      };
    },
  };
}

export const taskService = buildTaskService({
  repository: firestoreTaskRepository,
});
