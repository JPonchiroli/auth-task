import { AppError } from "@/utils/app-error";

import type { Task } from "./task.types";
import { log } from "console";

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type TaskRepository = {
  listByUser(userId: string): Promise<Task[]>;
  createForUser(userId: string, title: string): Promise<Task>;
  updateCompletion(userId: string, taskId: string, completed: boolean): Promise<Task>;
  deleteForUser(userId: string, taskId: string): Promise<void>;
};

function getFirestoreSettings(): { projectId: string; apiKey: string } {
  const projectId = process.env.FIREBASE_PROJECT_ID ? process.env.FIREBASE_PROJECT_ID : 'nao tem';
  const apiKey = process.env.FIREBASE_WEB_API_KEY ? process.env.FIREBASE_WEB_API_KEY : 'nao tem';

  if (!projectId || !apiKey) {
    throw new AppError(
      "FIREBASE_NOT_CONFIGURED",
      `Defina FIREBASE_PROJECT_ID e FIREBASE_WEB_API_KEY no arquivo .env.local.`,
      500,
    );
  }

  return { projectId, apiKey };
}

function buildCollectionUrl(userId: string): string {
  const { projectId, apiKey } = getFirestoreSettings();
  const safeUserId = encodeURIComponent(userId);

  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${safeUserId}/tasks?key=${apiKey}`;
}

function buildDocumentUrl(userId: string, taskId: string): string {
  const { projectId, apiKey } = getFirestoreSettings();
  const safeUserId = encodeURIComponent(userId);
  const safeTaskId = encodeURIComponent(taskId);

  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${safeUserId}/tasks/${safeTaskId}?key=${apiKey}`;
}

function toFirestoreTaskFields(title: string, completed = false): Record<string, FirestoreValue> {
  const now = Date.now();

  return {
    title: { stringValue: title },
    completed: { booleanValue: completed },
    createdAt: { integerValue: String(now) },
    updatedAt: { integerValue: String(now) },
  };
}

function toFirestoreCompletionFields(
  completed: boolean,
): Record<string, FirestoreValue> {
  return {
    completed: { booleanValue: completed },
    updatedAt: { integerValue: String(Date.now()) },
  };
}

function parseInteger(value: FirestoreValue | undefined): number {
  if (!value?.integerValue) {
    return 0;
  }

  const parsed = Number(value.integerValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fromFirestoreDocument(document: FirestoreDocument): Task {
  const fields = document.fields ?? {};
  const pathParts = document.name.split("/");
  const id = pathParts[pathParts.length - 1] ?? "";

  return {
    id,
    title: fields.title?.stringValue ?? "",
    completed: fields.completed?.booleanValue ?? false,
    createdAt: parseInteger(fields.createdAt),
    updatedAt: parseInteger(fields.updatedAt),
  };
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function throwIfNotOk(response: Response, fallbackMessage: string): never | void {
  if (response.ok) {
    return;
  }

  throw new AppError("FIRESTORE_REQUEST_FAILED", fallbackMessage, response.status);
}

export const firestoreTaskRepository: TaskRepository = {
  async listByUser(userId) {
    const response = await fetch(buildCollectionUrl(userId), {
      method: "GET",
      cache: "no-store",
    });

    if (response.status === 404) {
      return [];
    }

    throwIfNotOk(response, "Falha ao listar tarefas no Firestore.");

    const payload = await parseJsonSafe<{ documents?: FirestoreDocument[] }>(response);
    const tasks = (payload?.documents ?? []).map(fromFirestoreDocument);

    return tasks.sort((left, right) => right.createdAt - left.createdAt);
  },

  async createForUser(userId, title) {
    const response = await fetch(buildCollectionUrl(userId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreTaskFields(title),
      }),
    });

    throwIfNotOk(response, "Falha ao criar tarefa no Firestore.");

    const document = await parseJsonSafe<FirestoreDocument>(response);
    if (!document) {
      throw new AppError("INVALID_FIRESTORE_RESPONSE", "Resposta inválida do Firestore.", 500);
    }

    return fromFirestoreDocument(document);
  },

  async updateCompletion(userId, taskId, completed) {
    const updateMask = "updateMask.fieldPaths=completed&updateMask.fieldPaths=updatedAt";
    const response = await fetch(`${buildDocumentUrl(userId, taskId)}&${updateMask}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreCompletionFields(completed),
      }),
    });

    throwIfNotOk(response, "Falha ao atualizar tarefa no Firestore.");

    const document = await parseJsonSafe<FirestoreDocument>(response);
    if (!document) {
      throw new AppError("INVALID_FIRESTORE_RESPONSE", "Resposta inválida do Firestore.", 500);
    }

    return fromFirestoreDocument(document);
  },

  async deleteForUser(userId, taskId) {
    const response = await fetch(buildDocumentUrl(userId, taskId), {
      method: "DELETE",
    });

    throwIfNotOk(response, "Falha ao deletar tarefa no Firestore.");
  },
};
