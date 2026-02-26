---
name: update-docs
description: Analyzes code changes from the current session and updates relevant documentation and specification files to ensure they stay synchronized with the codebase.
version: 1.0.0
---

# Update Documentation & Specs

## Purpose
This skill is designed to be run at the end of a coding session. Its goal is to prevent documentation drift by ensuring that `specs/*.md` and `docs/*.md` files accurately reflect the current state of the code.

## Workflow

1.  **Analyze Changes**:
    *   Review the code changes made during the session. If context is lost, use `get_changed_files` or `git status` to identify modified files.
    *   Identify logical groups of changes (e.g., "Refactored API", "Added new component", "Changed WebSocket protocol").

2.  **Identify Affected Docs**:
    *   Map the changed code to relevant documentation files.
    *   *Example*: Changes to `server/ws-handler.ts` likely affect `specs/voice_agent_websockets.md`.
    *   *Example*: Changes to `client/src/components/Report.tsx` likely affect `specs/reports.md`.
    *   *Example*: Database schema changes affect `specs/architecture.md`.

3.  **Update Strategy**:
    *   **Architecture & Logic**: If the *behavior* or *structure* changed, update the corresponding `specs/` file. Code is the source of truth; specs describe the intent and design.
    *   **New Features**: If a new feature was added, check `specs/implementation_plan.md` and mark it as completed or update the details.
    *   **Todo List**: Update `specs/todo.md`. Mark any completed items with `[x]`. If a task was completed during the session but wasn't on the list, add it to the appropriate section and mark it as done immediately.
    *   **Deprecated Features**: If code was removed, remove or mark as deprecated in the docs.
    *   **APIs**: Update endpoint descriptions if request/response shapes changed.

4.  **Verification**:
    *   Ensure that the updated documentation doesn't contradict other parts of the system.
    *   Keep the documentation concise but accurate. Avoid pasting large blocks of code; instead, describe the interface and behavior.

## Common Targets
- `specs/implementation_plan.md`: Always check this to update progress.
- `specs/architecture.md`: For structural changes or new services.
- `specs/voice_agent_websockets.md`: For any changes to real-time communication.
- `specs/api_*.md`: For REST API changes.
