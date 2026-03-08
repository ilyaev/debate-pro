---
name: refactoring
description: General code refactoring and optimization skill for TypeScript, React, and Node.js projects.
version: 1.0.0
---

# Code Refactoring & Optimization Skill

This skill guides the AI to refactor and optimize code, ensuring improvements align with modern architecture, patterns, and quality standards for TypeScript-based stacks.

## 1. Analysis Framework

Before modifying any code, the AI MUST analyze the target file(s) using this framework:

-   **Responsibility Check:** Does this file/function do too much? (e.g., mixing data fetching, business logic, and UI rendering). Files with excessive responsibilities or too many mutable closure variables are "god objects" — split them.
-   **Dependency Check:** Are there circular dependencies or cross-boundary imports? Are there duplicate instantiations of core services or stores?
-   **Security Check:** Are inputs validated (e.g., using Zod)? Do string validations explicitly use `.trim()` and `.max(limit)` to prevent DoS attacks? Are objects `.strict()` to prevent prototype pollution or JSON bloat? Are outputs sanitized?
-   **Performance Check:** Are expensive operations cached? Are unrelated computations blocking the event loop? Watch for O(n²) patterns in data processing.
-   **Type Safety:** Are there `any` types or loose casts (`as string`) that can be made strict? Replace loose state variables with a typed state object.
-   **Regex Check:** Ensure regex patterns are correctly escaped for their context (constructor vs literal).

## 2. Standard Refactoring Patterns

### A. "God File" Decomposition

When a file mixes many concerns, apply this extraction order:

1.  **Constants first:** Extract magic numbers and static configurations to a `constants.ts` or `config.ts` file.
2.  **Pure functions next:** Extract stateless logic to its own utility module. These are easiest to test and reuse.
3.  **Stateful classes/logic:** Extract logic that manages internal state into classes or dedicated state handlers. Pass dependencies via constructor or factory functions.
4.  **Typed state object:** Replace loose variables with a typed `interface` + factory function. This makes state explicit and easier to debug.
5.  **Protocol/serialization layer:** Extract message parsing and serialization into a dedicated module if handling network traffic or complex data formats.
6.  **Edge/Integration module:** Extract external API connections or third-party integrations into a bridge module.
7.  **Feature-specific modules:** Extract complex feature logic into standalone modules.
8.  **Slim orchestrator:** The original file should become a thin orchestrator that wires modules together and handles lifecycle.

### B. Dependency Injection (DI)

Prefer **constructor injection** for classes and **parameter injection** for functions. Avoid importing singletons or global state directly into the middle of business logic modules.

- Useful for testing: allows mocking dependencies.
- Clearer contracts: all dependencies are visible at the entry point.

### C. API/Server Route Refactoring

When refactoring routes:

1.  **Dependency Injection:** Inject services or stores instead of importing them directly.
2.  **Validation:** Use schemas for all request data (query, params, body).
    *   **CRITICAL:** String validations must include `.trim()` and `.max(N)` to prevent memory exhaustion.
    *   **CRITICAL:** Object schemas should use `.strict()`.
3.  **Service Extraction:** Move complex business logic to a service layer.
4.  **Middleware:** Extract cross-cutting concerns (auth, logging) to middleware.
5.  **Error Handling:** Use standardized error formats and centralized error handlers.

### D. Client-Side Optimization (React)

When optimizing UI components:

1.  **Memoization:** Use `useMemo` for expensive calculations and `useCallback` for stable event handlers.
2.  **Splitting:** Break large components into smaller, single-purpose sub-components.
3.  **Hooks:** Extract logic into custom hooks to keep view components clean and focused.

## 3. Execution Workflow

To apply this skill:

1.  **Analyze & Plan:**
    *   Read the code and analyze it against the Analysis Framework (Section 1).
    *   Create a refactoring log (e.g., `docs/refactoring/[filename]_log.md`).
    *   Document findings, violations, and a step-by-step refactoring plan with a checklist.

2.  **Backup/Safety:** Ensure you have a way to roll back. Using git or creating a `-legacy` variant is recommended for significant manual refactors.

3.  **Refactor (Iterative):**
    *   Execute the next step(s) from the plan.
    *   Follow the extraction order (constants -> pure functions -> state -> etc.).
    *   Apply changes incrementally.

4.  **Update Log:**
    *   After completing a step, update the refactoring log.
    *   Mark completed items and note any deviations.

5.  **Verify:**
    *   Check for type errors (`tsc`).
    *   Ensure tests pass (if available).
    *   Verify the logic remains consistent with the original implementation.

## 4. Common Technical Pitfalls

| Bug Pattern | Example | Fix |
|-------------|---------|-----|
| Regex double-escaping | `[^\\w\\s]` in regex literal | Use `[^\w\s]` |
| Duplicate singletons | Multiple files instantiating the same store | Initialize once at entry point, inject elsewhere |
| Stale closure state | Accessing local variables after async gaps | Use a unified state object or refs |
| Unguarded network calls | Sending to closed connections/sockets | Always check connection state before sending |
| Missing input limits | Accepting unbound strings in API | Always use `.max()` and `.trim()` in validations |
