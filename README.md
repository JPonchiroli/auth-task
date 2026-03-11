# AuthTask Manager

Aplicação base para o **TRABALHO 01 - Testes unitários com Jest + React Testing Library**.

Este repositório entrega a aplicação funcionando (autenticação + dashboard de tarefas + middleware + Firestore). Os **testes não estão implementados** — o objetivo é que os alunos sigam o **Guia Evolutivo** para construí-los passo a passo.

---

## Como começar

1. **Clone o repositório**
2. **Instale as dependências:** `npm install`
3. **Configure o ambiente:** `cp .env.example .env.local` e preencha as variáveis do Firebase
4. **Rode a aplicação:** `npm run dev`
5. **Acesse:** http://localhost:3000 — login: `aluno@authtask.dev` / senha: `123456`
6. **Siga o [GUIA_EVOLUTIVO.md](./GUIA_EVOLUTIVO.md)** para implementar os testes

---

## Arquitetura

A aplicação segue uma estrutura pensada para **testabilidade** e **separação de responsabilidades**.

```
src/
├── app/                    # Rotas e páginas (App Router)
│   ├── login/              # Página de login
│   ├── dashboard/         # Dashboard protegido
│   ├── api/                # API Routes
│   │   ├── login/          # POST /api/login
│   │   ├── logout/         # POST /api/logout
│   │   └── tasks/          # CRUD de tarefas
│   └── page.tsx            # Landing
├── components/             # Componentes React
│   ├── auth/               # LoginForm
│   ├── dashboard/          # DashboardClient, TaskList, TaskComposer, ServerTaskSummary
│   └── providers/          # AppProviders (AuthProvider)
├── context/                # AuthContext + useAuth
├── services/               # Lógica de negócio
│   ├── auth/               # Validação, autenticação, sessão
│   └── tasks/              # Serviço de tarefas + repositório Firestore
├── utils/                  # AppError, http-response
└── __tests__/              # Testes (a implementar)
```

### Separação de responsabilidades

| Camada | Responsabilidade | Testabilidade |
|--------|------------------|---------------|
| **Components** | UI, interação do usuário | Testes com RTL, mocks de context/hooks |
| **Context** | Estado global de autenticação | Testes isolados do Provider e do hook |
| **Services** | Regras de negócio, validação | Testes unitários puros, sem UI |
| **API Routes** | HTTP, orquestração | Testes chamando a função POST/GET diretamente |
| **Utils** | Erros, respostas HTTP | Testes unitários simples |

---

## Decisões técnicas

### Autenticação
- **Demo user:** credenciais fixas via variáveis de ambiente (adequado para ambiente didático)
- **Sessão:** cookie HTTP-only com token HMAC-SHA256, TTL de 8 horas
- **Middleware:** protege `/dashboard` e redireciona usuário não autenticado para `/login`

### Persistência
- **Firestore REST API:** tarefas em `users/{userId}/tasks`
- **Variáveis:** `FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY`

### Serviço de tarefas
- **Injeção de dependência:** `buildTaskService({ repository })` permite mockar o repositório nos testes
- **Validação centralizada:** `validateTaskTitle`, `assertIdentifier` no serviço

### Server Component
- **ServerTaskSummary:** busca resumo no servidor via `taskService.getSummary`
- Permite testar Server Components com mock do serviço

---

## Estratégia de testes

O [GUIA_EVOLUTIVO.md](./GUIA_EVOLUTIVO.md) descreve a estratégia em 12 etapas:

1. **Etapas 0–3:** Configuração + TDD (validação de login, auth, tarefas)
2. **Etapas 4–5:** Testes unitários e de componentes
3. **Etapas 6–7:** Mock avançado e Context API
4. **Etapas 8–9:** Server Component e API Route
5. **Etapas 10–11:** Cobertura e CI/CD
6. **Etapa 12:** Desafios bônus (fake timers, snapshot, MSW)

---

## Como rodar

### Aplicação
```bash
npm run dev
```

### Testes
```bash
npm run test           # Executa testes
npm run test:watch     # Modo watch
npm run test:coverage  # Com relatório de cobertura
```

---

## Variáveis de ambiente

Consulte `.env.example`. Principais:

| Variável | Uso |
|----------|-----|
| `AUTH_SESSION_SECRET` | Assinatura do token de sessão |
| `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD` | Credenciais de demonstração |
| `FIREBASE_PROJECT_ID` / `FIREBASE_WEB_API_KEY` | Firestore |

---

## Checklist de entrega (alunos)

- [ ] Link do repositório GitHub
- [ ] README com arquitetura, decisões e estratégia de testes
- [ ] Histórico de commits demonstrando TDD (3 funcionalidades)
- [ ] Cobertura mínima: 85% statements, 80% branches, 85% functions, 85% lines
- [ ] Pipeline CI funcionando
- [ ] Apresentação 5–10 min: estrutura, teste complexo, pipeline

---

## Licença

Uso didático.
