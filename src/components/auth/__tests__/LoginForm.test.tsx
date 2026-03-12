import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

const loginMock = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
    isLoading: false,
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza campos de e-mail, senha e botão", () => {
    render(<LoginForm />);

    expect(screen.getByRole("textbox", { name: /e-mail/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("chama login ao submeter formulário", async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    const email = screen.getByRole("textbox", { name: /e-mail/i });
    const password = screen.getByLabelText(/senha/i);
    const button = screen.getByRole("button", { name: /entrar/i });

    await user.clear(email);
    await user.type(email, "test@test.com");

    await user.clear(password);
    await user.type(password, "123456");

    await user.click(button);

    expect(loginMock).toHaveBeenCalledWith("test@test.com", "123456");
  });

  it("exibe erro quando login falha", async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue({
      ok: false,
      message: "Erro no login",
      errors: { email: "Email inválido" },
    });

    render(<LoginForm />);

    const button = screen.getByRole("button", { name: /entrar/i });

    await user.click(button);

    expect(await screen.findByText(/erro no login/i)).toBeInTheDocument();
  });
});