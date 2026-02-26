# API Sessions — Code Analysis & Refactoring Plan

**File:** `server/api/sessions.ts`  
**Lines:** ~200  
**Dependencies:** `express`, `crypto`, `react`, `satori`, `@resvg/resvg-js`, `fs`, `path`, store, config, PerformanceCard

---

## 1. Current API Endpoints

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 1 | GET | `/api/sessions?userId=<id>` | List session summaries for a user |
| 2 | GET | `/api/sessions/:id?userId=<id>\|key=<shareKey>` | Get full session (owner or shared) |
| 3 | GET | `/api/sessions/shared/og/:id/:key` | OG meta tags HTML page for social sharing |
| 4 | GET | `/api/sessions/shared/og-image/:id/:key` | Render OG share image (PNG via Satori) |

---

## 2. Algorithm Walkthrough

### 2.1 `GET /` — List Sessions
1. Require `userId` query param → 400 if missing.
2. Call `store.listByUser(userId)`.
3. Map results: normalize `startedAt` to ISO string.
4. Return JSON array of session summaries.

### 2.2 `GET /:id` — Get Session Detail
1. Extract `id` from params, `userId` and `shareKey` from query.
2. Fetch session from store by `id` → 404 if not found.
3. **Authorization** (triple path):
   - If `shareKey` provided: compute two SHA-256 hashes (basic & full-transcript). Verify `shareKey` matches one of them → 403 if neither.
   - If `userId` provided (no key): compare `session.userId` → 403 if mismatch.
   - If neither: → 403.
4. **Sanitize response** based on access type:
   - Share key access: strip `userId`, conditionally include `transcript` (only for full key).
   - Owner access: return full session.
5. Normalize `startedAt` to ISO string.

### 2.3 `GET /shared/og/:id/:key` — OG HTML Page
1. Fetch session → 404 if not found or no report.
2. Validate share key against both hashes → 403 if invalid.
3. Build HTML with `<meta>` OG tags (title, description, image URL).
4. Inject JavaScript redirect to the SPA route `/#/sessions/:id/:key`.
5. Return HTML response.

### 2.4 `GET /shared/og-image/:id/:key` — OG Image Render
1. Fetch session → 404 if not found or no report.
2. Validate share key against both hashes → 403.
3. Use Satori to render `PerformanceCard` React component → SVG.
4. Convert SVG → PNG via `@resvg/resvg-js`.
5. Return PNG with 24h cache header.

---

## 3. Asset Loading (Module Scope)

On module load, the following are read synchronously from disk:
- 4 font files: `Inter-Regular.ttf`, `Inter-Bold.ttf`, `Inter-Italic.ttf`, `Inter-MediumItalic.ttf`
- 3 background images: `bg_pitch.jpg`, `bg_empathy.jpg`, `bg_impromptu.jpg`
  - Converted to base64 data URIs and cached in `bgImages` record.

Failure is caught and logged but fonts remain `null`, causing the OG-image endpoint to fail at runtime with a 500.

---

## 4. Findings & Issues

### 4.1 Architecture Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| A1 | **Module does too much** | High | A single file handles CRUD listing, auth/share-key validation, OG HTML rendering, and server-side React image rendering. These are fundamentally different concerns. |
| A2 | **Duplicate store instance** | Medium | `sessions.ts` creates its own `createStore()`, while `main.ts` also creates one and passes it to the WS handler. In FileStore mode, two instances read/write the same JSON file independently. In Firestore mode it's benign but wasteful. |
| A3 | **Duplicate share-key logic** | High | The SHA-256 share-key computation is copy-pasted 3 times (in `:id`, `og/:id/:key`, and `og-image/:id/:key`). Client has its own version in `shareKey.ts` using Web Crypto. There should be a single shared utility. |
| A4 | **React + Satori in API router** | Medium | Importing React, Satori, and Resvg in the router couples a rendering pipeline to the HTTP layer. This should be a separate service/module. |
| A5 | **Cross-boundary import** | High | `import { PerformanceCard } from '../../client/src/...'` — server imports directly from client source. This creates a fragile coupling and can break if client build setup changes. The component should be shared or extracted. |

### 4.2 Code Quality Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| C1 | **No input validation** | Medium | `userId` and `id` params are used raw without sanitization. Route params like `:id` are passed directly to `store.get()`. While Express protects against path traversal, store implementations should consider injection. |
| C2 | **Inconsistent error responses** | Low | Some routes return `{ error: string }` JSON, others return plain text strings (`'Not Found'`, `'Forbidden'`). OG-image endpoint even leaks stack traces in error responses. |
| C3 | **`startedAt` normalization scattered** | Low | `startedAt instanceof Date ? .toISOString() : startedAt` appears in 3 places. Should be handled once in a utility or at the store level. |
| C4 | **No request param typing** | Low | Route handlers use inline `as string \| undefined` casts instead of proper validated types. |
| C5 | **Hardcoded veritalk bg missing** | Low | `bgImages` loads 3 mode backgrounds but `veritalk` mode exists — its card would get no background image. |
| C6 | **Typo in OG URL** | Bug | Line in OG HTML: `content="${baseUrl}/sessiong/${id}/${key}"` — `sessiong` should be `sessions` or match the actual SPA route. |

