# Backlog-Gated Scheduling — Design

**Status:** Approved 2026-08-01, ready for planning.

## Problem

Theory concepts and Goals steps are both introduced on a fixed calendar
clock, computed entirely up front:

- **Theory**: `seedSchedule` inserts all 150 concepts at install time, each
  with a `next_review` date equal to `today + (concept_day - 1)`. Concept 47
  becomes due on day 47 no matter how many of concepts 1–46 you've actually
  cleared.
- **Goals**: `createStep` assigns each new step's `due_date` as "the day
  after the previous step's due date" at the moment the step is created —
  again independent of whether the previous step is done.

Neither the LeetCode ladder's *review* cadence nor the due-list rendering is
capped, so falling behind on either curriculum means the due/overdue pile
only grows — new items keep landing on schedule on top of whatever's
already stuck. This is what's being described as "piling up."

LeetCode itself is out of scope: problems are added ad hoc when you solve
one (not auto-introduced on a clock), so there's nothing to gate there.

## Approach: watermark-gated release

Each domain gets a **watermark** — an integer marking how far into its
strictly-ordered sequence you've been let in. An item is only eligible to
appear on the due list once its position is `<= watermark`; beyond that,
it's invisible regardless of any placeholder due date already stored on it.

A single cap governs both domains: **`MAX_ACTIVE_BACKLOG = 5`** (due +
overdue items not yet cleared). Whenever the watermark could safely advance
— checked on every due-list read — it advances by enough to bring the
domain's visible backlog back up to the cap, and each newly-released item's
due date is stamped as **today**.

This applies **per domain independently** (Theory has one watermark; each
Goals project has its own) — not a shared global count.

### Shared primitive — `scheduling.ts`

```ts
export const MAX_ACTIVE_BACKLOG = 5;

// backlog: currently-visible due+overdue count for the domain (or project).
// remaining: items past the watermark, still waiting to be released.
// Returns how many of those `remaining` items to release now.
export function releaseCount(backlog: number, remaining: number, cap = MAX_ACTIVE_BACKLOG): number {
  return Math.min(Math.max(cap - backlog, 0), remaining);
}
```

Pure, domain-agnostic, and trivially testable (this is the one new piece of
"interesting" logic — everything else is wiring).

## Theory changes

### Data model

```sql
CREATE TABLE IF NOT EXISTS theory_state (
  released_up_to INTEGER NOT NULL DEFAULT 0
);
-- single row, created with released_up_to = 0 on fresh install
```

`theory_schedule` itself is unchanged — `next_review` is still a real
column, it's just ignored for any `concept_day > released_up_to`.

### Release gate

```ts
// theory-db.ts
function runTheoryReleaseGate(db: Database, today: string): void {
  const { released_up_to } = db.query(`SELECT released_up_to FROM theory_state`).get() as { released_up_to: number };
  const backlog = db.query(
    `SELECT COUNT(*) AS n FROM theory_schedule WHERE concept_day <= ? AND next_review <= ?`
  ).get(released_up_to, today) as { n: number };
  const remaining = TOTAL_DAYS - released_up_to;
  const toRelease = releaseCount(backlog.n, remaining);
  if (toRelease === 0) return;

  db.query(
    `UPDATE theory_schedule SET next_review = ? WHERE concept_day > ? AND concept_day <= ?`
  ).run(today, released_up_to, released_up_to + toRelease);
  db.query(`UPDATE theory_state SET released_up_to = ?`).run(released_up_to + toRelease);
}
```

Called at the top of `listDueTheory` (self-healing on every read — no need
to hook it into every mutation path). `listDueTheory` and
`countOverdueTheory` both add `AND concept_day <= (SELECT released_up_to FROM theory_state)`
to their existing `WHERE` clause.

### Fresh install

`seedSchedule` is unchanged (still inserts all 150 rows). Immediately after
seeding, `migrateTheory` calls `runTheoryReleaseGate` once — with backlog at
0, this releases the first 5 concepts immediately (day one gives you 5
concepts in play, not 1). This is a deliberate behavior change from today:
one cap governs both the fresh-start ramp and the steady state, rather than
having two separate rules.

### Migration for existing `srs.db`

One-time backfill in `migrateTheory`, run only if `theory_state` doesn't
exist yet (i.e. upgrading a pre-existing db):

