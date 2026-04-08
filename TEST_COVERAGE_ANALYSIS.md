# Test Coverage Analysis

## Current State

**139 tests passing** across 12 test files. All Priority 1 and Priority 2 gaps from the initial analysis have been addressed.

---

## Test Coverage Summary

| Module | Tests | What's tested |
|--------|-------|---------------|
| `lib/transforms.ts` | 30 | `formatCount`, `relativeTime`, all 5 platform transforms, edge cases (null/empty/CDATA/HTML entities) |
| `lib/harness.ts` | 19 | Signal collection, strategy evaluation, feed presentation, feed health, cold-start behavior |
| `lib/store.ts` | 22 | All Zustand actions (like/bookmark/hide/viewed), theme toggle, streak logic, toasts, scroll positions, activity read state |
| `lib/fetchers.ts` | 9 | All platform fetchers (configured/unconfigured/error paths), aggregator, graceful failure handling |
| `lib/useContent.ts` | 11 | `mergeContent` pool splitting (std/live/compact), deduplication, minimum pool filling, Substack exclusion from explore, edge cases |
| `lib/traces.ts` | 13 | `pushTrace`/`getTraces` accumulation, auto-timestamping, metadata, `pruneTraces` age cutoff, session_start gap detection, strategy log CRUD, log trimming to 50, corrupt data handling |
| `lib/harness.ts` (optimizer) | 5 | Outer-loop hill-climbing: confidence guard, log entry guard, serendipity rate adjustments, parameter clamping |
| `lib/sounds.ts` | 4 | All 4 sound functions don't throw in test/jsdom environment |
| `lib/useLongPress.ts` | 9 | Timer firing at delay, cancel on mouseUp/mouseLeave, touch support, click suppression after long press, custom delay |
| `lib/useFocusTrap.ts` | 5 | Tab wrap last→first, Shift+Tab wrap first→last, inactive no-op, empty container safety, cleanup on unmount |
| `components/atoms/ErrorBoundary.tsx` | 4 | Renders children normally, catches errors with fallback UI, displays error message, recovery via "Try again" |
| `app/api/comments/route.ts` | 8 | Missing videoId/key handling, comment mapping, sort parameter, Cache-Control headers, API error, network error |

---

## Remaining Gaps (Lower Priority)

### Interactive components (`LikeButton`, `BookmarkButton`, `ShareButton`)
- **Why**: User-facing engagement actions. Already well-covered indirectly by store tests, but click-to-state-change integration is untested.
- **What to test**: Click triggers `toggleLike`/`toggleBookmark`, visual state reflects store, haptic/sound feedback fires conditionally.

### Feed card components (`StdCard`, `LiveCard`, `CompactCard`)
- **Why**: Rendering logic for different content types. Moderate complexity with conditional fields.
- **What to test**: Renders correct platform icon, displays live badge for live cards, truncates long titles, shows "New" badge for isNew items.

### `components/overlays/CommandPalette.tsx`
- **Why**: Fuzzy matching logic inside the component (not easily unit-testable without extracting). Consider extracting `fuzzyScore` as a utility.
- **What to test**: Search filtering, keyboard navigation (ArrowDown/ArrowUp/Enter), command execution.

### `components/layout/Shell.tsx`
- **Why**: Main orchestrator — tab routing, detail sheets, overlays. High complexity.
- **What to test**: Tab switching renders correct view, detail sheet opens/closes, keyboard shortcut registration.
- **Approach**: Integration tests with Testing Library + mocked store.

---

## Recommended Next Steps

1. **Add coverage reporting** to CI: `vitest run --coverage` with a minimum threshold (start at 40%, ratchet up).
2. **Extract `fuzzyScore`** from CommandPalette into a utility and unit test it.
3. **Add `@testing-library/user-event`** for more realistic interaction tests on interactive components.
4. **Add `msw`** (Mock Service Worker) once real API integrations land — cleaner than `vi.fn()` for fetch mocking at scale.
5. **Add Playwright** for E2E smoke tests once the app is deployed.
