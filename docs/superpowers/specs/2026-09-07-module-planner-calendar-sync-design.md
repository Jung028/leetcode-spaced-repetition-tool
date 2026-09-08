# Module Planner with Unattended Google Calendar Sync — Design

**Status:** Approved 2026-09-07, ready for planning.

## Overview

A structured, per-course place to record graded deliverables —
assignments, presentations, and vivas — so ad-hoc free-text
announcements stop being the tool for tracking real deadlines. Each item
carries a title, kind, due date/time, description, and links, and
supports add / edit / delete from the UI. Every change is pushed
**unattended** to Adam's Google Calendar as a timed event with popup
reminders at exactly 1 week, 3 days, and 1 day before the due time. The
feature lives as a new panel on the existing **Modules** tab
(`exam/App.tsx`) and plugs into the Home dashboard the same way
LeetCode / Modules / Todo / Interview already do.

The calendar integration is server-side and credential-backed: a
one-time OAuth2 consent stores a refresh token, after which the Bun
server calls the Google Calendar API itself on every create / update /
delete. No per-item clicking, no Claude in the loop, no browser
"Save" step.

## Relationship to existing modules

- **Announcements (`announcement-db.ts`, `AnnouncementsBoard.tsx`)**:
  untouched. Remains the tool for genuinely ad-hoc notes. No migration
  of the current ~10 announcements.
- **Semester deadlines (`semester-deadlines.ts`, `deadline-db.ts`)**:
  untouched. The hardcoded `SEMESTER_DEADLINES` array and its weekly
  PDF-scan rewrite (`~/bin/exam-autogen.sh`) keep running independently.
  The Module Planner is a *separate* list that renders alongside it, not
  a merge target.
- **Modules / exam (`exam/`)**: gains a new `ModulePlanner` panel above
  the practice-paper picker in `exam/App.tsx`. The practice-paper
  content, scheduling, and history are untouched. Course codes and
  display names are read from `semester-deadlines.ts`'s `COURSE_NAMES`.
- **Home (`HomeApp.tsx`, `home-api.ts`)**: gains a new `DueItem` source,
  `"module-item"`, alongside `exam` / `leetcode` / `todo` / `interview`,
  so imminent items appear in "Everything due" and the day counters, and
  deep-link to the Modules tab.
- **Google Calendar (`GoogleCalendarEmbed` in `HomeApp.tsx`)**: the
  read-only month-view iframe is unchanged. It will passively reflect the
  new events once Google's embed refreshes, because they land on Adam's
  primary calendar (already one of the two `EMBEDDED_CALENDARS`).

## Non-Goals

- **No two-way sync.** The flow is one-way, app → calendar. Edits made
  directly to a Google event are not read back and will be overwritten on
  the next sync of that row.
- **No recurring events, no multi-calendar routing.** Every item is a
  single timed event on the primary calendar.
- **No migration** of existing announcements or `SEMESTER_DEADLINES`
  rows into the new table.
- **No in-app Google OAuth UI.** Consent is a one-time terminal script
  (`scripts/gcal-auth.ts`); the app only ever uses the stored refresh
  token.
