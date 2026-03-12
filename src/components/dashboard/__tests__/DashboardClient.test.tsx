import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardClient } from "../DashboardClient";

const logoutMock = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Test", email: "test@test.com" },
    logout: logoutMock,
  }),
}));

global.fetch = jest.fn();

describe("DashboardClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza cabeçalho com usuário", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [] }),
    });

    render(<DashboardClient />);

    expect(screen.getByText(/painel de tarefas/i)).toBeInTheDocument();
    expect(screen.getByText(/test@test.com/i)).toBeInTheDocument();
  });

  it("mostra loading inicialmente", () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<DashboardClient />);

    expect(screen.getByText(/carregando tarefas/i)).toBeInTheDocument();
  });

  it("mostra erro quando fetch falha", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Erro ao carregar tarefas." }),
    });

    render(<DashboardClient />);

    expect(await screen.findByText(/erro ao carregar tarefas/i)).toBeInTheDocument();
  });

  it("executa logout ao clicar botão", async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [] }),
    });

    render(<DashboardClient />);

    const button = screen.getByRole("button", { name: /logout/i });

    await user.click(button);

    expect(logoutMock).toHaveBeenCalled();
  });
});