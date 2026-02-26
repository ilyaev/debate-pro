---
name: refactor-optimize
description: Refactor and optimize Glotti (gemili) source code according to architecture standards (DI, Services, Validation).
version: 2.0.0
author: gemili-team
---

# Code Refactoring & Optimization Skill

This skill guides the AI to refactor and optimize code within the Glotti (gemili) project, ensuring improvements align with established architecture, patterns, and quality standards.

## 1. Analysis Framework

Before modifying any code, the AI MUST analyze the target file(s) using this framework:

-   **Responsibility Check:** Does this file/function do too much? (e.g., mixing data fetching, business logic, and UI rendering). Files with 9+ responsibilities or 14+ mutable closure variables are "god objects" — split them.
-   **Dependency Check:** Are there circular dependencies or cross-boundary imports? Are there duplicate instantiations (e.g., two `createStore()` calls in different files)?
-   **Security Check:** Are inputs validated (Zod)? Are outputs sanitized (HTML escaping)? Are error traces leaked? Are debug hooks (monkey-patches, prototype overrides) guarded by `config.isDev` or removed?
-   **Performance Check:** Are expensive operations cached? Are unrelated computations blocking the event loop? Watch for O(n²) patterns (e.g., recomputing metrics from full transcript history on every update).
-   **Type Safety:** Are there `any` types or loose casts (`as string`) that can be strict? Replace loose `let` closure variables with a typed state object.
-   **Regex Check:** Are regex patterns in `RegExp` constructors or string form double-escaped? e.g., `[^\\w\\s]` in a regex literal is wrong — use `[^\w\s]`.

## 2. Standard Refactoring Patterns for Glotti

### A. Server-Side "God File" Decomposition (`server/*.ts`)

When a server file mixes many concerns (e.g., `ws-handler.ts` was ~320 LOC with 9 responsibilities), apply this extraction order:

1.  **Constants first:** Extract magic numbers and static arrays to a `constants.ts` file. This is zero-risk.
2.  **Pure functions next:** Extract stateless logic (e.g., `extractMetrics()`) to its own module. These are easiest to test.
3.  **Stateful classes:** Extract logic that manages internal state into classes (e.g., `TranscriptBuffer`, `ToneAnalyzer`). Pass dependencies via constructor.
4.  **Typed state object:** Replace loose closure `let` variables with a typed `interface` + factory function (e.g., `SessionState` + `createSessionState()`). This makes state explicit and debuggable.
5.  **Protocol/serialization layer:** Extract message parsing and serialization into a `protocol.ts`. Keep it stateless — pass `ws` and payload as params.
6.  **Bridge/connection module:** Extract external API connections (e.g., Gemini Live) into a bridge module with a factory function (e.g., `connectGemini()` returns `{ session, close() }`).
7.  **Feature-specific modules:** Extract mode-specific logic (e.g., `feedback-context.ts`) into standalone async functions.
8.  **Slim orchestrator:** The original file becomes a thin orchestrator (~100-120 LOC) that wires modules together and handles lifecycle.

**Reference implementation:** `server/session/` directory (extracted from `ws-handler.ts`). See `specs/voice_agent_websockets.md` for full documentation.

### B. Server-Side Dependency Injection

Glotti uses **module-level DI with `setDependencies()`** — not constructor injection on the orchestrator:

```typescript
// In the orchestrator (ws-handler.ts):
export interface SessionDependencies { genai: GoogleGenAI; store: SessionStore; }
const deps: SessionDependencies = createDependencies();
export function setDependencies(overrides: Partial<SessionDependencies>): void { ... }

// In main.ts (wiring):
import { setDependencies } from './ws-handler.js';
setDependencies({ store });
```

For extracted modules, prefer **function-parameter DI** (pure functions receive all inputs) or **constructor DI** (classes receive dependencies in constructor). The factory `createSessionState()` composes internal dependencies (creates `TranscriptBuffer`, `ToneAnalyzer` instances).

### C. Server-Side Route Refactoring (`server/api/*.ts`)

When refactoring API routes, apply these patterns:

1.  **Dependency Injection:** Do not import `store` directly. Create a factory function:
    ```typescript
    export function createRouter(store: SessionStore): Router { ... }
    ```
2.  **Validation:** Use `zod` schemas for all `req.query`, `req.params`, and `req.body`.
3.  **Service Extraction:** Move complex logic (e.g., image generation, PDF rendering) to `server/services/`.
4.  **Middleware:** Extract auth and guard logic to `server/middleware/`.
5.  **Error Handling:** Catch all errors and return standardized JSON: `{ error: string }`.

### D. Client-Side Component Optimization (`client/src/**/*.tsx`)

