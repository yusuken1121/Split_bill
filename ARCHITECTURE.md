# Clean Architecture + TanStack Query

This document describes the client-to-server pipeline used by Split bill, adapted from `boilertemplate_ai`.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  src/app, src/features/**/*.tsx                             │
│  React Query hooks only — no fetch / no Server Actions       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Client API Layer (TanStack Query)               │
│  src/lib/api/queries/useChat.ts, useExpenses.ts             │
│  src/lib/api/chat.ts, expenses.ts, apiClient.ts             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Route Handler (Composition Root)                  │
│  src/app/api/chat/route.ts                                  │
│  src/app/api/expenses/**/route.ts                           │
│  Zod validation + dependency injection                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application / Domain                        │
│  src/core/use-cases/send-message.use-case.ts                │
│  src/lib/notion.ts, src/lib/calculations.ts                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                          │
│  src/infrastructure/gemini/gemini.gateway.ts                │
│  Notion SDK via src/lib/notion.ts                           │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── core/                           # Domain & Application Layer (Pure TypeScript)
│   ├── domain/
│   ├── ports/
│   └── use-cases/
│
├── infrastructure/                 # Concrete adapters (Gemini)
│   └── gemini/
│
├── lib/
│   ├── api/
│   │   ├── apiClient.ts            # Axios instance
│   │   ├── queryClient.ts
│   │   ├── chat.ts                 # Chat endpoint wrapper
│   │   ├── expenses.ts             # Expense endpoint wrappers
│   │   └── queries/
│   │       ├── useChat.ts
│   │       └── useExpenses.ts
│   ├── validators/                 # HTTP-boundary Zod schemas
│   ├── notion.ts                   # Notion reads/writes
│   └── calculations.ts
│
├── providers/
│   └── query-client-provider.tsx
│
└── app/
    ├── api/                        # Composition Root (Route Handlers)
    │   ├── chat/route.ts
    │   ├── expenses/
    │   └── fixed-costs/route.ts
    └── _components/
```

## Data Flow

### Chat (streaming)

1. UI calls `useSendMessageStream()`.
2. Hook calls `chatApi.sendMessageStream` (`fetch`, because Axios buffers the body).
3. `POST /api/chat` validates with Zod, injects `GeminiGateway` into `SendMessageUseCase`.
4. The Route Handler returns a `ReadableStream`; the UI reads chunks.

### Expenses

1. Pages render client components that call `useExpenses()`.
2. Mutations (`useCreateExpense`, `useUpdateExpense`, `useCheckoutExpense`, `useDeleteExpense`, `useSaveFixedCost`) hit the matching Route Handler.
3. On success the hooks invalidate `expenseKeys.all`, so Dashboard / Pending / Fixed costs stay in sync without `router.refresh()`.

## Key Principles

### 1. Dependency Inversion

- Chat use case depends on `IAIGateway`, not Gemini.
- UI depends on React Query hooks, not Route Handlers or Notion.

### 2. Composition Root

Infrastructure is instantiated only in `src/app/api/**/route.ts`.

```typescript
const aiGateway = createGeminiGateway();
const useCase = new SendMessageUseCase(aiGateway);
```

### 3. Do not use Server Actions

Client features go through HTTP Route Handlers so Axios + TanStack Query stay consistent.

## Configuration

```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
NOTION_API_KEY=your_notion_key
NOTION_SHOPPING_DATABASE_ID=your_database_id
```

Optional client API base URL (leave empty for same-origin):

```bash
NEXT_PUBLIC_API_URL=
```

## Adding a New Feature

Follow `.cursor/skills/react-query-api-pattern/SKILL.md`.
