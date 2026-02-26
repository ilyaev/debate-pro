# API Sessions — Architecture Reference

**Router:** `server/api/sessions.ts` — Slim route definitions using dependency-injected store  
**Dependencies:** `express`, `zod`, store (injected), middleware, services

**Supporting modules:**

| File | Purpose |
|------|---------|
| `server/utils/share-key.ts` | SHA-256 share key computation & validation |
| `server/utils/dates.ts` | Date normalization helper |
| `server/middleware/session-auth.ts` | Auth middleware (owner / share key verification) |
| `server/services/og-renderer.ts` | Satori + Resvg image rendering with LRU cache |
| `server/services/og-html.ts` | OG HTML template builder with HTML escaping |

---

## 1. API Endpoints

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 1 | GET | `/api/sessions?userId=<id>` | List session summaries for a user |
| 2 | GET | `/api/sessions/:id?userId=<id>\|key=<shareKey>` | Get full session (owner or shared) |
| 3 | GET | `/api/sessions/shared/og/:id/:key` | OG meta tags HTML page for social sharing |
| 4 | GET | `/api/sessions/shared/og-image/:id/:key` | Render OG share image (PNG via Satori) |

---

## 2. Algorithm Walkthrough

### 2.1 `GET /` — List Sessions
1. Validate `userId` query param with zod → 400 if missing/empty.
2. Call `store.listByUser(userId)`.
3. Map results: normalize `startedAt` via `normalizeDate()`.
4. Return JSON array of session summaries.

### 2.2 `GET /:id` — Get Session Detail
1. `sessionAuth` middleware loads session from store → 404 if not found.
2. Middleware resolves access level: `owner`, `basic_share`, or `full_share` → 403 on failure.
3. Handler reads `req.sessionData` and `req.accessLevel`.
4. **Sanitize response** based on access level:
   - Share access: strip `userId`, conditionally include `transcript` (only for `full_share`).
   - Owner: return full session.
5. Normalize `startedAt` via `normalizeDate()`.

### 2.3 `GET /shared/og/:id/:key` — OG HTML Page
1. `sessionAuth` middleware validates session + share key.
2. `requireReport` middleware ensures report exists → 404 if not.
3. `buildOgHtml()` service builds HTML with escaped OG meta tags.
4. JavaScript redirect to SPA route `/#/sessions/:id/:key`.
5. Return HTML response.

### 2.4 `GET /shared/og-image/:id/:key` — OG Image Render
1. `sessionAuth` + `requireReport` middleware.
2. Check `areFontsLoaded()` → 500 if not.
3. `renderOgImage()` service checks LRU cache (max 100 entries) → returns cached PNG or renders fresh.
4. Satori renders `PerformanceCard` React component → SVG → PNG via Resvg.
5. Return PNG with 24h cache header.

---

## 3. Module Details

### 3.1 Share Key Utility (`server/utils/share-key.ts`)

```typescript
computeShareKeys(sessionId, userId): { basic: string, full: string }
validateShareKey(session, key): 'basic' | 'full' | null
```

- SHA-256 hash of `sessionId + userId` (basic) or `sessionId + userId + 'full_transcript'` (full).
- First 24 hex characters.
- Aligned with client-side `generateShareKey()` in `client/src/utils/shareKey.ts`.

### 3.2 Auth Middleware (`server/middleware/session-auth.ts`)

- `sessionAuth(store)` — factory that returns middleware.
- Supports two auth patterns: `?userId=` (owner) or `?key=` / `:key` (share key).
- Attaches `req.sessionData` and `req.accessLevel` (`'owner' | 'basic_share' | 'full_share'`).
- `requireReport` — guard middleware ensuring `req.sessionData.report` exists.

### 3.3 OG Renderer (`server/services/og-renderer.ts`)

- `loadAssets()` — loads 4 Inter font variants + 4 mode background images (pitch, empathy, impromptu, veritalk).
- `renderOgImage(session)` — renders PerformanceCard via Satori → Resvg, returns PNG Buffer.
- In-memory LRU cache (100 entries, keyed by session ID).
- `areFontsLoaded()` — check before rendering.

### 3.4 OG HTML Builder (`server/services/og-html.ts`)

- `buildOgHtml({ session, id, key, protocol, host })` — returns escaped HTML string.
- All interpolated values (`modeLabel`, `score`, `id`, `key`, `host`) are HTML-escaped.

### 3.5 Router Factory (`server/api/sessions.ts`)

```typescript
export function createSessionsRouter(store: SessionStore): Router
```

- Accepts store via dependency injection (no internal `createStore()`).
- `main.ts` creates a single shared store and passes it to both the router and WebSocket handler.
- Input validation via zod schemas.
- All error responses standardized to `{ error: string }` JSON.

---

## 4. Security

| Concern | Status |
|---------|--------|
| HTML escaping in OG template | ✅ All values escaped via `escapeHtml()` |
| Stack trace leak in error responses | ✅ Removed — generic JSON errors only |
| Consistent error format | ✅ All endpoints return `{ error: string }` JSON |
| Share key deterministic | ℹ️ By design — derived from `sessionId + userId` |
| Input validation | ✅ Zod validation on query params |

---

## 5. Design Notes

- `sessiong` in the OG URL path (`/sessiong/:id/:key`) is intentional, not a typo.
- `PerformanceCard` is imported cross-boundary from `client/src/` — this is a known coupling, accepted for now.