When optimizing React components:

1.  **Memoization:** Use `useMemo` for expensive calculations (derived metrics) and `useCallback` for event handlers passed to children.
2.  **Splitting:** Break large components (>200 lines) into smaller, single-purpose sub-components.
3.  **Hooks:** Extract logic into custom hooks (`useSessionLogic`, `useAudioAnalysis`) to keep views clean.

### E. Shared Utilities

1.  **Deduplication:** If logic appears in 2+ places (e.g., share key generation), move it to `utils/` or `shared/`.
2.  **Environment Agnostic:** Utilities that run in both environments (client/server) must not import Node-specific (`fs`, `crypto`) or Browser-specific (`window`, `navigator`) APIs without polyfills or checks.

## 3. Execution Workflow

To apply this skill:

1.  **Initialize Workflow:**
    *   **Check for Existing Plan:** Check if a refactoring log exists at `specs/[source_file_name]_refactoring.md` (e.g., `specs/ws_handler_refactoring.md`).
    *   **If Plan Exists (Incremental Mode):**
        *   Read the file to understand the context and current status.
        *   **Condition A (Ongoing):** If unchecked items remain, resume refactoring from the next pending item.
        *   **Condition B (New Changes):** If all items are checked but the file has been modified since or new issues are found:
            *   Re-analyze the current file against the Analysis Framework (Section 1).
            *   Append a new section (e.g., `## [Date] Additional Refactoring`) to the existing log.
            *   Add new checklist items for the new findings.
    *   **If No Plan Exists (Start New):**
        *   Read the code and analyze it against the Analysis Framework (Section 1).
        *   Create `specs/[source_file_name]_refactoring.md`.
        *   Document findings, violations, and a step-by-step refactoring plan with a checklist.

2.  **Backup (If New):** If starting fresh, copy the original file to a `-legacy.ts` variant (e.g., `ws-handler-legacy.ts`) to allow safe rollback.

3.  **Refactor (Iterative):**
    *   Execute the next step(s) from the plan.
    *   Follow the extraction order in Section 2A (constants -> pure functions -> state -> etc.).
    *   Apply changes incrementally.

4.  **Update Log:**
    *   After completing a step, **immediately** update `specs/[source_file_name]_refactoring.md`.
    *   Mark completed items with `[x]`.
    *   Add notes about any deviations or new discoveries.

5.  **Verify Iteratively:** After each extraction, verify `npx tsc --noEmit` passes to ensure incremental correctness.

6.  **Final Verification:** Run `npx tsc --noEmit` for a clean build. All imports must use `.js` extensions (ESNext modules).

7.  **Document:** Update relevant `specs/*.md` files to reflect the new file structure and patterns.

## 4. Specific Considerations for Glotti

-   **Session Store:** Always interface with `SessionStore` abstractly; never assume `FileStore` or `Firestore` implementation details in business logic. The store is a **shared singleton** created in `main.ts` and injected via `setDependencies()`. Never call `createStore()` from multiple files.
-   **Gemini Streaming:** Audio handling is real-time; avoid blocking the event loop in `ws-handler`. Fire-and-forget patterns (e.g., `ToneAnalyzer.tryAnalyze()` returning `Promise | null`) are acceptable for background LLM calls — but always guard against acting on results after session closure.
-   **OG Images:** Rendering is expensive; always use the LRU cache strategy defined in `server/services/og-renderer.ts`.
-   **TypeScript Config:** ES2022 target, ESNext modules, bundler moduleResolution. All server imports use `.js` extensions. The `tsconfig.json` `include` covers `server/**/*.ts`, so new subdirectories (like `server/session/`) are automatically included.
-   **Module Organization:** Group related session modules under `server/session/`. Each module should have a single concern and clear exports (see Section 2A for the pattern).

## 5. Common Bugs to Watch For

These bugs were found during prior refactoring and should be checked in future audits:

| Bug Pattern | Example | Fix |
|-------------|---------|-----|
| Regex double-escaping | `[^\\w\\s]` in regex literal | Use `[^\w\s]` — string escaping adds extra backslash |
| Duplicate singletons | Two files both calling `createStore()` | Single instantiation in `main.ts`, inject elsewhere |
| Debug code in production | `globalThis.WebSocket.prototype.send` monkey-patch | Remove entirely or guard with `if (config.isDev)` |
| Stale closure state | Checking `sessionClosed` boolean after async gap | Use typed state object with `status` field, check before acting |
| Unguarded WebSocket sends | Sending to closed WebSocket throws | Always check `ws.readyState === WebSocket.OPEN` via `isWsOpen()` helper |
