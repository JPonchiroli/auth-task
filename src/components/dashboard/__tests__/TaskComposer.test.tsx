import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskComposer } from "../TaskComposer";

describe("TaskComposer", () => {
  it("renderiza input e botão adicionar", () => {
    render(<TaskComposer onCreate={jest.fn()} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /adicionar/i })).toBeInTheDocument();
  });

  it("exibe erro se input estiver vazio", async () => {
    const user = userEvent.setup();

    render(<TaskComposer onCreate={jest.fn()} />);

    const button = screen.getByRole("button", { name: /adicionar/i });

    await user.click(button);

    expect(await screen.findByText(/digite um título/i)).toBeInTheDocument();
  });

  it("chama onCreate quando título é válido", async () => {
    const user = userEvent.setup();
    const createMock = jest.fn().mockResolvedValue(undefined);

    render(<TaskComposer onCreate={createMock} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /adicionar/i });

    await user.type(input, "Nova tarefa");
    await user.click(button);

    expect(createMock).toHaveBeenCalledWith("Nova tarefa");
  });

  it("mostra erro se onCreate falhar", async () => {
    const user = userEvent.setup();

    const createMock = jest.fn().mockRejectedValue(new Error("Erro ao criar"));

    render(<TaskComposer onCreate={createMock} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /adicionar/i });

    await user.type(input, "Nova tarefa");
    await user.click(button);

    expect(await screen.findByText(/erro ao criar/i)).toBeInTheDocument();
  });
});