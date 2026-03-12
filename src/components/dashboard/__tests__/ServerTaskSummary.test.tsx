import { render, screen } from "@testing-library/react";
import { ServerTaskSummary } from "../ServerTaskSummary";
import { taskService } from "@/services/tasks/task.service";

jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    getSummary: jest.fn(),
  },
}));

describe("ServerTaskSummary", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza resumo quando getSummary retorna dados", async () => {

    (taskService.getSummary as jest.Mock).mockResolvedValue({
      total: 5,
      completed: 2,
      pending: 3,
    });

    const Component = await ServerTaskSummary({
      userId: "user1",
    });

    render(Component);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renderiza mensagem de indisponível quando getSummary falha", async () => {

    (taskService.getSummary as jest.Mock).mockRejectedValue(
      new Error("Falha")
    );

    const Component = await ServerTaskSummary({
      userId: "user1",
    });

    render(Component);

    expect(
      screen.getByText(/resumo indisponível/i)
    ).toBeInTheDocument();
  });

});