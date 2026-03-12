import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

function TestConsumer() {
  const { user, login } = useAuth();

  return (
    <div>
      <span data-testid="user-email">{user?.email ?? "null"}</span>

      <button onClick={() => login("teste@email.com", "123456")}>
        Login
      </button>
    </div>
  );
}

describe("AuthContext", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Provider fornece valores para os filhos", () => {
    render(
      <AuthProvider initialUser={null}>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("null");
  });

  it("estado inicial usa initialUser", () => {
    render(
      <AuthProvider
        initialUser={{
          id: "1",
          name: "Usuário Teste",
          email: "user@test.com",
        }}
      >
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("user@test.com");
  });

  it("lança erro ao usar useAuth fora do Provider", () => {
    function InvalidConsumer() {
      useAuth();
      return <div>invalid</div>;
    }

    expect(() => render(<InvalidConsumer />)).toThrow(
    /useAuth deve ser usado dentro/
    );
  });

    it("atualiza user após login bem-sucedido", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
        user: {
            id: "1",
            name: "Teste",
            email: "teste@email.com",
        },
        }),
    }) as jest.Mock;

    render(
        <AuthProvider initialUser={null}>
        <TestConsumer />
        </AuthProvider>
    );

    await userEvent.click(
        screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
        expect(screen.getByTestId("user-email"))
        .toHaveTextContent("teste@email.com");
    });
    });

  it("não renderiza componente protegido sem Provider", () => {
    function ProtectedComponent() {
      const { user } = useAuth();
      return <div>{user?.email}</div>;
    }

    expect(() => render(<ProtectedComponent />)).toThrow(
    /useAuth deve ser usado dentro/
    );
  });

});