### 4.3 Security Concerns

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| S1 | **HTML injection in OG template** | High | `modeLabel` and `score` are interpolated directly into HTML without escaping. If a report's `overall_score` or `mode` contained HTML/JS, it would be injected. While these are server-generated values today, defense-in-depth demands escaping. |
| S2 | **Stack trace leak** | Medium | `og-image` endpoint: `res.status(500).send((err as Error).stack \|\| String(err))` exposes internal stack traces to the client. |
| S3 | **Share key is deterministic** | Info | Keys are derived from `sessionId + userId` only. Anyone who knows both can compute the key. Not necessarily a bug, but worth documenting as a design choice. |

### 4.4 Performance Concerns

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| P1 | **No image caching** | Medium | OG images are re-rendered on every request (Satori + Resvg is CPU-intensive). Only browser caching via `Cache-Control` header. Server should cache rendered PNGs. |
| P2 | **Synchronous font loading at import** | Low | `readFileSync` blocks the event loop at startup. Fine for startup, but worth noting. |
| P3 | **Full session fetch for list** | Low | `store.get(id)` in the detail route fetches the entire session including transcript. OK for now but worth monitoring with large transcripts. |
| P4 | **Base64 images in memory** | Low | Background images are held as base64 data URIs in memory permanently. With 3 images this is fine, but doesn't scale. |

---

## 5. Refactoring Recommendations

### Phase 1 — Extract & Deduplicate (Low Risk)

1. **Extract share-key utility** (`server/utils/share-key.ts`)
   ```
   computeShareKeys(sessionId: string, userId: string): { basic: string, full: string }
   validateShareKey(session, key): 'basic' | 'full' | null
   ```
   Replace all 3 inline hash computations. Align with client-side `shareKey.ts`.

2. **Extract date normalization** — helper function or handle at store layer:
   ```
   normalizeDate(d: Date | string): string
   ```

3. **Fix the `sessiong` typo** in OG route URL.

4. **Fix OG-image error response** — remove stack trace, return generic error.

5. **Add HTML escaping** in OG template for `modeLabel` and `score`.

### Phase 2 — Separate Concerns (Medium Risk)

6. **Extract OG image renderer** (`server/services/og-renderer.ts`)
   - Move Satori/Resvg/React logic, font loading, and background image loading into a dedicated service.
   - Expose: `renderOgImage(session): Promise<Buffer>`
   - Add in-memory LRU cache (keyed by `sessionId + reportHash`) to avoid re-rendering.

7. **Extract OG HTML builder** (`server/services/og-html.ts`)
   - Move template construction into a function with proper escaping.
   - `buildOgHtml(session, key, baseUrl): string`

8. **Use shared store instance**
   - Accept `store` via dependency injection (factory function or middleware) instead of calling `createStore()` inside the router module.
   ```ts
   export function createSessionsRouter(store: SessionStore): Router { ... }
   ```

### Phase 3 — Structural Improvements (Higher Risk)

9. **Extract auth/share middleware**
   - Create middleware that attaches `req.session` and `req.accessLevel` ('owner' | 'basic_share' | 'full_share') so individual handlers don't repeat auth logic.

10. **Move shared component to a shared package**
    - The `PerformanceCard` cross-import should be resolved. Options:
      - a. Create a `shared/` package at the repo root for components used by both server and client.
      - b. Pre-render cards at report generation time and store the SVG/image.

11. **Add request validation**
    - Use `zod` or similar for validating query params and route params.
    - Define schemas per endpoint.

12. **Consistent error responses**
    - Standardize all endpoints to return `{ error: string }` JSON, even OG endpoints.
    - Create an error handler middleware.

### Phase 4 — Performance (Optional)

13. **Add OG image cache**
    - In-memory LRU or disk-based cache keyed by `sessionId`.
    - Invalidate when session report changes.

14. **Add missing veritalk background** — create/add `bg_veritalk.jpg` or handle gracefully.

---

## 6. Proposed File Structure After Refactoring

```
server/
  api/
    sessions.ts              # Slim router: routes only, delegates to services
  middleware/
    session-auth.ts          # Share-key validation + ownership check middleware
  services/
    og-renderer.ts           # Satori + Resvg image rendering + caching
    og-html.ts               # OG HTML template builder with escaping
  utils/
    share-key.ts             # Shared SHA-256 key computation & validation
    dates.ts                 # Date normalization helpers
  store.ts                   # (unchanged)
  config.ts                  # (unchanged)
```

---

## 7. Priority Order

| Priority | Items | Impact |
|----------|-------|--------|
| 🔴 Now | Fix `sessiong` typo (C6), remove stack trace leak (S2), HTML escaping (S1) | Bug + Security |
| 🟠 Soon | Extract share-key util (1), deduplicate date normalization (2), DI for store (8) | Code quality |
| 🟡 Next | Extract OG renderer (6), OG HTML builder (7), auth middleware (9) | Architecture |
| 🟢 Later | Request validation (11), image caching (13), shared package (10) | Polish |
