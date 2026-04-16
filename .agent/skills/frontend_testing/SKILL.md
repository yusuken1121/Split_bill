---
name: Frontend Unit Testing
description: Instructions for writing frontend unit tests following the AAA (Arrange, Act, Assert) pattern.
---

# Frontend Unit Testing Guidelines

When writing unit tests for the frontend, you MUST follow the AAA (Arrange, Act, Assert) pattern. This ensures that tests are well-structured, easy to read, and maintainable.

You MUST include a comment for each phase (`// Arrange`, `// Act`, `// Assert`) in every test case.

## Phase Definitions

1. **Arrange**: Set up the initial state. This includes preparing mock data, configuring dependencies, and rendering the component or setting the environment.
2. **Act**: Execute the specific action, function, or user interaction that you are testing (e.g., clicking a button, triggering an event, or calling a hook).
3. **Assert**: Verify that the expected outcome occurred (e.g., checking if the correct element is in the document, or verifying if a mocked function was called with specific arguments).

## Rules

- Every `test` or `it` block MUST contain exactly one `// Arrange`, one `// Act`, and one `// Assert` comment.
- No code should appear before `// Arrange` inside the test block.
- Only the action being tested should fall under the `// Act` section.
- Only expectations (`expect(...)`) and assertion checks should fall under the `// Assert` section.

## Example Structure

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("should display the updated value when the button is clicked", () => {
    // Arrange
    const initialData = { name: "Test User" };
    render(<MyComponent data={initialData} />);
    const button = screen.getByRole("button", { name: /update/i });

    // Act
    fireEvent.click(button);

    // Assert
    expect(screen.getByText(/updated test user/i)).toBeInTheDocument();
  });
});
```

## Checklist before creating/completing a test file

- [ ] Are the `// Arrange`, `// Act`, and `// Assert` comments explicitly written in every test case?
- [ ] Is the separation of concerns clear between the three phases?
- [ ] Have all unnecessary state changes been kept out of the `Act` phase?
