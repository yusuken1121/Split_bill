---
name: React Clean Architecture
description: Instructions and guidelines for developing React applications following Clean Architecture principles to ensure high testability.
---

# React Clean Architecture Guidelines

When developing features in React, you MUST follow Clean Architecture principles to separate concerns. This ensures components remain focused, business logic is centralized, and the entire application is inherently easy to test.

## Architectural Layers

### 1. Domain Layer (Entities & Rules)

- Defines the core data models (types/interfaces).
- Contains pure business logic functions that do not depend on React or external APIs.
- **Testing**: Highly testable pure functions. Provide inputs, assert outputs.

### 2. Infrastructure Layer (Repositories & API)

- Handles external communications (e.g., API calls, LocalStorage, third-party services).
- Abstracts away the data source. Components and hooks should not know _how_ data is fetched, only _that_ it is fetched.
- **Testing**: Can be easily mocked using test spies (like `jest.fn()` or `vi.fn()`) when testing higher layers.

### 3. Application Layer (Use Cases / Custom Hooks)

- Orchestrates business rules and data flow.
- Custom hooks (e.g., `useFeature.ts`) should manage state, handle loading/error states, and call infrastructure services.
- **Testing**: Test hooks in isolation using tools like `@testing-library/react` (via `renderHook`) or simply by mocking the repository dependencies.

### 4. Presentation Layer (UI Components)

- Pure or "dumb" components whenever possible.
- Responsible _only_ for rendering the UI and delegating user interactions to the Application layer (e.g., calling functions provided by custom hooks).
- No direct API calls should be present in UI components.
- **Testing**: Easily testable. Pass stubbed data and mock functions as props, then assert on the rendered UI.

## File Structure Example

A feature-based structure should look like this:

```
src/
└── features/
    └── user/
        ├── types.ts          # Domain Layer: Interfaces and types
        ├── api.ts            # Infrastructure Layer: API calls
        ├── useUser.ts        # Application Layer: Custom hook managing state & logic
        └── UserProfile.tsx   # Presentation Layer: Pure UI component
```

## Rules for Implementation

1. **No External Logic in Components:** Do not use `fetch` or library calls like `axios` directly inside `.tsx` component files. Move them to the infrastructure layer (`api.ts`).
2. **Extract Logic to Hooks:** If a component has more than passing states and basic conditional rendering, extract that logic into a custom hook.
3. **Dependency Injection (Optional but recommended):** When using custom hooks, consider allowing dependencies (like API services) to be injected as optional arguments. This makes the hook pure and significantly easier to test.
4. **Use Types:** Strictly type everything in the Domain Layer, and use those types throughout the respective layers.

## Example: Building for Testability

### Bad (Hard to test)

```tsx
export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // API details coupled to the component
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### Good (Easy to test)

**1. Infrastructure (`api.ts`)**

```typescript
export const fetchUser = async (userId: string) => {
  const res = await fetch(`/api/users/${userId}`);
  return res.json();
};
```

**2. Application Layer (`useUser.ts`)**

```typescript
import { useState, useEffect } from "react";
import { fetchUser } from "./api";

// api is injected for easy testing (Dependency Injection)
export function useUser(userId: string, api = fetchUser) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api(userId).then(setUser);
  }, [userId, api]);

  return { user };
}
```

**3. Presentation (`UserProfile.tsx`)**

```tsx
import { useUser } from "./useUser";

// Fully decoupled from the fetching logic
export function UserProfile({ userId }) {
  const { user } = useUser(userId);
  return <div>{user?.name}</div>;
}
```

## Checklist

- [ ] Are API calls extracted out of components and placed into an infrastructure file?
- [ ] Is complex state management moved to custom hooks?
- [ ] Are components primarily focused on UI rendering and accepting props?
- [ ] Are core business rules extracted as pure testable functions?
