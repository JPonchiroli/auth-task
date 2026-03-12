import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "../TaskList";

const tasks = [
  { id: "1", title: "Task 1", completed: false },
  { id: "2", title: "Task 2", completed: true },
];

describe("TaskList", () => {
  it("mostra mensagem quando lista está vazia", () => {
    render(
      <TaskList tasks={[]} onToggle={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.getByText(/nenhuma tarefa cadastrada/i)).toBeInTheDocument();
  });

  it("renderiza tarefas", () => {
    render(
      <TaskList tasks={tasks} onToggle={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("chama onToggle ao clicar checkbox", async () => {
    const user = userEvent.setup();
    const toggleMock = jest.fn();

    render(
      <TaskList tasks={tasks} onToggle={toggleMock} onDelete={jest.fn()} />
    );

    const checkbox = screen.getAllByRole("checkbox")[0];

    await user.click(checkbox);

    expect(toggleMock).toHaveBeenCalledWith("1", true);
  });

  it("chama onDelete ao clicar botão deletar", async () => {
    const user = userEvent.setup();
    const deleteMock = jest.fn();

    render(
      <TaskList tasks={tasks} onToggle={jest.fn()} onDelete={deleteMock} />
    );

    const button = screen.getAllByRole("button", { name: /deletar/i })[0];

    await user.click(button);

    expect(deleteMock).toHaveBeenCalledWith("1");
  });
});