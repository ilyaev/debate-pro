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
