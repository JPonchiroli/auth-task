"use client";

import type { Task } from "@/services/tasks/task.types";

type TaskListProps = {
  tasks: Task[];
  disabled?: boolean;
  onToggle: (taskId: string, completed: boolean) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
};

export function TaskList({
  tasks,
  disabled = false,
  onToggle,
  onDelete,
}: TaskListProps) {
  if (!tasks.length) {
    return <p className="hint">Nenhuma tarefa cadastrada ainda.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-item">
          <label>
            <input
              type="checkbox"
              checked={task.completed}
              disabled={disabled}
              onChange={(event) => onToggle(task.id, event.target.checked)}
            />
            <span className={task.completed ? "task-title task-done" : "task-title"}>
              {task.title}
            </span>
          </label>
          <button
            type="button"
            className="ghost danger"
            disabled={disabled}
            onClick={() => onDelete(task.id)}
          >
            Deletar
          </button>
        </li>
      ))}
    </ul>
  );
}
