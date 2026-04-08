# Test Coverage Analysis

## Current State

The codebase had **zero test coverage** prior to this analysis — no test files, no test framework, no test configuration.

This PR introduces Vitest + Testing Library and provides **80 foundational tests** across the 4 highest-priority modules. What follows is a gap analysis of remaining untested areas, prioritized by risk and ROI.

---

## What's Now Covered (this PR)

| Module | Tests | What's tested |
|--------|-------|---------------|
| `lib/transforms.ts` | 30 | `formatCount`, `relativeTime`, all 5 platform transforms, edge cases (null/empty/CDATA/HTML entities) |
| `lib/harness.ts` | 19 | Signal collection, strategy evaluation, feed presentation, feed health, cold-start behavior |
| `lib/store.ts` | 22 | All Zustand actions (like/bookmark/hide/viewed), theme toggle, streak logic, toasts, scroll positions, activity read state |
| `lib/fetchers.ts` | 9 | All platform fetchers (configured/unconfigured/error paths), aggregator, graceful failure handling |

---

## Priority 1: High-Risk Gaps (should test next)

### 1. `lib/useContent.ts` — Content merging & caching hook
- **Risk**: The `mergeContent()` function decides what users see on every tab (For You, Following, Explore). A bug here silently breaks the entire feed.
- **What to test**: Pool splitting logic (std/live/compact), deduplication between API and mock data, minimum pool size filling, cache staleness (STALE_TIME).
- **Approach**: Extract `mergeContent` as a standalone export (it's already a pure function) and unit test it. For the hook itself, use `renderHook` with a mocked fetch.

### 2. `lib/traces.ts` — Event tracing & persistence
- **Risk**: Traces feed the harness intelligence layer. If traces are silently dropped or corrupted, the personalization engine degrades without any visible error.
- **What to test**: `pushTrace` appending, `pruneTraces` age cutoff, `flushNow` localStorage persistence, `getStrategyLog`/`pushStrategyLog` round-trip, storage-full fallback (`.slice(-200)`), session_start gap detection.
- **Approach**: Unit tests with mocked localStorage (already available in test setup).

### 3. `lib/harness.ts` — Outer-loop optimizer
- **Risk**: `optimizeParams()` mutates module-level state (`currentParams`) based on strategy log history. Hill-climbing logic could drift parameters to extremes.
- **What to test**: Parameter clamping boundaries, engagement/diversity delta responses, insufficient-data guard (`confidence < 0.3`).
- **Approach**: Mock `getStrategyLog` to return controlled entries, verify parameter adjustments.

---

## Priority 2: Medium-Risk Gaps

### 4. API Route Handlers (`app/api/`)
- **Why**: The route handlers are thin wrappers, but the `/api/comments/route.ts` has filtering/sorting logic, and response caching headers should be verified.
- **What to test**: Response shape, Cache-Control headers, query parameter parsing in comments route.

### 5. `components/atoms/ErrorBoundary.tsx`
- **Why**: The sole safety net for unhandled React errors. If it breaks, users see a white screen.
- **What to test**: Catches child errors, renders fallback UI, "Try again" button resets state.
- **Approach**: `render(<ErrorBoundary><ThrowingChild /></ErrorBoundary>)` with Testing Library.

### 6. `components/overlays/CommandPalette.tsx`
- **Why**: The global search (Cmd+K) has fuzzy matching logic that determines what content users can discover.
- **What to test**: Fuzzy matching algorithm, keyboard navigation, result filtering.

### 7. `lib/useLongPress.ts` / `lib/useFocusTrap.ts`
- **Why**: Accessibility-critical hooks. `useFocusTrap` manages keyboard navigation in modals.
- **What to test**: Long-press timing threshold, focus wrapping within trap, cleanup on unmount.

---

## Priority 3: Lower-Risk / Higher-Effort Gaps

### 8. Interactive components (`LikeButton`, `BookmarkButton`, `ShareButton`)
- **Why**: User-facing engagement actions. Already well-covered indirectly by store tests, but click-to-state-change integration is untested.
- **What to test**: Click triggers `toggleLike`/`toggleBookmark`, visual state reflects store, haptic/sound feedback fires conditionally.

### 9. Feed card components (`StdCard`, `LiveCard`, `CompactCard`)
- **Why**: Rendering logic for different content types. Moderate complexity with conditional fields.
- **What to test**: Renders correct platform icon, displays live badge for live cards, truncates long titles, shows "New" badge for isNew items.

### 10. `lib/sounds.ts`
- **Why**: Low risk, but Web Audio API calls could throw in unsupported environments.
- **What to test**: Graceful no-op when AudioContext unavailable, doesn't throw on server.

### 11. `components/layout/Shell.tsx`
- **Why**: The main orchestrator component — manages tab routing, detail sheets, and overlays. High complexity.
- **What to test**: Tab switching renders correct view, detail sheet opens/closes, keyboard shortcut registration.
- **Approach**: Integration tests with Testing Library + mocked store.

---

## Recommended Test Infrastructure Additions

| Tool | Purpose | Priority |
|------|---------|----------|
| `vitest --coverage` (v8 provider) | Line/branch coverage reporting | High — add to CI |
| `@testing-library/user-event` | Realistic user interaction simulation | Medium — needed for component tests |
| `msw` (Mock Service Worker) | Network-level API mocking | Medium — cleaner than vi.fn() for fetch |
| Playwright or Cypress | E2E smoke tests | Low — valuable once real APIs are integrated |

---

## Suggested Next Steps

1. **Add coverage reporting** to CI: `vitest run --coverage` with a minimum threshold (start at 30%, ratchet up).
2. **Test `useContent` mergeContent** — highest-risk untested pure function.
3. **Test `traces.ts` persistence** — critical path for personalization.
4. **Add ErrorBoundary component test** — safety net for production errors.
5. **Add `msw`** once real API integrations land — current mocking approach won't scale.
