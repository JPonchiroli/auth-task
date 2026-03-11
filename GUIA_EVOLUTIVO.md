# Guia Evolutivo — Implementação de Testes no AuthTask Manager

Este guia conduz você, passo a passo, na implementação de todos os testes exigidos pelo trabalho. **Siga a ordem das etapas** — cada uma prepara a base para a próxima.

---

## Índice

1. [Etapa 0 — Preparar stack de testes](#etapa-0--preparar-stack-de-testes)
2. [Etapa 1 — TDD: Validação de login](#etapa-1--tdd-validação-de-login)
3. [Etapa 2 — TDD: Serviço de autenticação](#etapa-2--tdd-serviço-de-autenticação)
4. [Etapa 3 — TDD: Manipulação de tarefas](#etapa-3--tdd-manipulação-de-tarefas)
5. [Etapa 4 — Testes unitários completos](#etapa-4--testes-unitários-completos)
6. [Etapa 5 — Testes de componentes](#etapa-5--testes-de-componentes)
7. [Etapa 6 — Mock avançado](#etapa-6--mock-avançado)
8. [Etapa 7 — Teste de Context API](#etapa-7--teste-de-context-api)
9. [Etapa 8 — Teste de Server Component](#etapa-8--teste-de-server-component)
10. [Etapa 9 — Teste de API Route](#etapa-9--teste-de-api-route)
11. [Etapa 10 — Cobertura obrigatória](#etapa-10--cobertura-obrigatória)
12. [Etapa 11 — CI/CD com GitHub Actions](#etapa-11--cicd-com-github-actions)
13. [Etapa 12 — Desafios bônus](#etapa-12--desafios-bônus)

---

## Etapa 0 — Preparar stack de testes

### Objetivo
Instalar e configurar Jest + React Testing Library para Next.js, permitindo rodar testes desde o início.

### Ações

1. **Instalar dependências:**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @types/jest
```

> **Nota:** Este projeto já inclui essas dependências. Se você clonou o repositório, basta rodar `npm install`.

2. **Criar `jest.config.ts` na raiz do projeto:**

```typescript
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
};

export default createJestConfig(config);
```

3. **Criar `jest.setup.ts` na raiz:**

```typescript
import "@testing-library/jest-dom";
```

4. **Adicionar scripts no `package.json`:**

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

### Verificação
- [ ] `npm run test` executa sem erros (nenhum teste ainda)
- [ ] `npm run test:coverage` gera relatório

---

## Etapa 1 — TDD: Validação de login

### Objetivo
Implementar testes para `validateLoginPayload` e `hasValidationErrors` usando TDD.

### Fluxo de commits (obrigatório)

| Ordem | Mensagem | O que fazer |
|-------|----------|-------------|
| 1 | `test: create failing test for login validation` | Escrever testes que falham |
| 2 | `feat: implement login validation` | Implementação mínima para passar |
| 3 | `refactor: improve validation logic` | Refatorar se necessário |

### Onde testar
- Arquivo: `src/services/auth/__tests__/auth.service.validation.test.ts`
- Funções: `validateLoginPayload`, `hasValidationErrors`

### Cenários obrigatórios

| Cenário | Entrada | Saída esperada |
|---------|---------|----------------|
| E-mail vazio | `{ email: "", password: "123456" }` | `{ email: "E-mail é obrigatório." }` |
| E-mail inválido | `{ email: "invalido", password: "123456" }` | `{ email: "Formato de e-mail inválido." }` |
| Senha vazia | `{ email: "a@b.com", password: "" }` | `{ password: "Senha é obrigatória." }` |
| Senha curta | `{ email: "a@b.com", password: "12345" }` | `{ password: "Senha deve conter pelo menos 6 caracteres." }` |
| Sucesso | `{ email: "a@b.com", password: "123456" }` | `{}` |
| Trim | `{ email: "  a@b.com  ", password: "  123456  " }` | `{}` |
| hasValidationErrors | `{}` | `false` |
| hasValidationErrors | `{ email: "erro" }` | `true` |

### Exemplo de estrutura de teste

```typescript
import { hasValidationErrors, validateLoginPayload } from "@/services/auth/auth.service";

describe("validateLoginPayload", () => {
  it("retorna erro quando e-mail está vazio", () => {
    const result = validateLoginPayload({ email: "", password: "123456" });
    expect(result.email).toBe("E-mail é obrigatório.");
  });

  it("retorna erro quando formato de e-mail é inválido", () => {
    const result = validateLoginPayload({ email: "invalido", password: "123456" });
    expect(result.email).toBe("Formato de e-mail inválido.");
  });

  // ... demais cenários
});

describe("hasValidationErrors", () => {
  it("retorna false quando não há erros", () => {
    expect(hasValidationErrors({})).toBe(false);
  });

  it("retorna true quando há erros", () => {
    expect(hasValidationErrors({ email: "E-mail é obrigatório." })).toBe(true);
  });
});
```

---

## Etapa 2 — TDD: Serviço de autenticação

### Objetivo
Testar `authenticateUser` e `sanitizeUserId` usando TDD.

### Fluxo de commits

| Ordem | Mensagem |
|-------|----------|
| 1 | `test: create failing test for auth service` |
| 2 | `feat: implement auth service login rules` |
| 3 | `refactor: simplify auth errors` |

### Onde testar
- Arquivo: `src/services/auth/__tests__/auth.service.auth.test.ts`
- Funções: `authenticateUser`, `sanitizeUserId`

### Mock de variáveis de ambiente

```typescript
beforeEach(() => {
  process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
  process.env.AUTH_DEMO_PASSWORD = "123456";
  process.env.AUTH_DEMO_USER_ID = "aluno_demo";
  process.env.AUTH_DEMO_USER_NAME = "Aluno Demo";
});
```

### Cenários obrigatórios

| Cenário | Entrada | Comportamento |
|---------|---------|---------------|
| Credenciais corretas | `{ email: "aluno@authtask.dev", password: "123456" }` | Retorna `AuthUser` |
| Credenciais inválidas | `{ email: "errado@test.com", password: "123456" }` | Lança `AppError` com status 401 |
| Senha incorreta | `{ email: "aluno@authtask.dev", password: "errada" }` | Lança `AppError` com status 401 |
| sanitizeUserId | `"  User@123  "` | Retorna `"user_123"` (lowercase, caracteres especiais substituídos) |

### Exemplo

```typescript
import { authenticateUser, sanitizeUserId } from "@/services/auth/auth.service";
import { AppError } from "@/utils/app-error";

describe("authenticateUser", () => {
  it("retorna usuário quando credenciais são válidas", async () => {
    const user = await authenticateUser({
      email: "aluno@authtask.dev",
      password: "123456",
    });
    expect(user).toMatchObject({ email: "aluno@authtask.dev", name: "Aluno Demo" });
  });

  it("lança AppError 401 quando credenciais são inválidas", async () => {
    await expect(
      authenticateUser({ email: "errado@test.com", password: "123456" })
    ).rejects.toThrow(AppError);
    // Verificar status 401
  });
});

describe("sanitizeUserId", () => {
  it("normaliza e limpa o userId", () => {
    expect(sanitizeUserId("  User@123  ")).toBe("user_123");
  });
});
```

---

## Etapa 3 — TDD: Manipulação de tarefas

### Objetivo
Testar `validateTaskTitle` e `buildTaskService` usando TDD.

### Fluxo de commits

| Ordem | Mensagem |
|-------|----------|
| 1 | `test: create failing test for task title rules` |
| 2 | `feat: implement create task rules` |
| 3 | `refactor: extract validation helper` |

### Onde testar
- Arquivo: `src/services/tasks/__tests__/task.service.test.ts`
- Funções: `validateTaskTitle`, `buildTaskService`

### Usar repositório mockado

O `taskService` usa `buildTaskService({ repository })`. Crie um mock do repositório para isolar a lógica:

```typescript
import { buildTaskService, validateTaskTitle } from "@/services/tasks/task.service";

const mockRepository = {
  listByUser: jest.fn(),
  createForUser: jest.fn(),
  updateCompletion: jest.fn(),
  deleteForUser: jest.fn(),
};

const service = buildTaskService({ repository: mockRepository });
```

### Cenários obrigatórios

| Cenário | Entrada | Comportamento |
|---------|---------|---------------|
| Título vazio | `""` ou `"   "` | Lança `AppError` 400 |
| Título curto | `"ab"` | Lança `AppError` 400 |
| Título longo | `"a".repeat(121)` | Lança `AppError` 400 |
| Título válido | `"  Fazer exercícios  "` | Retorna `"Fazer exercícios"` (trimmed) |
| listTasks | userId válido | Chama `repository.listByUser` |
| createTask | userId + title válidos | Chama `repository.createForUser` |
| deleteTask | userId + taskId | Chama `repository.deleteForUser` |
| assertIdentifier vazio | userId `""` | Lança `AppError` 400 |

---

## Etapa 4 — Testes unitários completos

### Objetivo
Garantir cobertura de funções utilitárias, tratamento de erros e edge cases.

### Arquivos a testar

| Arquivo | O que testar |
|---------|--------------|
| `src/utils/app-error.ts` | `AppError` (code, status, message), `isAppError` |
| `src/utils/http-response.ts` | `toErrorResponse` com `AppError` e erro genérico, `badRequest` |
| `src/services/auth/auth.service.ts` | Edge cases restantes |
| `src/services/tasks/task.service.ts` | `getSummary`, edge cases |

### Cenários de `toErrorResponse`

- `AppError` com status 401 → resposta JSON com status 401
- Erro genérico (não AppError) → resposta 500 com `UNEXPECTED_ERROR`

### Cenários de `isAppError`

- `new AppError(...)` → `true`
- `new Error(...)` → `false`
- `null` → `false`

---

## Etapa 5 — Testes de componentes

### Objetivo
Testar componentes com `userEvent`, `getByRole`, `findBy`, `queryBy`.

### Componentes obrigatórios

| Componente | Arquivo de teste | O que testar |
|------------|------------------|--------------|
| LoginForm | `src/components/auth/__tests__/LoginForm.test.tsx` | Campos, submit, feedback de erro |
| DashboardClient | `src/components/dashboard/__tests__/DashboardClient.test.tsx` | Cabeçalho, botão Logout, loading, erro |
| TaskComposer | `src/components/dashboard/__tests__/TaskComposer.test.tsx` | Input, botão Adicionar, erro |
| TaskList | `src/components/dashboard/__tests__/TaskList.test.tsx` | Lista vazia, itens, checkbox, botão Deletar |

### Mock do AuthContext

```typescript
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Test", email: "test@test.com" },
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    setUser: jest.fn(),
  }),
}));
```

### Uso obrigatório de queries

- `getByRole("button", { name: /entrar/i })` — botões
- `getByRole("textbox", { name: /e-mail/i })` — inputs
- `findBy` — elementos assíncronos
- `queryBy` — elementos que podem não existir

### Exemplo LoginForm

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

// Mock useAuth
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({ ok: true }),
    isLoading: false,
    // ...
  }),
}));

it("exibe erro quando login falha", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  const submitButton = screen.getByRole("button", { name: /entrar/i });
  await user.click(submitButton);
  // Verificar feedback de erro (findBy ou getBy)
});
```

---

## Etapa 6 — Mock avançado

### Objetivo
Implementar `jest.spyOn`, `jest.mock` de módulo completo e mock condicional.

### Cenários obrigatórios

| Cenário | Técnica | O que simular |
|---------|---------|---------------|
| Erro 500 da API | `jest.spyOn(global, "fetch")` | Resposta com status 500 |
| Usuário inválido | Mock do `authenticateUser` | Retorno 401 |
| Timeout | `jest.spyOn` + `mockRejectedValue` | Promise que nunca resolve ou rejeita após delay |

### Exemplo: simular erro 500

```typescript
it("trata erro 500 da API de login", async () => {
  const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ message: "Erro interno" }),
  } as Response);

  // Testar componente ou serviço que chama fetch
  // ...

  fetchSpy.mockRestore();
});
```

### Exemplo: mock condicional

```typescript
jest.mock("@/services/auth/auth.service", () => ({
  authenticateUser: jest.fn()
    .mockResolvedValueOnce({ id: "1", name: "User", email: "u@u.com" })
    .mockRejectedValueOnce(new AppError("INVALID", "Inválido", 401)),
}));
```

### Exemplo: simular timeout

```typescript
it("trata timeout na requisição", async () => {
  jest.spyOn(global, "fetch").mockImplementation(
    () => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 100))
  );
  // Testar comportamento de timeout
});
```

---

## Etapa 7 — Teste de Context API

### Objetivo
Testar `AuthProvider`, `useAuth`, estado inicial, mudança após login e proteção.

### Onde testar
- Arquivo: `src/context/__tests__/AuthContext.test.tsx`

### Cenários obrigatórios

| Cenário | O que validar |
|---------|---------------|
| Provider | Filhos recebem valor do contexto |
| Estado inicial | `user` é `initialUser` |
| useAuth fora do Provider | Lança erro "useAuth deve ser usado dentro de AuthProvider" |
| Mudança após login | Mock de fetch, chamar `login`, verificar `user` atualizado |
| Proteção | Componente que usa `useAuth` não renderiza sem Provider |

### Mock do useRouter

```typescript
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));
```

### Exemplo

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

function TestConsumer() {
  const { user, login } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user?.email ?? "null"}</span>
      <button onClick={() => login("a@b.com", "123456")}>Login</button>
    </div>
  );
}

it("atualiza user após login bem-sucedido", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ user: { id: "1", name: "Test", email: "a@b.com" } }),
  });

  render(
    <AuthProvider initialUser={null}>
      <TestConsumer />
    </AuthProvider>
  );

  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  await waitFor(() => {
    expect(screen.getByTestId("user-email")).toHaveTextContent("a@b.com");
  });
});
```

---

## Etapa 8 — Teste de Server Component

### Objetivo
Testar `ServerTaskSummary` que busca dados no servidor.

### Onde testar
- Arquivo: `src/components/dashboard/__tests__/ServerTaskSummary.test.tsx`

### Estratégia
O `ServerTaskSummary` é um async Server Component. Mocke o `task.service` e renderize o componente resolvendo a Promise.

### Mock do task.service

```typescript
jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    getSummary: jest.fn(),
  },
}));

