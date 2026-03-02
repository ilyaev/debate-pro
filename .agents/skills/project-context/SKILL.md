---
name: project-context
description: Loads the project context, architecture, and documentation for the Gemili project. Use this at the start of a session or when you need to understand the project structure.
version: 1.0.0
---

# Gemili Project Context

## Purpose
This skill provides a comprehensive overview of the Gemili project, including its architecture, key documentation, and coding standards. Use this when starting a new task to ground yourself in the project's reality.

## Source of Truth
1. **Source Code**: The ultimate authority. If code and docs conflict, trust the code but note the discrepancy.
2. **Specs (`specs/*.md`)**: Detailed technical specifications and architecture decisions.
3. **Docs (`docs/*.md`)**: High-level requirements, ideas, and product context.

## Key Documentation Map

### Architecture & Core Concepts
- [specs/overview.md](specs/overview.md): High-level project summary and goals.
- [specs/architecture.md](specs/architecture.md): System architecture, data flow, and technology choices.
- [specs/voice_agent_websockets.md](specs/voice_agent_websockets.md): WebSocket protocol for voice agent communication (Core Feature).
- [docs/realtime_metrics.md](docs/realtime_metrics.md): Definitions of analytics and metrics collected.

### Features & Implementation
- [specs/implementation_plan.md](specs/implementation_plan.md): Current roadmap and implementation status.
- [specs/reports.md](specs/reports.md): Structure and logic for generation of reports.
- [specs/session_feedback.md](specs/session_feedback.md): Feedback mechanisms.
- [specs/social_sharing.md](specs/social_sharing.md): Social chart preview and sharing flows.

### Persona & User Experience
- [specs/persona.md](specs/persona.md): User personas and voice guidelines.

## Project Structure

### `/server` (Node.js + Express + TypeScript)
- **Entry**: `main.ts`
- **Core**: `store.ts` (Factory/Barrel), `ws-handler.ts` (WebSockets).
- **Data Storage**: `store/` contains the modular store implementations:
    - `types.ts`: Shared interfaces and domain models.
    - `file-store.ts`: Local JSON persistence for development.
    - `firestore-store.ts`: Production Firestore implementation.
- **Agents**: `agents/` contains logic for specific AI personas (Coaching, Analytics).
- **API**: `api/` REST endpoints.

### `/client` (React + Vite + TypeScript)
- **Entry**: `src/main.tsx`
- **Components**: `src/components/`
- **Hooks**: `src/hooks/` for shared logic (`useAudio`, `useWebSocket`).

## Instructions for Agents
1. **Explore First**: Before writing code, read the relevant specs for the feature you are working on.
2. **Read `specs/implementation_plan.md`**: Check if the feature is already planned or partially implemented.
3. **Check `specs/architecture.md`**: Ensure your changes fit the established patterns (e.g., Service Layer, Dependency Injection).
4. **Update Docs**: If you change behavior, update the corresponding markdown file in `specs/`.
