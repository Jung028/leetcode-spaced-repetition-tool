# LeetCode 150 Daily Due Integration — Design

## Overview

Today, the LeetCode "Top Interview 150" pointer (`getCurrentLeetcode150()` in `leetcode150-db.ts`) is purely informational: `NextProblemBanner` on the LeetCode board tab shows "next up" with a link to the problem on LeetCode.com, but solving it (or not) has zero effect on either the Home tab's aggregate due/overdue/completed stats or the LeetCode board tab's own stats panel. This means there is no real daily quota — "every day needs to complete one new LeetCode" is currently just a UI suggestion with no tracking.

This makes the current pointer problem a real due item: it appears in both places' "due today" counts and lists, goes overdue if missed (consistent with how theory/exam/goals already behave), and disappears (with a "completed today" credit) the moment the user solves it by adding it via the existing "Add problem" flow — which is how the pointer already detects a solve today, just without any date bookkeeping.

## Goals

- The LeetCode board tab's own Stats panel (`Due today`/`Overdue`/`Completed today`) includes the current LeetCode150 pointer problem when unsolved.
- The Home tab's aggregate stats and `/api/home/due` list include it too, consistent with the other four sources (leetcode SRS, theory, goals, exam).
- Missing a day makes it show overdue (`Nd late`), same convention as every other due item.
- Solving it (adding the problem via the existing "Add problem" form, which the pointer's self-advance logic already detects by matching slugified titles) makes it disappear from due/overdue and credits `Completed today` in both places.
- Clicking the item (in either tab) opens the LeetCode.com problem page externally — there's no `problems`-table row to deep-link to, so this matches what `NextProblemBanner` already does today.

## Non-goals

- No changes to the LeetCode150 curated list itself (`leetcode150-content.ts`), the self-advance matching logic's core algorithm, or the "Top Interview 150 progress" banner's own display.
- No retroactive overdue backfill — on migration, `due_since` seeds to the migration date, so existing users start the quota fresh rather than appearing instantly overdue for problems that were "next up" before this feature existed.
- No new UI components — both tabs reuse their existing stats/due-list/modal components, just with one extra data source merged in.

## Schema + backend logic

**`leetcode150-db.ts`** — migration adds two nullable columns to `leetcode150_state`:

```sql
ALTER TABLE leetcode150_state ADD COLUMN due_since TEXT;
ALTER TABLE leetcode150_state ADD COLUMN last_completed_date TEXT;
```

`getCurrentLeetcode150(db, today)` gains a required `today: string` parameter (every call site updates). Behavior:
- If `due_since` is `NULL` (first read after this migration), set it to `today` before proceeding — this is the "start fresh, no retroactive overdue" rule.
- Run the existing self-advance loop (walks `completedCount` forward past any already-solved entries) exactly as today.
- If `completedCount` increased during this call (the pointer actually moved), after the loop: set `due_since = today` (the new position just became due) and `last_completed_date = today` (a solve happened today — one credit per day this happens, not one per position advanced, matching how every other source in this app counts "did something today" rather than "how many").
- Persist `due_since`/`last_completed_date` in the same `UPDATE` that already persists `completed_count` when it changed; if only `due_since` needed seeding (no advance happened), a separate small `UPDATE` handles that case.
- Return type becomes `(Leetcode150Item & { dueSince: string }) | null` — `dueSince` reflects the *current* (possibly just-advanced) position's due date.

**`scheduling.ts`** — the `overdueDays(dueDate: string, today: string): number` helper currently lives only in `home-api.ts`. Move it to `scheduling.ts` (a genuine cross-cutting date utility, not home-tab-specific) and export it; `home-api.ts` imports it from there instead of defining it locally.

**`leetcode150-api.ts`** — `/api/leetcode150/current` passes `today` (via `localToday()`, matching every other route's convention) into `getCurrentLeetcode150`, and includes `overdueDays: overdueDays(item.dueSince, today)` in the JSON response alongside the existing fields and computed `url`.

**`home-api.ts`**:
- `DueItem` gains an optional field: `externalUrl?: string`.
- New function `leetcode150Due(db: Database, today: string): DueItem[]` — calls `getCurrentLeetcode150(db, today)`; if `null` (all 150 done), returns `[]`; otherwise returns a single-element array:
  ```ts
  [{
    source: "leetcode",
    id: -1,
    title: `${item.number}. ${item.title}`,
    subtitle: `${item.topic} · ${item.difficulty}`,
    dueDate: item.dueSince,
    overdueDays: overdueDays(item.dueSince, today),
    linkId: -1,
    externalUrl: leetcode150Url(item),
  }]
  ```
  (`id: -1`/`linkId: -1` is a safe sentinel — real `problems` rows use SQLite's positive auto-increment ids, so `-1` never collides. There is at most one such item at a time, so a fixed sentinel is sufficient — no need for a wider offset scheme like `courseOffset` uses for exam's multi-course ids.)
- New function `leetcode150CompletedToday(db: Database, today: string): DueItem[]` — calls `getCurrentLeetcode150(db, today)` (this call also advances the pointer if needed, so it must run before or share the result with `leetcode150Due`'s call within the same request to avoid a double-advance side effect race — see Implementation note below); if the *previous* pointer's `lastCompletedDate === today`, returns one `DueItem` for the now-just-solved problem (title/subtitle describing what was solved, `dueDate: today`, `overdueDays: 0`); otherwise `[]`.
- Both functions are unioned into `homeStats()`, the `/api/home/due` handler, and the `/api/home/completed-today` handler, alongside the existing four sources' calls.

**Implementation note on double-advance:** `getCurrentLeetcode150` is self-advancing and mutates `leetcode150_state` on every call. Since `homeStats()` and the `/api/home/due` handler each need the *current* state once, call `getCurrentLeetcode150` exactly once per request and derive both the due item and the completed-today item from that single result (`lastCompletedDate` is part of the returned/read state), rather than calling it twice and risking a second call seeing no further advance (harmless, since a second call with nothing new to advance past is a no-op) — but calling it only once per request is simpler to reason about and avoids redundant writes.

Does this look right so far? (I'll present the Home tab and LeetCode board tab wiring — largely unchanged from what you already approved above — plus testing, in the written spec.)

## Home tab wiring

`frontend.tsx`'s `navigate()` gains one guard before its existing dispatch: `if (item.source === "leetcode" && item.externalUrl) { openExternal(item.externalUrl); return; }`. No other source's behavior changes. `HomeApp.tsx` requires no changes.

## LeetCode board tab wiring

`LeetCodeApp` (`frontend.tsx`) adds a second fetch (`leetcode150Api.current()`, already defined for `NextProblemBanner`) alongside its existing `/api/problems` fetch. When the result isn't `{ done: true }`, it synthesizes one `ProblemSummary`-shaped entry:

```ts
{
  id: -1,
  title: `${current.number}. ${current.title}`,
  url: current.url,
  language: "—",
  rung: 0,
  next_review: current.dueSince,
  created_at: current.dueSince,
}
```

prepended to the `problems` array passed into `<Stats>` (and therefore automatically flows through `Stats`'s existing `dueProblems`/`overdueProblems` filters and counts — no filter-logic changes needed there, since those filters already key off `next_review`). The `onOpen` callback (shared by `Stats`'s modals, `DueBoard`'s rows, and the main board rows) gains a guard: `if (id === -1) { openExternal(url); return; }` before its existing `setView({ name: "detail", id })` call.

## Testing & verification approach

- `leetcode150-db.test.ts`: new tests for `due_since` seeding on first read, `due_since`/`last_completed_date` resetting on advance, `overdueDays` growing correctly across simulated days with no advance.
- `leetcode150-api.test.ts`: new test asserting the enriched response shape (`dueSince`, `overdueDays`).
- `home-api.test.ts`: new tests for `leetcode150Due`/`leetcode150CompletedToday` appearing in `homeStats()`, `/api/home/due`, `/api/home/completed-today`, including the overdue-after-a-missed-day case and the completed-today-credit-on-solve case.
- Manual: `bun run dev`, confirm the LeetCode board tab's own stats panel shows the pointer problem in "Due today" (and, after simulating a missed day via test-only date manipulation or waiting, in "Overdue"), confirm clicking it opens LeetCode.com, confirm solving it (adding via "Add problem") makes it disappear from due and credits "Completed today" on both tabs.

## Spec requirement: continuous testing

- **Automated Hooks**: a hook fires every time the AI saves a change (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test suite (`bun test`), and the type checker (`bunx tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure output immediately and attempts to fix its own mistake before the user has to intervene, so the user always returns to a green (passing) state.

This repo has no such hook configured yet. Outstanding requirement independent of this feature; the implementation plan runs `bun test`/`bunx tsc` manually after each task in the interim.
