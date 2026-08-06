# LeetCode Top Interview 150 — Daily Next-Problem Reminder

**Status:** Approved 2026-08-06, ready for planning.

## Problem

The LeetCode tab only tracks problems you've already solved and added (via
manual add or the capture flow), then spaced-repeats them. There's no
tracking of *which* problem to attempt next against a curriculum, so it's
easy to open the app, see the review queue, and just work through that —
forgetting to pick up the next new problem from LeetCode's "Top Interview
150" list.

You're 29/150 through the official list (in its own topic-grouped order:
Array/String, Two Pointers, Sliding Window, Matrix, Hashmap, Intervals,
Stack, Linked List, Binary Tree General/BFS, Binary Search Tree, Graph
General/BFS, Trie, Backtracking, Divide & Conquer, Kadane's Algorithm,
Binary Search, Heap, Bit Manipulation, Math, 1D DP, Multidimensional DP),
and the next one up is "209. Minimum Size Subarray Sum" (Sliding Window).

## Scope

This covers only introducing new problems from the list, one at a time, and
reminding you to pick up the next one. It does not change how solved
problems are reviewed (existing spaced-repetition flow, unchanged), and it
does not build any UI for browsing the full 150-list — just "what's next."

## Content Model

A new static file, `leetcode150-content.ts`, holds the full ordered list
exactly as published (150 entries), each with:

```ts
export interface Leetcode150Item {
  position: number;   // 1-based index in the official list, 1..150
  number: number;      // LeetCode problem number, e.g. 209
  title: string;        // "Minimum Size Subarray Sum"
  topic: string;         // "Sliding Window"
  difficulty: "Easy" | "Medium" | "Hard";
}

export const LEETCODE_150: Leetcode150Item[] = [ /* ...150 entries, in official order... */ ];

// Shared with leetcode.ts's slugFromUrl matching convention — lowercase,
// non-alphanumeric runs collapsed to single hyphens.
export function slugify(title: string): string { /* ... */ }

export function leetcode150Url(item: Leetcode150Item): string {
  return `https://leetcode.com/problems/${slugify(item.title)}/`;
}
```

No content-authoring work is needed beyond transcribing the list — unlike
Exam/Theory, there's no per-item question content to write; each entry is
just a pointer to a real LeetCode problem you'll solve on their site.

## State: a Single Advancing Pointer

One row, seeded once:

```sql
CREATE TABLE leetcode150_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  completed_count INTEGER NOT NULL
);
-- seeded via migration: INSERT INTO leetcode150_state VALUES (1, 29);
```

`completed_count` means "this many entries, from position 1, are done."
`LEETCODE_150[completed_count]` (0-indexed into the 1-based list) is the
current suggested problem, or "all done" once `completed_count >= 150`.

This is a single strictly-ordered pointer, not a pool — there's never more
than one "current" problem, so there's no daily backlog/release-cap
mechanism to build (unlike Theory/Goals/the old Exam model). The 29 seed
value is a one-time fact you told me directly; it is **not** derived by
scanning existing `problems` rows, since there's no guarantee your first 29
solves are logged in the `problems` table with matching URLs (some may
predate this app, or use different URL formats).

## Advancing the Pointer

No hook into `createProblem`/`captureSubmission`/`updateProblem` — those
stay untouched. Instead, the pointer **self-advances on read**: every time
it's queried, walk forward while the current entry's slug matches an
existing `problems` row's URL slug (via the existing `slugFromUrl` already
in `leetcode.ts`), persisting `completed_count` as it advances.

```ts
export function getCurrentLeetcode150(db: Database): Leetcode150Item | null {
  let completedCount = /* read leetcode150_state.completed_count */;
  const solvedSlugs = new Set(
    listProblems(db).map((p) => slugFromUrl(p.url)).filter((s): s is string => s !== null),
  );
  while (completedCount < LEETCODE_150.length && solvedSlugs.has(slugify(LEETCODE_150[completedCount]!.title))) {
    completedCount++;
  }
  if (completedCount !== /* original value */) {
    /* persist new completedCount to leetcode150_state */
  }
  return completedCount < LEETCODE_150.length ? LEETCODE_150[completedCount]! : null;
}
```

Solving today's suggested problem and adding it the normal way (manual add
or capture) is immediately picked up the next time the banner loads — no
separate "mark done" action, and no waiting for the next calendar day: if
you solve it early, the next one shows right away.

## API

One route:

```
GET /api/leetcode150/current
```

Response: `{ position, number, title, topic, difficulty, url }`, or
`{ done: true }` once `completed_count >= 150`.

## UI

A persistent banner at the top of the LeetCode tab's board, above the
review queue — exactly where you land when opening the app, so it can't be
missed by going straight into practicing:

> **Next up: 209. Minimum Size Subarray Sum** — Sliding Window · Medium
> [Open on LeetCode →]

The link opens the real LeetCode problem page in a new tab (`target="_blank"`,
mirroring how problem links already work elsewhere in this app). The banner
disappears (replaced by a small "🎉 all 150 done" note) once
`GET /api/leetcode150/current` returns `{ done: true }`.

## Testing

- `slugify`/`leetcode150Url` pure-function tests, including the tricky
  titles ("3Sum" → `3sum`, "Sqrt(x)" → `sqrtx`, "Pow(x, n)" → `powx-n`,
  "N-Queens II" → `n-queens-ii`).
- Migration test: fresh db seeds `completed_count = 29`; running the
  migration twice doesn't reset or duplicate the row.
- Pointer advancement: seed a `problems` row matching
  `LEETCODE_150[29]`'s slug, confirm `getCurrentLeetcode150` returns
  `LEETCODE_150[30]` and persists `completed_count = 30`.
- Multi-step advancement: seed rows matching several consecutive entries
  at once, confirm the pointer walks forward past all of them in one call.
- "All done" case: seed `completed_count = 150`, confirm the route returns
  `{ done: true }`.
- Route test for `GET /api/leetcode150/current`'s response shape.

## Out of Scope

- No UI for browsing/searching the full 150 list, only "what's next."
- No change to the existing spaced-repetition review flow for already-added
  problems.
- No retroactive detection of which of the first 29 are actually logged in
  `problems` — the seed value is taken as given.
- No difficulty-based reordering or skipping — strictly the official list
  order.
