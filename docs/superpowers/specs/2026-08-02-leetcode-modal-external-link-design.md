# LeetCode Popup Lists — Row Click Opens External Link — Design

**Status:** Approved 2026-08-02, ready for planning.

## Problem

The LeetCode tab's "Due today" board already opens a problem's external
LeetCode page when you click the row body, with a small `⋯` icon as the
secondary action to open the internal detail view (`frontend.tsx:297-310`).

The four popup lists reached from the LeetCode tab's stat tiles — Tracked,
Due, Overdue, Completed, all rendered by the single shared
`TrackedListModal` component (`frontend.tsx:108-173`) — do the opposite:
clicking the row body opens the internal detail view, and a small `↗` icon
opens the external link. This is inconsistent with the board it sits right
next to, and clicking a row in the popup doesn't do what clicking a row
everywhere else on the tab does.

## Fix

Swap the two buttons' click handlers inside `TrackedListModal` so it
matches the Due board exactly:

- **Main row body**: `onClick={() => openExternal(p.url)}` (was
  `onOpen(p.id); onClose();`). Opening an external tab doesn't close the
  popup — same as the icon's current behavior.
- **Small icon button**: symbol changes from `↗` to `⋯`, `onClick={() => { onOpen(p.id); onClose(); }}` (was `openExternal(p.url)`),
  `title="View details & mark review"`, `aria-label="View details"` —
  identical copy to the Due board's own icon.

No new CSS classes or props — `TrackedListModal`'s existing className
structure (`modal-row`, inline flex styles on the main button,
`board-row-review` on the icon) is reused as-is. Since all four popups
share this one component, the fix applies to all of them simultaneously.

No other files change: `home-api.ts`, `HomeApp.tsx`, and the Theory/Goals
code are untouched — this is a single-component behavior swap in
`frontend.tsx`.

## Testing

This repo has no frontend test harness for `frontend.tsx` — verification
is manual: run `bun --hot index.ts`, open each of the four stat-tile
popups (Tracked/Due/Overdue/Completed), confirm clicking a row opens the
problem's LeetCode page in a new tab and the popup stays open, and confirm
clicking the `⋯` icon opens the internal detail view and closes the popup.

## Out of scope

- Home tab's unified due list and its own popup modal — explicitly excluded
  from this change; they have no external-link behavior today and adding
  one is a separate decision (Theory/Goals items have no external URL to
  link to).
- Any visual/styling changes beyond swapping which action each existing
  button performs.