- **No dependency on `googleapis` or an OAuth library.** All Google
  calls are raw `fetch` (per the repo's "don't add libraries" stance).
- **No hard requirement that the calendar is reachable.** A sync failure
  never blocks or fails a CRUD operation; the row is saved and marked
  for retry.
- **No SRS / scheduling behaviour.** Items are not spaced-repetition
  content; they have a due date and a done flag, nothing more.

## 1. Data model

### Table `module_items` — `module-items-db.ts`

New file, mirroring the shape and helper style of `announcement-db.ts`.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `course` | TEXT NOT NULL | Must be a key of `COURSE_NAMES` (`INFO5995`, `COMP5348`, `INFO6007`, `INFO5990`). Rejected at the API layer otherwise. |
| `kind` | TEXT NOT NULL | One of `assignment` \| `presentation` \| `viva` \| `other`. |
| `title` | TEXT NOT NULL | Trimmed, non-empty. |
| `description` | TEXT NOT NULL DEFAULT `''` | Free text. |
| `due_at` | TEXT NOT NULL | Local Sydney wall time, `YYYY-MM-DDTHH:MM`. A date-only input is stored as `…T23:59`. |
| `links` | TEXT NOT NULL DEFAULT `'[]'` | JSON array of `{ label: string, url: string }`. Validated as `http(s)` URLs. |
| `completed` | INTEGER NOT NULL DEFAULT 0 | 0/1. |
| `gcal_event_id` | TEXT | Nullable. Set after first successful create; used to update/delete in place. |
| `sync_state` | TEXT NOT NULL DEFAULT `'pending'` | `pending` \| `synced` \| `error`. |
| `sync_error` | TEXT | Nullable. Last error message for the ⚠ tooltip. |
| `synced_at` | TEXT | Nullable. Timestamp of last successful sync. |
| `created_at` | TEXT NOT NULL | Local `YYYY-MM-DD` (matches announcements). |
| `updated_at` | TEXT NOT NULL | Local `YYYY-MM-DD`. |

### DB helpers (`module-items-db.ts`)

- `migrateModuleItems(db)` — `CREATE TABLE IF NOT EXISTS`.
- `createModuleItem(db, input, today)` → row (`sync_state: 'pending'`).
- `listModuleItems(db)` → all rows, ordered `completed ASC, due_at ASC`.
- `getModuleItem(db, id)` → row | null.
- `updateModuleItem(db, id, input, today)` → row | null. Bumps
  `updated_at`, resets `sync_state` to `'pending'` (fields that affect
  the calendar event changed).
- `toggleModuleItem(db, id, today)` → row | null. Flips `completed`,
  resets `sync_state` to `'pending'`.
- `deleteModuleItem(db, id)` → deleted row | null (the row is returned so
  the caller still has `gcal_event_id` to delete the event).
- Sync bookkeeping: `markItemSynced(db, id, eventId, now)`,
  `markItemSyncError(db, id, message)`,
  `listItemsNeedingSync(db)` → rows where `sync_state != 'synced'`.

`toModuleItem(row)` parses `links` JSON and coerces `completed` to
boolean, exactly as `toAnnouncement` does.

## 2. API — `module-items-api.ts`

Mirrors `announcement-api.ts`; registered in `index.ts` with its own
`migrateModuleItems(db)` call and `...moduleItemsApiRoutes(db)` spread.

| Route | Method | Behaviour |
|---|---|---|
| `/api/module-items` | GET | `listModuleItems(db)`. |
| `/api/module-items` | POST | Validate `{course, kind, title, due_at, description?, links?}`; `createModuleItem`; then `await syncModuleItem(db, row)`; return the (possibly `error`-stated) row, 201. |
| `/api/module-items/:id` | PUT | Validate; `updateModuleItem`; `await syncModuleItem`; return row or 404. |
| `/api/module-items/:id` | DELETE | `deleteModuleItem`; if the deleted row had a `gcal_event_id`, `await deleteCalendarEvent(id)`; return `{ ok: true }` or 404. A calendar-delete failure logs but still returns `{ ok: true }` — the reconcile sweep will clean the orphan. |
| `/api/module-items/:id/toggle` | POST | `toggleModuleItem`; `await syncModuleItem`; return row or 404. |
| `/api/module-items/sync` | POST | Full reconcile (see §4). Returns `{ synced, errors, orphansRemoved }`. |

**Validation rules:** `course` in `COURSE_NAMES`; `kind` in the four
allowed values; `title` non-empty after trim; `due_at` matches
`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM` (date-only is expanded to `T23:59`);
every `links[].url` parses as `http(s)`. A validation failure is `400`
with `{ error }` and no DB write.

**Sync is non-fatal.** `syncModuleItem` never throws out of a route. On
failure it calls `markItemSyncError` and the route returns the saved row
with `sync_state: "error"` and HTTP 200/201 — never 500.

## 3. UI

### `ModulePlanner.tsx` — rendered on the Modules tab

Placed above the existing practice-paper picker in `exam/App.tsx`.

- **Grouping:** one collapsible `<section>` per course, heading from
  `courseNameFor(code)` with the code as a sub-label. Collapsed state
  persisted in `localStorage` (per the artifact/localStorage convention
  already used elsewhere in the app).
- **Item row:** colour-coded kind badge (`viva`, `presentation`,
  `assignment`, `other` each visually distinct), title, due date shown
  both relative ("in 6d") and absolute ("Sun 25 Oct, 11:59pm"),
  expandable description, link chips (open in new tab,
  `rel="noopener noreferrer"`), a sync indicator:
  - ✓ `synced` (muted),
  - ⟳ `pending` (spinner-ish), 
  - ⚠ `error` — the `sync_error` text in a `title` tooltip, plus a
    "Retry" button that re-`PUT`s the row.
  - Completed checkbox → strikethrough, row sinks below active items.
- **Add / Edit form** (inline, not a modal): `kind` select, `title`
  text, `due` date input + optional time input, `description` textarea,
  and a repeatable list of `{label, url}` link rows with add/remove.
  "Save" `POST`s or `PUT`s; the list refetches. Edit opens the same form
  pre-filled in place of the row.
- **Delete:** an inline two-step confirm ("Delete? · yes / no") — no
  `window.confirm`, per the browser-dialog constraint.
- **Empty state** per course: "No items yet — add your first assignment,
  presentation, or viva."

### Home surfacing — `home-api.ts` + `HomeApp.tsx`

- `home-api.ts` adds module items to the aggregated `DueItem[]`:
  not `completed`, `due_at` within the same look-ahead window the other
  sources use, `source: "module-item"`, `course` set, `linkId: id`.
- `HomeApp.tsx` `onNavigate` maps `source === "module-item"` to
  `setTab("exam")` with a deep link that scrolls the planner to that
  item (`{ tab: "exam", moduleItemId: id }` added to the deep-link
  union in `frontend.tsx`).
- The "Due today" / "Overdue" counters pick these up automatically once
  they're in the feed.

## 4. Google Calendar sync engine

### One-time auth — `scripts/gcal-auth.ts`

1. Adam creates a Google Cloud project, enables the Calendar API, and
   creates an **OAuth client ID of type "Desktop app"**, yielding
   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (added to `.env`;
   `.env` is already git-ignored — verify and, if not, add it).
2. `bun scripts/gcal-auth.ts`:
   - starts a throwaway `Bun.serve` on `http://localhost:<port>` for the
     redirect,
   - prints the consent URL for
     `https://accounts.google.com/o/oauth2/v2/auth` with
     `scope=https://www.googleapis.com/auth/calendar.events`,
     `access_type=offline`, `prompt=consent`,
   - on redirect, exchanges `code` at
     `https://oauth2.googleapis.com/token`,
   - appends `GOOGLE_REFRESH_TOKEN=…` to `.env` and exits.
3. Nothing else is interactive ever again.

Scope is deliberately `calendar.events` (per-event write), not full
`calendar`.

### Token handling — `gcal/auth.ts`

- `getAccessToken()` — exchanges the refresh token for an access token
  via `POST https://oauth2.googleapis.com/token`
  (`grant_type=refresh_token`). Caches `{ token, expiresAt }` in module
  scope; returns the cached token until `expiresAt - 60s`.
- Missing `GOOGLE_REFRESH_TOKEN` / `GOOGLE_CLIENT_*` → returns a typed
  `{ ok: false, reason }` (never throws). Callers treat this as a sync
  error with a human message ("Google Calendar not connected — run
  scripts/gcal-auth.ts").
- A `400 invalid_grant` (revoked token) is surfaced the same way.

### Event mapping — `gcal/sync.ts`

`buildEvent(item)` →

- `summary`: `` `${item.course} ${item.kind}: ${item.title}` `` — e.g.
  `COMP5348 presentation: Group Project Presentation`. If
  `item.completed`, prefix `✓ `.
- `start` / `end`: `due_at` and `due_at + 30 min`, both
  `{ dateTime, timeZone: "Australia/Sydney" }` with local
  (non-UTC-suffixed) strings — same convention as the LeetCode sync
  memo.
- `description`: the item description, then a blank line, then each link
  as `label: url` on its own line, then a blank line, then
  `[module-planner]` and a back-link to the Modules tab.
- `reminders`: `{ useDefault: false, overrides: [
  { method: "popup", minutes: 10080 },
  { method: "popup", minutes: 4320 },
  { method: "popup", minutes: 1440 } ] }`. If `item.completed`,
  `overrides: []` (event kept as a record, no nagging).
- `colorId`: per `kind` — a stable map (e.g. viva `"11"` Tomato,
  presentation `"5"` Banana, assignment `"9"` Blueberry, other `"8"`
  Graphite); exact ids finalised in planning.
- `extendedProperties.private`: `{ modulePlannerId: String(item.id) }` —
  a second, self-describing row↔event link used by the reconcile sweep.

### `syncModuleItem(db, item)`

- No `gcal_event_id`:
  `POST https://www.googleapis.com/calendar/v3/calendars/primary/events`
  with `buildEvent(item)`. On `2xx`, `markItemSynced(db, id, resp.id,
  now)`.
- Has `gcal_event_id`:
  `PATCH …/events/{eventId}` with `buildEvent(item)`. On `404`/`410`
  (event deleted in Google), clear `gcal_event_id` and fall through to
  the create path once.
- Any non-2xx (other than the 404-then-recreate case) →
  `markItemSyncError(db, id, message)`.
- Every network call wrapped in try/catch; a thrown error →
  `markItemSyncError`, never propagated.

### `deleteCalendarEvent(eventId)`

`DELETE …/events/{eventId}`. `404` / `410` counted as success. Any other
failure is logged; the caller (DELETE route) still returns `{ ok: true }`
and the orphan is removed by the next reconcile.

### `reconcile(db)` — `POST /api/module-items/sync`

1. For every row from `listItemsNeedingSync(db)`, call
   `syncModuleItem`.
2. `GET …/events?privateExtendedProperty=…` is not reliable for
   discovery of *orphans*, so instead list events with
   `q=[module-planner]` (and/or a dedicated marker) over a bounded time
   window; for any event whose `extendedProperties.private.modulePlannerId`
   has no matching row, `DELETE` it.
3. Return `{ synced, errors, orphansRemoved }`.

`reconcile(db)` is also invoked:
- once on server startup (fire-and-forget, logged),
- from the existing weekly `~/bin/exam-autogen.sh` launchd job (add a
  `curl -X POST localhost:<port>/api/module-items/sync` line, or a
  `bun` one-liner), so a change made while the server was down still
  lands later with no user action.

## 5. Testing

`bun test`, mirroring `announcement-db.test.ts` /
`announcement-api.test.ts`. All Google calls are stubbed via an injected
`fetch` (or a thin `gcalClient` seam) — **no test touches the network.**

- **`module-items-db.test.ts`** — create/list/get/update/toggle/delete;
  `links` JSON round-trip; date-only `due_at` → `T23:59`; ordering
  (`completed ASC, due_at ASC`); `update`/`toggle` reset `sync_state` to
  `pending`; `listItemsNeedingSync` filters correctly; `deleteModuleItem`
  returns the row (with `gcal_event_id`).
- **`module-items-api.test.ts`** — every route; validation failures
  (unknown `course`, bad `kind`, empty `title`, malformed `due_at`,
  non-http `links[].url`) return `400` with no write; **a stubbed sync
  failure still returns `200`/`201`** with `sync_state: "error"`;
  DELETE with a failing calendar delete still returns `{ ok: true }`.
- **`gcal/sync.test.ts`** — create stores the returned id;
  update `PATCH`es the same id; `PATCH` → `404` re-`POST`s and stores a
  new id; delete issues `DELETE`; `410` on delete is success;
  `reminders.overrides` minutes are exactly `[10080, 4320, 1440]`;
  a completed item builds `overrides: []` and a `✓ `-prefixed summary;
  `start.timeZone === "Australia/Sydney"` and the dateTime string is
  local (no `Z`).
- **`gcal/auth.test.ts`** — token cached until near expiry then
  refreshed; missing `GOOGLE_REFRESH_TOKEN` returns
  `{ ok: false, reason }` (no throw); `invalid_grant` maps to the
  "not connected" reason.
- **`gcal-auth.test.ts`** (script) — URL construction (scope,
  `access_type=offline`, `prompt=consent`, redirect port); code→token
  exchange writes `GOOGLE_REFRESH_TOKEN` to a temp env file. The
  interactive browser step is not tested.

## 6. Continuous testing (required by `CLAUDE.md:211`)

This repo currently has **no** save-triggered test hook. This feature
adds one, satisfying the standing requirement:

- **Automated hook:** a `PostToolUse` hook on `Write` / `Edit`
  (`.claude/settings.json` in the repo, or the user's settings — decided
  in planning) that runs on every save the AI makes during
  implementation.
- **Continuous testing:** the hook runs `bun test` and
  `bunx tsc --noEmit`.
- **Autonomous correction:** on a non-zero exit the AI sees the failure
  output immediately and fixes the regression before returning control,
  so the tree is always left green.

The hook is a deliverable of this spec's implementation plan, not an
optional follow-up.

## 7. One-time setup (Adam)

1. Google Cloud Console → new project → enable **Google Calendar API**.
2. **APIs & Services → Credentials → Create credentials → OAuth client
   ID → Desktop app.** Copy the client ID and secret.
3. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID=…
   GOOGLE_CLIENT_SECRET=…
   ```
4. `bun scripts/gcal-auth.ts` → approve in the browser once → it writes
   `GOOGLE_REFRESH_TOKEN` to `.env`.
5. `PORT=4321 bun run dev` — the Modules tab now auto-syncs every change.

A short version of this lives in `docs/` and is linked from the README.

## 8. Open items for planning

- Exact `colorId` values per `kind`.
- The look-ahead window for Home surfacing — match whatever
  `home-api.ts` already uses for `exam`.
- Where the `PostToolUse` hook is configured (repo `.claude/settings.json`
  vs user settings).
- Whether the reconcile marker is `[module-planner]` in the description
  or a dedicated `extendedProperties` key only (affects orphan-discovery
  query).
- Deep-link scroll target mechanics on the Modules tab
  (`moduleItemId` in the deep-link union).
