---
name: react-query-api-pattern
description: >-
  Standard client-to-server pattern: React Query hook → lib/api wrapper →
  Route Handler → Use Case / infrastructure. Use when wiring UI to backend
  or adding a new API endpoint.
---

# React Query + API Route Pattern

Every client feature follows this pipeline (from `boilertemplate_ai`):

```
UI Component
  → useMutation / useQuery hook     [src/lib/api/queries/]
  → endpoint wrapper                [src/lib/api/<feature>.ts]
  → Route Handler                   [src/app/api/<feature>/route.ts]
  → Use Case or domain helper       [src/core/use-cases/ or src/lib/]
  → Infrastructure adapter          [src/infrastructure/ or src/lib/notion.ts]
```

Do **not** use Server Actions. Do **not** call Use Cases or Infrastructure from components.

## Step-by-Step: Add a New Endpoint

### 1. Route Handler (Composition Root)

`src/app/api/<feature>/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/route-error";

const InputSchema = z.object({
  /* fields */
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = InputSchema.parse(body);
    const result = await doWork(validated);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error, "/api/<feature> Route Handler");
  }
}
```

### 2. API wrapper

`src/lib/api/<feature>.ts`

```typescript
import { apiClient } from "./apiClient";

export const someApi = {
  create: async (data: SomeInput) => apiClient.post("/api/<feature>", data),
};
```

For streaming responses, use `fetch` directly (Axios buffers the full body):

```typescript
sendStream: async (data: SomeInput): Promise<Response> => {
  const baseUrl = apiClient.defaults.baseURL ?? "";
  return fetch(`${baseUrl}/api/<feature>`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, stream: true }),
  });
};
```

### 3. React Query hook

`src/lib/api/queries/useSome.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { someApi } from "../some";

export const useCreateSome = () => useMutation({ mutationFn: someApi.create });
```

### 4. UI component

```tsx
"use client";

import { useCreateSome } from "@/lib/api/queries/useSome";

export function SomeForm() {
  const { mutate, isPending } = useCreateSome();
  // ...
}
```

## Existing Examples

| Feature          | Hook                  | Route                          | UI                  |
| :--------------- | :-------------------- | :----------------------------- | :------------------ |
| Chat (stream)    | `useSendMessageStream` | `/api/chat`                   | `ChatInterface`     |
| Expenses list    | `useExpenses`          | `GET /api/expenses`           | Dashboard / ToDo    |
| Expense create   | `useCreateExpense`     | `POST /api/expenses`          | `ShoppingForm`      |
| Expense update   | `useUpdateExpense`     | `PATCH /api/expenses/[id]`    | `ExpenseRowActions` |
| Expense checkout | `useCheckoutExpense`   | `POST /api/expenses/[id]/checkout` | `ToDoList`     |
| Expense delete   | `useDeleteExpense`     | `DELETE /api/expenses/[id]`   | `ExpenseRowActions` |
| Fixed cost save  | `useSaveFixedCost`     | `POST /api/fixed-costs`       | `FixedCostsForm`    |
