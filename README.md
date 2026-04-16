# Next.js Clean Architecture Boilerplate (AI-Native)

This project is optimized for Vibe Coding with AI editors (like Cursor).
It implements a **Clean Architecture** pattern using Next.js App Router, Server Actions, and the Google Generative AI SDK.

## 🗺 Context Map for AI

**CRITICAL**: Understanding this map is required for correct code generation. The architecture strictly separates concerns.

| Layer              | Path                 | Responsibility                                                | Dependencies               |
| :----------------- | :------------------- | :------------------------------------------------------------ | :------------------------- |
| **Domain**         | `src/core/domain`    | Enterprise business rules & Entities. Pure data structures.   | **None** (Pure TypeScript) |
| **Use Case**       | `src/core/use-cases` | Application specific business logic. Orchestrates flow.       | Domain, Ports              |
| **Ports**          | `src/core/ports`     | Interfaces (contracts) that abstract infrastructure.          | Domain                     |
| **Infrastructure** | `src/infrastructure` | Concrete implementations of Ports (e.g., Gemini SDK).         | Ports, External SDKs       |
| **Controller**     | `src/app/_actions`   | Server Actions entry points. Adapts UI requests to Use Cases. | Use Cases, Infra (for DI)  |
| **UI**             | `src/app`            | React Components, Pages, Layouts.                             | Server Actions, UI Libs    |

## 📂 Project Structure

````text
src/
├── app/                        # [UI Layer] Next.js App Router
│   ├── (routes)/               # Pages
│   ├── _components/            # shadcn/ui components
│   └── _actions/               # Server Actions (Controllers) & Composition Root
│
├── core/                       # [Domain & Application Layer] NO External Libs
│   ├── domain/                 # Entities (e.g., Message, ChatSession)
│   ├── use-cases/              # Business Logic (e.g., SendMessageUseCase)
│   └── ports/                  # Interfaces (e.g., IAIGateway)
│
├── infrastructure/             # [Infrastructure Layer]
│   ├── gemini/                 # Google AI SDK Implementation
│   │   ├── prompts.ts          # System prompts for AI models
│   │   └── GeminiAdapter.ts    # Concrete implementation of IFlowchartGenerator
│   └── di/                     # Dependency Injection containers (if needed)
│
└── lib/                        # Shared Utilities

## ⚙️ Configuration

### Sidebar Management

The application sidebar is dynamically generated from configuration files. To modify the sidebar:

1.  **Define Route Path**: Add your new route constant in `src/constants/path.ts`.
    ```typescript
    export const PATH = {
      // ...
      NEW_FEATURE: "/new-feature",
    } as const;
    ```

2.  **Define Menu Config**: Register the item in `src/constants/menuKeys.tsx`.
    - Add a new key to `MENU_KEYS`.
    - Add the configuration (label, icon, path) to `SIDEBAR_CONFIG`.
    ```typescript
    export const SIDEBAR_CONFIG = {
      // ...
      [MENU_KEYS.NEW_FEATURE]: {
        label: "New Feature",
        path: PATH.NEW_FEATURE,
        icon: <YourIcon />,
      },
    };
    ```

3.  **Add to Section**: Add the `MENU_KEYS` constant to the appropriate array (`mainSidebar`, `manageSidebar`, `adminSidebar`) in `src/constants/menuKeys.tsx`.

````

## 🛠 Tech Stack

- Framework: Next.js 14+ (App Router)
- Language: TypeScript (Strict Mode)
- AI Integration: Google Generative AI SDK (Gemini)
- UI System: shadcn/ui + Tailwind CSS
- Deployment: Vercel (Serverless / Edge)

## 🚀 Getting Started

1. Environment Setup Copy .env.example to .env.local:

```bash
GEMINI_API_KEY=your_api_key_here
```

2. Installation

```bash
npm install
```

3. Development

```bash
npm run dev
```

## ⚠️ Architectural Rules (Strict)

1. Dependency Rule: Source code dependencies must only point inward (towards Domain). `core` must never import from `infrastructure` or `app`.

2. Dependency Injection:

- Concrete implementations (like `GeminiGateway` or `GeminiAdapter`) are injected into Use Cases inside `src/app/_actions` or a dedicated DI container.

- Use Cases must only depend on Interfaces (`ports`), never on concrete classes.

3. No SDKs in Core: The `core` folder must remain framework-agnostic. No `next/*` or `google-generative-ai` imports allowed here.