```sql
CREATE TABLE theory_state (released_up_to INTEGER NOT NULL DEFAULT 0);
INSERT INTO theory_state (released_up_to)
  SELECT COALESCE(MAX(concept_day), 0) FROM theory_schedule
  WHERE rung >= 0 OR concept_day IN (SELECT DISTINCT concept_day FROM theory_reviews);
```

This sets the watermark to the furthest concept you've actually engaged
with (passed at least once, or attempted and reset). Any concept beyond
that frontier — including ones currently cluttering the due list untouched
— becomes invisible immediately. Then `runTheoryReleaseGate` runs once
during migration, topping the watermark back up toward the cap using your
real current backlog. This is what actually drains the existing pile.

## Goals changes

### Data model

```sql
ALTER TABLE projects ADD COLUMN steps_released INTEGER NOT NULL DEFAULT 0;
```

Steps are ordered by `id` (creation order) within a project; the first
`steps_released` of them are eligible for the due list.

### Release gate

```ts
// goals-db.ts
function runGoalsReleaseGate(db: Database, projectId: number, today: string): void {
  const project = db.query(`SELECT steps_released FROM projects WHERE id = ?`).get(projectId) as { steps_released: number };
  const allSteps = db.query(`SELECT id FROM project_steps WHERE project_id = ? ORDER BY id`).all(projectId) as { id: number }[];
  const backlog = db.query(
    `SELECT COUNT(*) AS n FROM project_steps WHERE project_id = ? AND id IN (${allSteps.slice(0, project.steps_released).map(s => s.id).join(",") || "-1"}) AND due_date <= ? AND done = 0`
  ).get(projectId, today) as { n: number };
  const remaining = allSteps.length - project.steps_released;
  const toRelease = releaseCount(backlog.n, remaining);
  if (toRelease === 0) return;

  const newlyReleased = allSteps.slice(project.steps_released, project.steps_released + toRelease);
  for (const step of newlyReleased) {
    db.query(`UPDATE project_steps SET due_date = ? WHERE id = ?`).run(today, step.id);
  }
  db.query(`UPDATE projects SET steps_released = ? WHERE id = ?`).run(project.steps_released + toRelease, projectId);
}
```

(Exact SQL for the backlog count will likely be cleaner as a JOIN on
`id <= ` the released frontier's *step id*, not an `IN (...)` list — this is
illustrative of the logic, the plan can pick the tidier query shape.)

Called at the top of `listDueSteps` for every project it touches, and in
`createStep` right after inserting (so a brand-new project's first steps
release immediately, same as today's "first step due on creation" feel, up
to the cap).

`nextStepDueDate`/nextStepDueDate-based assignment in `createStep` is
removed — a step's `due_date` is meaningless until release sets it to
`today`; store a placeholder (e.g. the `created_at` date, never read before
release) instead.

### Migration for existing Goals data

For each existing project: `steps_released` = count of steps that are
either `done = 1` or already due under the old model (`due_date <= today`),
ordered by `id`, capped at 5. Steps beyond that are hidden until their
project's gate releases them. Then run `runGoalsReleaseGate` once per
project during migration to top up toward the cap.

## Testing

- `scheduling.test.ts`: table-test `releaseCount` — backlog ≥ cap → 0;
  backlog 0 → `min(cap, remaining)`; `remaining` smaller than headroom →
  exactly `remaining`.
- `theory-db.test.ts`: fresh install releases first 5 concepts; gate stays
  flat once backlog hits 5; gate advances again once concepts are reviewed
  and backlog drops; migration backfill computes a sane watermark from
  mixed rung/review-history fixtures and then tops up toward cap.
- `goals-db.test.ts`: same shape of cases, per-project — new project with
  >5 steps only exposes 5; completing steps releases more; migration
  backfill from mixed done/overdue fixtures.
- Manual check: after migrating the real `srs.db`, run the app and confirm
  the Home due count actually drops to a bounded number instead of the
  existing historical pile, then confirm new items trickle in as you clear
  reviews/steps.

## Out of scope

- LeetCode: no auto-introduction exists to gate; its ladder and due-list
  rendering are unchanged.
- Making `MAX_ACTIVE_BACKLOG` configurable via env var or UI — a single
  hardcoded constant for both domains, matching the existing style of
  `LADDER`/`THEORY_LADDER`.
- Any change to the Home tab's aggregation/display logic — it already just
  reads each domain's due list, so it inherits the smaller pile for free.