import { taskService } from "@/services/tasks/task.service";
```

### Cenários

| Cenário | Mock | Resultado esperado |
|---------|------|-------------------|
| Sucesso | `getSummary` retorna `{ total: 5, completed: 2, pending: 3 }` | Exibe Total 5, Concluídas 2, Pendentes 3 |
| Erro | `getSummary` rejeita | Exibe "Resumo indisponível" |

### Exemplo (React 19 + RTL)

```typescript
import { render, screen } from "@testing-library/react";
import { ServerTaskSummary } from "../ServerTaskSummary";
import { taskService } from "@/services/tasks/task.service";

jest.mock("@/services/tasks/task.service");

describe("ServerTaskSummary", () => {
  it("renderiza resumo quando getSummary retorna dados", async () => {
    (taskService.getSummary as jest.Mock).mockResolvedValue({
      total: 5,
      completed: 2,
      pending: 3,
    });

    const Component = await ServerTaskSummary({ userId: "user1" });
    render(Component);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renderiza mensagem de indisponível quando getSummary falha", async () => {
    (taskService.getSummary as jest.Mock).mockRejectedValue(new Error("Falha"));

    const Component = await ServerTaskSummary({ userId: "user1" });
    render(Component);

    expect(screen.getByText(/Resumo indisponível/i)).toBeInTheDocument();
  });
});
```

> **Nota:** O Next.js indica que Jest não suporta nativamente async Server Components. A abordagem aqui é **aguardar** a Promise retornada pelo componente (`await ServerTaskSummary(...)`) para obter o JSX já resolvido e então renderizá-lo. O mock de `taskService.getSummary` deve ser configurado **antes** da chamada ao componente.

---

## Etapa 9 — Teste de API Route

### Objetivo
Testar `POST /api/login` com 200, 401 e 400.

### Onde testar
- Arquivo: `src/app/api/login/__tests__/route.test.ts`

### Estratégia
Chamar a função `POST` exportada da rota, passando um `Request` simulado.

### Cenários obrigatórios

| Cenário | Body | Status esperado |
|---------|------|-----------------|
| Sucesso | `{ email: "aluno@authtask.dev", password: "123456" }` | 200 |
| Dados incompletos | `{ email: "" }` ou `{}` | 400 |
| Credenciais inválidas | `{ email: "x@x.com", password: "wrong" }` | 401 |

### Exemplo

```typescript
import { POST } from "../route";

