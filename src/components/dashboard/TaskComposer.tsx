"use client";

import { FormEvent, useState } from "react";

type TaskComposerProps = {
  disabled?: boolean;
  onCreate: (title: string) => Promise<void>;
};

export function TaskComposer({ disabled = false, onCreate }: TaskComposerProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Digite um título para a tarefa.");
      return;
    }

    try {
      await onCreate(trimmed);
      setTitle("");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Erro ao criar tarefa.";
      setError(message);
    }
  }

  return (
    <form className="task-composer" onSubmit={handleSubmit}>
      <input
        name="taskTitle"
        type="text"
        placeholder="Nova tarefa..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>
        Adicionar
      </button>
      {error ? <p className="error-banner">{error}</p> : null}
    </form>
  );
}
