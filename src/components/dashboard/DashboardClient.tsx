"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import type { Task } from "@/services/tasks/task.types";

import { TaskComposer } from "./TaskComposer";
import { TaskList } from "./TaskList";

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function DashboardClient() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        cache: "no-store",
      });
      const payload = await safeJson<{ tasks?: Task[]; message?: string }>(response);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao carregar tarefas.");
      }

      setTasks(payload?.tasks ?? []);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Erro ao carregar tarefas.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function createTask(title: string) {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const payload = await safeJson<{ task?: Task; message?: string }>(response);

      if (!response.ok || !payload?.task) {
        throw new Error(payload?.message ?? "Erro ao criar tarefa.");
      }

      setTasks((previous) => [payload.task!, ...previous]);
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Erro ao criar tarefa.";
      setError(message);
      throw createError;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      const payload = await safeJson<{ task?: Task; message?: string }>(response);

      if (!response.ok || !payload?.task) {
        throw new Error(payload?.message ?? "Erro ao atualizar tarefa.");
      }

      setTasks((previous) =>
        previous.map((task) => (task.id === taskId ? payload.task! : task)),
      );
    } catch (toggleError) {
      const message =
        toggleError instanceof Error ? toggleError.message : "Erro ao atualizar tarefa.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTask(taskId: string) {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const payload = await safeJson<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao excluir tarefa.");
      }

      setTasks((previous) => previous.filter((task) => task.id !== taskId));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Erro ao excluir tarefa.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="card stack-lg">
      <header className="dashboard-header">
        <div>
          <h2>Painel de Tarefas</h2>
          <p className="hint">
            Usuário autenticado: <strong>{user?.email}</strong>
          </p>
        </div>
        <button type="button" className="ghost" onClick={logout} disabled={isSaving}>
          Logout
        </button>
      </header>

      <TaskComposer disabled={isSaving} onCreate={createTask} />

      {isLoading ? <p>Carregando tarefas...</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}
      {!isLoading ? (
        <TaskList
          tasks={tasks}
          disabled={isSaving}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      ) : null}
    </section>
  );
}
