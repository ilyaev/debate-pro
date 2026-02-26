# Session.tsx Refactoring Plan

## Analysis

### Current State
- **LOC:** ~230
- **Responsibilities:** 10+ (god component)
- **Location:** `client/src/components/Session.tsx`

### Violations Found

| # | Issue | Category |
|---|-------|----------|
| 1 | 10+ responsibilities: WS lifecycle, audio orchestration, message dispatch, timer mgmt, status state machine, metrics state, transcript state + auto-scroll, mode config, badge rendering, loading UI, active UI, end handler, formatTime utility | Responsibility |
| 2 | `JSON.parse` on WS messages returns `any` — no typed message discriminated union | Type Safety |
| 3 | Mode labels/icons duplicated between Session.tsx and SessionsList.tsx; recreated on every render | Duplication / Performance |
| 4 | `modeLabels` object with JSX recreated every render (not memoized) | Performance |
| 5 | `handleEnd` used in time-limit effect but not in dependency array (stale closure risk) | Stale Closure |
| 6 | `formatTime` is a local utility that could be shared | Deduplication |
| 7 | Sub-components (ending overlay, topbar, transcript feed, status) all inlined | Splitting |

### Refactoring Steps

#### Step 1: Extract WS Message Types (`client/src/types.ts`)
Add a discriminated union `ServerMessage` to type all incoming WebSocket messages. Eliminates `any` from the message handler.

#### Step 2: Extract Mode Config (`client/src/config.ts`)
Move mode labels, icons, and icon URLs to `MODE_CONFIG` in config.ts. This deduplicates with SessionsList.tsx and avoids per-render object creation.

#### Step 3: Extract `useSessionLogic` Hook (`client/src/hooks/useSessionLogic.ts`)
Extract all stateful logic from Session.tsx:
- WebSocket connection + `onmessage` dispatcher
- Timer lifecycle (start on `turn_complete`, enforce 3-min limit)
- Status state machine
- Metrics + transcript cue state
- `handleEnd` handler

The hook returns: `{ status, metrics, cues, elapsed, isConnected, handleEnd, userAnalyserRef, aiAnalyserRef, feedEndRef }`

#### Step 4: Extract Sub-Components (`client/src/components/session/`)
- `SessionTopbar.tsx` — mode badge + timer
- `SessionEndingOverlay.tsx` — loading/analyzing state
- `TranscriptFeed.tsx` — live transcript list with auto-scroll
- `SessionStatus.tsx` — status text display

#### Step 5: Slim Session.tsx Orchestrator
Session.tsx becomes a thin ~60 LOC view that imports the hook and sub-components — no business logic.

#### Step 6: Verify
- `npx tsc --noEmit` passes
- Existing behavior preserved

## New File Structure
```
client/src/
  config.ts              (+ MODE_CONFIG)
  types.ts               (+ ServerMessage union)
  hooks/
    useSessionLogic.ts   (NEW)
  components/
    Session.tsx           (slimmed orchestrator)
    session/
      SessionTopbar.tsx   (NEW)
      SessionEndingOverlay.tsx (NEW)
      SessionStatus.tsx   (NEW)
      TranscriptFeed.tsx  (NEW)
```

## [2026-02-26] Additional Refactoring: Celebration Logic Extraction

### Analysis
The `Session.tsx` component still contains business logic related to session celebrations (first session, milestones, high scores) and direct API calls. This violates the Single Responsibility Principle and makes the component harder to test and maintain.

### Violations Found
| # | Issue | Category |
|---|-------|----------|
| 1 | Logic for checking first session, milestones, and high scores is mixed with UI rendering. | Responsibility |
| 2 | Inline `fetch` call for milestone checks. | API / Side Effects |
| 3 | Magic strings/numbers (`glotti_first_session_celebrated`, `8`, `MILESTONE_THRESHOLDS`). | Code Smell |

### Refactoring Steps

#### Step 1: Create `client/src/hooks/useCelebration.ts`
Extract the celebration state management and logic into a custom hook.
- Move `celebration` state and `pendingReportRef` logic.
- Move `useEffect` with the fetch call into the hook.
- Validates inputs (userId).

#### Step 2: Use Constants
- Move `MILESTONE_THRESHOLDS` to a shared constants file or keep inside the hook if only used there.
- Define storage keys and threshold values as constants.

#### Step 3: Update `Session.tsx`
- Replace the inline logic with `useCelebration`.
- Pass necessary props (userId, mode, onEnd) to the hook.
- The component should only handle rendering the `CongratulationsOverlay` based on the hook's return value.

#### Step 4: Verify
- Ensure celebrations still trigger correctly (mocking or manual test).
- Check that `Session.tsx` is significantly cleaner.

### [2026-02-26] Completion Status
- [x] Extracted celebration logic to `client/src/hooks/useCelebration.ts`
- [x] Removed inline API calls and magic numbers from `Session.tsx`
- [x] Verified build with `tsc --noEmit`
