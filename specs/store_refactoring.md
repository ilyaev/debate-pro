# `server/store.ts` Refactoring Plan

## 1. Analysis

### Current State
`server/store.ts` is ~392 lines long and handles multiple responsibilities:
1. **Domain Types/Interfaces**: Defines `SessionData`, `SessionReport`, `UserProfile`, `InterviewPreset`, and the `SessionStore` contract.
2. **Local Development Storage**: Implements `FileStore` which reads/writes to `sessions.json`.
3. **Production Storage**: Implements `FirestoreStore` using Google Cloud Firestore.
4. **Factory/Orchestration**: Exports a `createStore()` factory function that decides which implementation to use based on `NODE_ENV`.

### Violations of Refactor-Optimize Skill
- **Responsibility Mix**: It mixes data models, interfaces, and two completely different database engine implementations in a single file.
- **Dependency Issues**: `FirestoreStore` dynamically imports `@google-cloud/firestore` inside the class, which is a workaround for mixing dev/prod dependencies in one file.

## 2. Refactoring Plan

We will extract the contents of `store.ts` into a new `server/store/` directory, while keeping `server/store.ts` as a strict barrel file to avoid breaking existing imports.

### Checklist

- [x] **Step 1: Backup `store.ts`**
  - Copy `store.ts` to `store-legacy.ts` for safety.
- [x] **Step 2: Create `server/store/types.ts`**
  - Extract all interfaces (`MetricSnapshot`, `SessionReport`, `SessionData`, `SessionSummary`, `UserProfile`, `InterviewPreset`, `SessionStore`).
- [x] **Step 3: Create `server/store/file-store.ts`**
  - Extract the `FileStore` class implementation.
- [x] **Step 4: Create `server/store/firestore-store.ts`**
  - Extract the `FirestoreStore` class implementation.
- [x] **Step 5: Convert `server/store.ts` to a factory and barrel file**
  - Update `store.ts` to solely export the types, the `FileStore`, the `FirestoreStore`, and the `createStore()` factory function.
- [x] **Step 6: Fix import paths**
  - Ensure the internal imports inside `server/store/` use `.js` extensions as per the skill requirements (e.g., `import { SessionStore } from './types.js'`).
- [x] **Step 7: Verify with `tsc`**
  - Run `npx tsc --noEmit` to confirm types and imports are all correct.

## 3. Results
- **Success:** The `server/store.ts` file has been successfully divided into `types.ts`, `file-store.ts`, and `firestore-store.ts`.
- **TypeScript:** `npx tsc --noEmit` passed with 0 errors. All imports remain functional due to the barrel file pattern.
