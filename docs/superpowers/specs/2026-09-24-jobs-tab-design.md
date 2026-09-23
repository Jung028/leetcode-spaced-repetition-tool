# Jobs tab — design

**Date:** 2026-09-24
**Goal:** track the Summer 2026/27 internship hunt inside leetcode-srs so job
actions (apply before a deadline, follow up, message a startup) land on the
same Home "Everything due" list as LeetCode, Todo, Modules and Deadlines —
one place to see what to do today.

## Data

`jobs` table (`jobs/db.ts`), one row per role or startup:
`kind` (`role` | `startup`), `company`, `role`, `job_type`, `cycle`, `link`,
`notes`, `status`, `priority`, `intl_ok`, `closes_on`, `applied_on`,
`last_update`, `next_action`, `next_action_due`, `about`, `created_at`.
`jobs_meta` holds a `seeded` flag so the starting data (`jobs/seed.ts`) is
imported exactly once per database.

Statuses are validated per kind by the API (`statusesFor`).

## Next-action rules (`nextJobAction(job, today)`)

1. Terminal status (Offer, Rejected, Skipped, Not submitted, Withdrawn,
   No reply) → nothing.
2. Explicit `next_action_due` → that action on that date (never dropped).
3. To apply → closed (`closes_on < today`) is nothing; with `closes_on` due
   `APPLY_LEAD_DAYS` (3) before it; High priority with no date due now.
4. Otherwise follow-up after `FOLLOW_UP_DAYS[status]` from `last_update`
   (Applied 21, OA/Interview 7, Contacted 7, Replied 3), dropped once it is
   `FOLLOW_UP_STALE_DAYS` (14) past due — ghosted applications must not
   flood Home.

A status change stamps `last_update`, stamps `applied_on` the first time a
row leaves its starting status (unless it is going straight to a terminal
status), and clears a stale `next_action_due`.

## Home integration

`home-api.ts` adds `DueSource = "job"`: `jobDue` feeds `/api/home/due` and the
due/overdue stats; `jobCompletedToday` (rows with `applied_on = today`) feeds
`/api/home/completed-today` and `completedToday`. Clicking a job item on
Home deep-links to the Jobs tab and opens that row's editor.

## API (`jobs/api.ts`)

- `GET/POST /api/jobs`
- `GET/PUT/DELETE /api/jobs/:id`
- `POST /api/jobs/:id/applied` — Applied (role) / Contacted (startup)
- `GET /api/jobs/actions`

## Continuous testing

- **Automated Hooks**: a hook fires every time the AI saves a change
  (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test suite
  (`bun test`), and the type checker (`tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure output
  immediately and attempts to fix its own mistake before the user has to
  intervene, so the user always returns to a green (passing) state.

Tests: `jobs/db.test.ts`, `jobs/api.test.ts`, and job cases in
`home-api.test.ts`.