function createRequest(body: object): Request {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/login", () => {
  beforeEach(() => {
    process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
    process.env.AUTH_DEMO_PASSWORD = "123456";
    process.env.AUTH_SESSION_SECRET = "test-secret";
  });

  it("retorna 200 com credenciais válidas", async () => {
    const response = await POST(createRequest({
      email: "aluno@authtask.dev",
      password: "123456",
    }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.user).toBeDefined();
  });

  it("retorna 400 quando dados incompletos", async () => {
    const response = await POST(createRequest({ email: "" }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.errors).toBeDefined();
  });

  it("retorna 401 quando credenciais inválidas", async () => {
    const response = await POST(createRequest({
      email: "wrong@test.com",
      password: "wrong",
    }));
    expect(response.status).toBe(401);
  });
});
```

---

## Etapa 10 — Cobertura obrigatória

### Objetivo
Configurar thresholds no Jest e atingir os mínimos.

### Configuração no `jest.config.ts`

```typescript
const config: Config = {
  // ... existente
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
};
```

### Verificação

```bash
npm run test:coverage
```

- [ ] Statements ≥ 85%
- [ ] Branches ≥ 80%
- [ ] Functions ≥ 85%
- [ ] Lines ≥ 85%

Se algum threshold não for atingido, identifique arquivos com baixa cobertura e adicione testes.

---

## Etapa 11 — CI/CD com GitHub Actions

### Objetivo
Criar pipeline que instala dependências, roda testes e falha se cobertura < 80%.

### Criar `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage report (opcional)
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
```

### Validação de cobertura no pipeline

Para falhar se cobertura < 80%, o Jest já faz isso com `coverageThreshold`. Se quiser um threshold diferente no CI (ex.: 80% global), ajuste no `jest.config.ts` ou use uma action como `codecov/codecov-action`.

### Verificação
- [ ] Push para `main` dispara o workflow
- [ ] Log do job mostra relatório de cobertura
- [ ] Build falha quando testes falham

---

## Etapa 12 — Desafios bônus

### 1. Teste de expiração de token com fake timers

```typescript
jest.useFakeTimers();
// Avançar tempo além do TTL
jest.advanceTimersByTime(9 * 60 * 60 * 1000); // 9 horas
// Verificar que verifySessionToken retorna null
jest.useRealTimers();
```

### 2. Snapshot test justificado

Use snapshot apenas onde a UI é estável e mudanças devem ser revisadas (ex.: mensagem de erro padrão). Documente no comentário por que o snapshot é útil.

### 3. Teste simulando múltiplos usuários

Criar cenário onde dois usuários têm listas de tarefas diferentes; mockar `fetch` ou repositório para retornar dados distintos por userId.

### 4. MSW (Mock Service Worker)

Instalar `msw` e configurar handlers para `/api/login`, `/api/tasks`. Usar em testes de componentes que fazem fetch, em vez de `jest.spyOn(global, "fetch")`.

---

## Checklist final de entrega

- [ ] Link do repositório GitHub
- [ ] README com explicação arquitetural, decisões técnicas, estratégia de testes
- [ ] Evidências de TDD via histórico de commits (3 funcionalidades)
- [ ] Cobertura mínima atingida (85/80/85/85)
- [ ] Pipeline CI funcionando
- [ ] Apresentação 5–10 min: estrutura, teste complexo, pipeline

---

## Dicas gerais

1. **Sempre rode `npm run test`** após cada alteração.
2. **Commits pequenos e descritivos** — facilita correção e demonstra TDD.
3. **Isole dependências** — use mocks para `fetch`, `cookies`, `useRouter`.
4. **Teste comportamento, não implementação** — prefira queries por papel e texto.
5. **Edge cases** — strings vazias, null, undefined, strings muito longas.

Bom trabalho!
