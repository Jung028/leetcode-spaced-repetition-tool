# Module Planner with Unattended Google Calendar Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-course list of graded deliverables (assignment / presentation / viva) with add-edit-delete in the Modules tab, and push every change unattended to Google Calendar as a timed event with 1-week / 3-day / 1-day popup reminders.

**Architecture:** A new `module_items` SQLite table with an announcements-style DB + API layer. Each mutating API route, after its DB write, calls a server-side Google Calendar sync (`gcal/sync.ts`) that creates / patches / deletes a calendar event and records the event id back on the row. Auth is a stored OAuth2 refresh token (`gcal/auth.ts`), obtained once via `scripts/gcal-auth.ts`. Sync failures are non-fatal — the row saves, is marked `error`, and a reconcile sweep (on startup, on demand, and from the weekly launchd job) retries. The frontend adds a `ModulePlanner` panel to the Modules tab and a new `module-item` due source to the Home dashboard.

**Tech Stack:** Bun, `bun:sqlite`, `Bun.serve` routes, React 19 (Bun HTML imports, no Vite), `bun test`. Google Calendar REST v3 via raw `fetch` (no `googleapis` / OAuth library).

**Spec:** `docs/superpowers/specs/2026-09-07-module-planner-calendar-sync-design.md`

## Global Constraints

- Runtime is **Bun**. Use `bun test`, `bun <file>`, `Bun.serve`, `bun:sqlite`. Never add `node_modules` deps for this feature — all Google calls are raw `fetch`.
- Bun auto-loads `.env`; **do not** add or use `dotenv`.
- `.env` is already git-ignored (`.gitignore` line `.env`). Secrets (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`) live only there.
- Course codes are exactly `INFO5995`, `COMP5348`, `INFO6007`, `INFO5990` — validate against `COURSE_NAMES` from `semester-deadlines.ts`.
- Reminder offsets are exactly **10080, 4320, 1440** minutes (1 week, 3 days, 1 day), `method: "popup"`.
- Calendar event times are **local wall-clock strings** (`YYYY-MM-DDTHH:MM:SS`, no `Z`) with `timeZone: "Australia/Sydney"` sent separately — matches the existing LeetCode-sync convention.
- `due_at` is stored as `YYYY-MM-DDTHH:MM`; a date-only input (`YYYY-MM-DD`) is normalised to `…T23:59`.
- Sync is **never fatal**: a CRUD route returns the saved row (HTTP 200/201) even when the calendar call fails; the row carries `sync_state: "error"` and `sync_error`.
- Sync is **one-way** (app → calendar). Never read Google event edits back.
- Follow existing file patterns: `announcement-db.ts` / `announcement-api.ts` / `announcement-db.test.ts` / `announcement-api.test.ts` are the reference shape. `Response.json(data, { status })` for responses.
- The Modules tab is internally the `exam` tab (`Tab = "…" | "exam" | …`). Its display name is "Modules".

---

## Task 1: Continuous-testing hook

**Files:**
- Create: `.claude/settings.json`
- Reference: `CLAUDE.md:211` (the standing requirement this satisfies)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing importable. A `PostToolUse` hook that runs `bun test` + `bunx tsc --noEmit` after every `Write`/`Edit` the implementer makes.

> **Note for the implementer:** during Tasks 2-10 the hook will report the *intentional* red-phase failure right after each "write the failing test" step. That is correct TDD, not a regression. The hook's job is to catch **accidental** breakage of tests that were previously green — if a step other than a fresh "write failing test" step turns the suite red, stop and fix it before moving on.

- [ ] **Step 1: Create the hook config**

Create `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "cd \"$CLAUDE_PROJECT_DIR\" && bun test 2>&1 | tail -40; bunx tsc --noEmit 2>&1 | tail -40"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Verify the hook fires**

Make a trivial whitespace edit to any existing file (e.g. add then remove a blank line in `README.md`) and confirm the hook output (a `bun test` summary + `tsc` result) appears in the transcript.
Expected: `bun test` reports the current suite green; `tsc --noEmit` prints nothing (exit 0).

- [ ] **Step 3: Commit**

```bash
git add .claude/settings.json
git commit -m "chore: add PostToolUse hook running bun test + tsc on every save"
```

---

## Task 2: `module_items` table and DB helpers

**Files:**
- Create: `module-items-db.ts`
- Test: `module-items-db.test.ts`

**Interfaces:**
- Consumes: `bun:sqlite` `Database`.
- Produces:
  - `type ModuleItemKind = "assignment" | "presentation" | "viva" | "other"`
  - `const MODULE_ITEM_KINDS: ModuleItemKind[]`
  - `interface ModuleItemLink { label: string; url: string }`
  - `type SyncState = "pending" | "synced" | "error"`
  - `interface ModuleItem { id: number; course: string; kind: ModuleItemKind; title: string; description: string; due_at: string; links: ModuleItemLink[]; completed: boolean; gcal_event_id: string | null; sync_state: SyncState; sync_error: string | null; synced_at: string | null; created_at: string; updated_at: string }`
  - `interface ModuleItemInput { course: string; kind: ModuleItemKind; title: string; description?: string; due_at: string; links?: ModuleItemLink[] }`
  - `function normalizeDueAt(input: string): string`
  - `function migrateModuleItems(db: Database): void`
  - `function createModuleItem(db: Database, input: ModuleItemInput, today: string): ModuleItem`
  - `function listModuleItems(db: Database): ModuleItem[]`
  - `function getModuleItem(db: Database, id: number): ModuleItem | null`
  - `function updateModuleItem(db: Database, id: number, input: ModuleItemInput, today: string): ModuleItem | null`
  - `function toggleModuleItem(db: Database, id: number, today: string): ModuleItem | null`
  - `function deleteModuleItem(db: Database, id: number): ModuleItem | null`
  - `function markItemSynced(db: Database, id: number, eventId: string, now: string): void`
  - `function markItemSyncError(db: Database, id: number, message: string): void`
  - `function listItemsNeedingSync(db: Database): ModuleItem[]`

- [ ] **Step 1: Write the failing test**

Create `module-items-db.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModuleItems,
  createModuleItem,
  listModuleItems,
  getModuleItem,
  updateModuleItem,
  toggleModuleItem,
  deleteModuleItem,
  markItemSynced,
  markItemSyncError,
  listItemsNeedingSync,
  normalizeDueAt,
  type ModuleItemInput,
} from "./module-items-db";

const TODAY = "2026-09-07";
let db: Database;

const base: ModuleItemInput = {
  course: "COMP5348",
  kind: "assignment",
  title: "Assignment 1",
  description: "Paper-based exercises on Weeks 1-6.",
  due_at: "2026-09-20",
  links: [{ label: "Brief", url: "https://canvas.example/brief" }],
};

beforeEach(() => {
  db = new Database(":memory:");
  migrateModuleItems(db);
});

test("normalizeDueAt expands a date to 23:59 and passes a datetime through", () => {
  expect(normalizeDueAt("2026-09-20")).toBe("2026-09-20T23:59");
  expect(normalizeDueAt("2026-09-20T09:00")).toBe("2026-09-20T09:00");
  expect(() => normalizeDueAt("nonsense")).toThrow();
});

test("createModuleItem stores fields, defaults, and starts pending", () => {
  const item = createModuleItem(db, base, TODAY);
  expect(item.course).toBe("COMP5348");
  expect(item.kind).toBe("assignment");
  expect(item.title).toBe("Assignment 1");
  expect(item.due_at).toBe("2026-09-20T23:59");
  expect(item.links).toEqual([{ label: "Brief", url: "https://canvas.example/brief" }]);
  expect(item.completed).toBe(false);
  expect(item.gcal_event_id).toBeNull();
  expect(item.sync_state).toBe("pending");
  expect(item.created_at).toBe(TODAY);
  expect(item.updated_at).toBe(TODAY);
});

test("createModuleItem defaults description to '' and links to []", () => {
  const item = createModuleItem(db, { course: "INFO5995", kind: "viva", title: "Oral", due_at: "2026-10-01T14:00" }, TODAY);
  expect(item.description).toBe("");
  expect(item.links).toEqual([]);
});

test("migrateModuleItems is idempotent", () => {
  createModuleItem(db, base, TODAY);
  migrateModuleItems(db);
  expect(listModuleItems(db).length).toBe(1);
});

test("listModuleItems orders incomplete before complete, then by due_at ascending", () => {
  const a = createModuleItem(db, { ...base, title: "later", due_at: "2026-11-01" }, TODAY);
  const b = createModuleItem(db, { ...base, title: "sooner", due_at: "2026-09-10" }, TODAY);
  createModuleItem(db, { ...base, title: "done-soonest", due_at: "2026-09-01" }, TODAY);
  toggleModuleItem(db, 3, TODAY);
  expect(listModuleItems(db).map((i) => i.title)).toEqual(["sooner", "later", "done-soonest"]);
  expect([a.id, b.id]).toEqual([1, 2]);
});

test("updateModuleItem changes fields, bumps updated_at, resets sync to pending", () => {
  const item = createModuleItem(db, base, TODAY);
  markItemSynced(db, item.id, "evt_1", "2026-09-07T10:00:00");
  const updated = updateModuleItem(db, item.id, { ...base, title: "Assignment 1 (revised)", due_at: "2026-09-21" }, "2026-09-08")!;
  expect(updated.title).toBe("Assignment 1 (revised)");
  expect(updated.due_at).toBe("2026-09-21T23:59");
  expect(updated.updated_at).toBe("2026-09-08");
  expect(updated.created_at).toBe(TODAY);
  expect(updated.sync_state).toBe("pending");
  expect(updated.sync_error).toBeNull();
  expect(updated.gcal_event_id).toBe("evt_1");
});

test("updateModuleItem on unknown id returns null", () => {
  expect(updateModuleItem(db, 9999, base, TODAY)).toBeNull();
});

test("toggleModuleItem flips completed and resets sync to pending", () => {
  const item = createModuleItem(db, base, TODAY);
  markItemSynced(db, item.id, "evt_1", "2026-09-07T10:00:00");
  const done = toggleModuleItem(db, item.id, "2026-09-09")!;
  expect(done.completed).toBe(true);
  expect(done.sync_state).toBe("pending");
  expect(done.updated_at).toBe("2026-09-09");
  const undone = toggleModuleItem(db, item.id, "2026-09-10")!;
  expect(undone.completed).toBe(false);
});

test("deleteModuleItem returns the deleted row (with event id) then removes it", () => {
  const item = createModuleItem(db, base, TODAY);
  markItemSynced(db, item.id, "evt_42", "2026-09-07T10:00:00");
  const deleted = deleteModuleItem(db, item.id)!;
  expect(deleted.gcal_event_id).toBe("evt_42");
  expect(getModuleItem(db, item.id)).toBeNull();
  expect(deleteModuleItem(db, item.id)).toBeNull();
});

test("markItemSynced / markItemSyncError set state, and listItemsNeedingSync filters", () => {
  const a = createModuleItem(db, base, TODAY);
  const b = createModuleItem(db, { ...base, title: "B" }, TODAY);
  const c = createModuleItem(db, { ...base, title: "C" }, TODAY);
  markItemSynced(db, a.id, "evt_a", "2026-09-07T10:00:00");
  markItemSyncError(db, b.id, "Calendar create failed (503)");
  const needing = listItemsNeedingSync(db).map((i) => i.title).sort();
  expect(needing).toEqual(["Assignment 1".replace("Assignment 1", "Assignment 1"), "B", "C"].filter((t) => t !== "Assignment 1"));
  expect(getModuleItem(db, a.id)!.sync_state).toBe("synced");
  expect(getModuleItem(db, a.id)!.synced_at).toBe("2026-09-07T10:00:00");
  expect(getModuleItem(db, b.id)!.sync_state).toBe("error");
  expect(getModuleItem(db, b.id)!.sync_error).toBe("Calendar create failed (503)");
  expect(getModuleItem(db, c.id)!.sync_state).toBe("pending");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test module-items-db.test.ts`
Expected: FAIL — `Cannot find module './module-items-db'`.

- [ ] **Step 3: Write the implementation**

Create `module-items-db.ts`:

```ts
import type { Database } from "bun:sqlite";

export type ModuleItemKind = "assignment" | "presentation" | "viva" | "other";
export const MODULE_ITEM_KINDS: ModuleItemKind[] = ["assignment", "presentation", "viva", "other"];

export interface ModuleItemLink {
  label: string;
  url: string;
}

export type SyncState = "pending" | "synced" | "error";

export interface ModuleItem {
  id: number;
  course: string;
  kind: ModuleItemKind;
  title: string;
  description: string;
  due_at: string; // 'YYYY-MM-DDTHH:MM'
  links: ModuleItemLink[];
  completed: boolean;
  gcal_event_id: string | null;
  sync_state: SyncState;
  sync_error: string | null;
  synced_at: string | null;
  created_at: string; // local 'YYYY-MM-DD'
  updated_at: string; // local 'YYYY-MM-DD'
}

export interface ModuleItemInput {
  course: string;
  kind: ModuleItemKind;
  title: string;
  description?: string;
  due_at: string; // date or datetime; normalised on write
  links?: ModuleItemLink[];
}

interface ModuleItemRow {
  id: number;
  course: string;
  kind: string;
  title: string;
  description: string;
  due_at: string;
  links: string;
  completed: number;
  gcal_event_id: string | null;
  sync_state: string;
  sync_error: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function normalizeDueAt(input: string): string {
  if (DATE_ONLY.test(input)) return `${input}T23:59`;
  if (DATE_TIME.test(input)) return input;
  throw new Error("due_at must be YYYY-MM-DD or YYYY-MM-DDTHH:MM");
}

const toModuleItem = (row: ModuleItemRow): ModuleItem => ({
  id: row.id,
  course: row.course,
  kind: row.kind as ModuleItemKind,
  title: row.title,
  description: row.description,
  due_at: row.due_at,
  links: JSON.parse(row.links) as ModuleItemLink[],
  completed: row.completed === 1,
  gcal_event_id: row.gcal_event_id,
  sync_state: row.sync_state as SyncState,
  sync_error: row.sync_error,
  synced_at: row.synced_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function migrateModuleItems(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_at TEXT NOT NULL,
      links TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      gcal_event_id TEXT,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      sync_error TEXT,
      synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function createModuleItem(db: Database, input: ModuleItemInput, today: string): ModuleItem {
  const row = db
    .query(
      `INSERT INTO module_items (course, kind, title, description, due_at, links, completed, sync_state, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?) RETURNING *`,
    )
    .get(
      input.course,
      input.kind,
      input.title,
      input.description ?? "",
      normalizeDueAt(input.due_at),
      JSON.stringify(input.links ?? []),
      today,
      today,
    ) as ModuleItemRow;
  return toModuleItem(row);
}

export function listModuleItems(db: Database): ModuleItem[] {
  return (
    db
      .query(`SELECT * FROM module_items ORDER BY completed ASC, due_at ASC, id ASC`)
      .all() as ModuleItemRow[]
  ).map(toModuleItem);
}

export function getModuleItem(db: Database, id: number): ModuleItem | null {
  const row = db.query(`SELECT * FROM module_items WHERE id = ?`).get(id) as ModuleItemRow | null;
  return row ? toModuleItem(row) : null;
}

export function updateModuleItem(
  db: Database,
  id: number,
  input: ModuleItemInput,
  today: string,
): ModuleItem | null {
  const row = db
    .query(
      `UPDATE module_items
          SET course = ?, kind = ?, title = ?, description = ?, due_at = ?, links = ?,
              sync_state = 'pending', sync_error = NULL, updated_at = ?
        WHERE id = ? RETURNING *`,
    )
    .get(
      input.course,
      input.kind,
      input.title,
      input.description ?? "",
      normalizeDueAt(input.due_at),
      JSON.stringify(input.links ?? []),
      today,
      id,
    ) as ModuleItemRow | null;
  return row ? toModuleItem(row) : null;
}

export function toggleModuleItem(db: Database, id: number, today: string): ModuleItem | null {
  const current = db.query(`SELECT completed FROM module_items WHERE id = ?`).get(id) as
    | { completed: number }
    | null;
  if (!current) return null;
  const row = db
    .query(
      `UPDATE module_items
          SET completed = ?, sync_state = 'pending', sync_error = NULL, updated_at = ?
        WHERE id = ? RETURNING *`,
    )
    .get(current.completed === 0 ? 1 : 0, today, id) as ModuleItemRow;
  return toModuleItem(row);
}

export function deleteModuleItem(db: Database, id: number): ModuleItem | null {
  const row = db
    .query(`DELETE FROM module_items WHERE id = ? RETURNING *`)
    .get(id) as ModuleItemRow | null;
  return row ? toModuleItem(row) : null;
}

export function markItemSynced(db: Database, id: number, eventId: string, now: string): void {
  db.query(
    `UPDATE module_items
        SET gcal_event_id = ?, sync_state = 'synced', sync_error = NULL, synced_at = ?
      WHERE id = ?`,
  ).run(eventId, now, id);
}

export function markItemSyncError(db: Database, id: number, message: string): void {
  db.query(`UPDATE module_items SET sync_state = 'error', sync_error = ? WHERE id = ?`).run(message, id);
}

export function listItemsNeedingSync(db: Database): ModuleItem[] {
  return (
    db
      .query(`SELECT * FROM module_items WHERE sync_state != 'synced' ORDER BY id ASC`)
      .all() as ModuleItemRow[]
  ).map(toModuleItem);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test module-items-db.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add module-items-db.ts module-items-db.test.ts
git commit -m "feat: module_items table and DB helpers"
```

---

## Task 3: Google OAuth token provider (`gcal/auth.ts`)

**Files:**
- Create: `gcal/auth.ts`
- Test: `gcal/auth.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `interface TokenOk { ok: true; token: string }`
  - `interface TokenErr { ok: false; reason: string }`
  - `type TokenResult = TokenOk | TokenErr`
  - `interface AuthEnv { clientId?: string; clientSecret?: string; refreshToken?: string }`
  - `interface AuthDeps { fetch?: typeof fetch; now?: () => number; env?: AuthEnv }`
  - `function createTokenProvider(deps?: AuthDeps): () => Promise<TokenResult>`
  - `const getAccessToken: () => Promise<TokenResult>` (production singleton, reads `process.env`)

- [ ] **Step 1: Write the failing test**

Create `gcal/auth.test.ts`:

```ts
import { test, expect } from "bun:test";
import { createTokenProvider } from "./auth";

const FULL_ENV = { clientId: "cid", clientSecret: "sec", refreshToken: "rt" };

function stubFetch(responses: Array<{ status: number; body: unknown }>) {
  let call = 0;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fn = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    const r = responses[Math.min(call, responses.length - 1)]!;
    call += 1;
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { fn, calls, get callCount() { return call; } };
}

test("returns an error result when credentials are missing (never throws)", async () => {
  const provider = createTokenProvider({ env: {}, fetch: stubFetch([]).fn });
  const res = await provider();
  expect(res.ok).toBe(false);
  if (!res.ok) expect(res.reason).toContain("gcal-auth.ts");
});

test("exchanges the refresh token and returns the access token", async () => {
  const f = stubFetch([{ status: 200, body: { access_token: "at_1", expires_in: 3600 } }]);
  const provider = createTokenProvider({ env: FULL_ENV, fetch: f.fn, now: () => 0 });
  const res = await provider();
  expect(res).toEqual({ ok: true, token: "at_1" });
  expect(f.calls[0]!.url).toBe("https://oauth2.googleapis.com/token");
  expect(f.calls[0]!.init!.method).toBe("POST");
});

test("caches the token until ~60s before expiry, then refreshes", async () => {
  const f = stubFetch([
    { status: 200, body: { access_token: "at_1", expires_in: 3600 } },
    { status: 200, body: { access_token: "at_2", expires_in: 3600 } },
  ]);
  let clock = 0;
  const provider = createTokenProvider({ env: FULL_ENV, fetch: f.fn, now: () => clock });
  expect(await provider()).toEqual({ ok: true, token: "at_1" });
  clock = 3600_000 - 61_000; // still inside the cache window
  expect(await provider()).toEqual({ ok: true, token: "at_1" });
  expect(f.callCount).toBe(1);
  clock = 3600_000 - 59_000; // past the 60s guard
  expect(await provider()).toEqual({ ok: true, token: "at_2" });
  expect(f.callCount).toBe(2);
});

test("maps invalid_grant to a re-auth message", async () => {
  const f = stubFetch([{ status: 400, body: { error: "invalid_grant" } }]);
  const provider = createTokenProvider({ env: FULL_ENV, fetch: f.fn, now: () => 0 });
  const res = await provider();
  expect(res.ok).toBe(false);
  if (!res.ok) expect(res.reason).toContain("re-run");
});

test("maps a network throw to an error result", async () => {
  const provider = createTokenProvider({
    env: FULL_ENV,
    now: () => 0,
    fetch: (async () => { throw new Error("boom"); }) as unknown as typeof fetch,
  });
  const res = await provider();
  expect(res.ok).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test gcal/auth.test.ts`
Expected: FAIL — `Cannot find module './auth'`.

- [ ] **Step 3: Write the implementation**

Create `gcal/auth.ts`:

```ts
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REFRESH_GUARD_MS = 60_000;

export interface TokenOk {
  ok: true;
  token: string;
}
export interface TokenErr {
  ok: false;
  reason: string;
}
export type TokenResult = TokenOk | TokenErr;

export interface AuthEnv {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface AuthDeps {
  fetch?: typeof fetch;
  now?: () => number;
  env?: AuthEnv;
}

const NOT_CONNECTED =
  "Google Calendar not connected — run: bun scripts/gcal-auth.ts";
const REAUTH =
  "Google Calendar authorisation expired — re-run: bun scripts/gcal-auth.ts";

export function createTokenProvider(deps: AuthDeps = {}): () => Promise<TokenResult> {
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const env: AuthEnv =
    deps.env ?? {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };

  let cache: { token: string; expiresAt: number } | null = null;

  return async function getToken(): Promise<TokenResult> {
    if (!env.clientId || !env.clientSecret || !env.refreshToken) {
      return { ok: false, reason: NOT_CONNECTED };
    }
    if (cache && now() < cache.expiresAt - REFRESH_GUARD_MS) {
      return { ok: true, token: cache.token };
    }
    try {
      const res = await doFetch(TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.clientId,
          client_secret: env.clientSecret,
          refresh_token: env.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      });
      const data = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        expires_in?: number;
        error?: string;
      };
      if (!res.ok || !data.access_token) {
        if (data.error === "invalid_grant") return { ok: false, reason: REAUTH };
        return { ok: false, reason: `Google token refresh failed (${res.status})` };
      }
      cache = {
        token: data.access_token,
        expiresAt: now() + (data.expires_in ?? 3600) * 1000,
      };
      return { ok: true, token: data.access_token };
    } catch (err) {
      return {
        ok: false,
        reason: err instanceof Error ? `Google token endpoint unreachable (${err.message})` : "Google token endpoint unreachable",
      };
    }
  };
}

export const getAccessToken = createTokenProvider();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test gcal/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add gcal/auth.ts gcal/auth.test.ts
git commit -m "feat: Google OAuth token provider with caching"
```

---

## Task 4: Calendar sync engine (`gcal/sync.ts`)

**Files:**
- Create: `gcal/sync.ts`
- Test: `gcal/sync.test.ts`

**Interfaces:**
- Consumes: `ModuleItem`, `listModuleItems`, `listItemsNeedingSync`, `getModuleItem`, `markItemSynced`, `markItemSyncError` from `../module-items-db`; `TokenResult`, `createTokenProvider` from `./auth`; `courseNameFor` is **not** needed (summary uses the raw code).
- Produces:
  - `interface SyncDeps { fetch?: typeof fetch; getToken?: () => Promise<TokenResult>; appBaseUrl?: string }`
  - `function addMinutesToLocalStamp(stamp: string, minutes: number): string`
  - `function buildEvent(item: ModuleItem, appBaseUrl?: string): GoogleEventBody` where `GoogleEventBody` is the object literal shown below (export the type too)
  - `async function syncModuleItem(db: Database, item: ModuleItem, deps?: SyncDeps): Promise<ModuleItem | null>` — re-reads and returns the row after updating its sync columns
  - `async function deleteCalendarEvent(eventId: string, deps?: SyncDeps): Promise<{ ok: boolean; error?: string }>`
  - `async function reconcile(db: Database, deps?: SyncDeps): Promise<{ synced: number; errors: number; orphansRemoved: number }>`

- [ ] **Step 1: Write the failing test**

Create `gcal/sync.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModuleItems,
  createModuleItem,
  getModuleItem,
  markItemSynced,
  type ModuleItemInput,
} from "../module-items-db";
import { buildEvent, syncModuleItem, deleteCalendarEvent, reconcile, addMinutesToLocalStamp } from "./sync";

const TODAY = "2026-09-07";
const okToken = async () => ({ ok: true as const, token: "at_test" });

const input: ModuleItemInput = {
  course: "COMP5348",
  kind: "presentation",
  title: "Group Project Presentation",
  description: "Week 13 slot.",
  due_at: "2026-11-08T23:59",
  links: [{ label: "Rubric", url: "https://canvas.example/rubric" }],
};

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  migrateModuleItems(db);
});

function recorder(script: Array<{ status: number; body?: unknown }>) {
  const calls: Array<{ url: string; method: string; body?: any }> = [];
  let i = 0;
  const fn = (async (url: string, init?: RequestInit) => {
    const step = script[Math.min(i, script.length - 1)]!;
    i += 1;
    calls.push({
      url: String(url),
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response(step.body === undefined ? "" : JSON.stringify(step.body), { status: step.status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

test("addMinutesToLocalStamp adds minutes with hour/day rollover", () => {
  expect(addMinutesToLocalStamp("2026-11-08T23:59", 30)).toBe("2026-11-09T00:29:00");
  expect(addMinutesToLocalStamp("2026-11-08T09:00", 30)).toBe("2026-11-08T09:30:00");
});

test("buildEvent sets summary, Sydney local times, colour, marker, and the three reminders", () => {
  const item = createModuleItem(db, input, TODAY);
  const ev = buildEvent(item, "http://localhost:3005");
  expect(ev.summary).toBe("COMP5348 presentation: Group Project Presentation");
  expect(ev.start).toEqual({ dateTime: "2026-11-08T23:59:00", timeZone: "Australia/Sydney" });
  expect(ev.end).toEqual({ dateTime: "2026-11-09T00:29:00", timeZone: "Australia/Sydney" });
  expect(ev.reminders).toEqual({
    useDefault: false,
    overrides: [
      { method: "popup", minutes: 10080 },
      { method: "popup", minutes: 4320 },
      { method: "popup", minutes: 1440 },
    ],
  });
  expect(ev.description).toContain("Rubric: https://canvas.example/rubric");
  expect(ev.description).toContain("[module-planner]");
  expect(ev.extendedProperties.private.modulePlannerId).toBe(String(item.id));
  expect(typeof ev.colorId).toBe("string");
});

test("buildEvent for a completed item drops reminders and prefixes the summary", () => {
  const item = createModuleItem(db, input, TODAY);
  const done = { ...item, completed: true };
  const ev = buildEvent(done);
  expect(ev.summary.startsWith("✓ ")).toBe(true);
  expect(ev.reminders.overrides).toEqual([]);
});

test("syncModuleItem creates an event and stores the returned id", async () => {
  const item = createModuleItem(db, input, TODAY);
  const rec = recorder([{ status: 200, body: { id: "evt_new" } }]);
  const result = await syncModuleItem(db, item, { fetch: rec.fn, getToken: okToken });
  expect(rec.calls[0]!.method).toBe("POST");
  expect(rec.calls[0]!.url).toBe("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  expect(result!.gcal_event_id).toBe("evt_new");
  expect(result!.sync_state).toBe("synced");
  expect(getModuleItem(db, item.id)!.gcal_event_id).toBe("evt_new");
});

test("syncModuleItem patches an existing event id", async () => {
  const item = createModuleItem(db, input, TODAY);
  markItemSynced(db, item.id, "evt_exist", "2026-09-07T10:00:00");
  const rec = recorder([{ status: 200, body: { id: "evt_exist" } }]);
  await syncModuleItem(db, getModuleItem(db, item.id)!, { fetch: rec.fn, getToken: okToken });
  expect(rec.calls[0]!.method).toBe("PATCH");
  expect(rec.calls[0]!.url).toBe("https://www.googleapis.com/calendar/v3/calendars/primary/events/evt_exist");
});

test("syncModuleItem re-creates when PATCH returns 404", async () => {
  const item = createModuleItem(db, input, TODAY);
  markItemSynced(db, item.id, "evt_gone", "2026-09-07T10:00:00");
  const rec = recorder([
    { status: 404, body: { error: { message: "Not Found" } } },
    { status: 200, body: { id: "evt_fresh" } },
  ]);
  const result = await syncModuleItem(db, getModuleItem(db, item.id)!, { fetch: rec.fn, getToken: okToken });
  expect(rec.calls.map((c) => c.method)).toEqual(["PATCH", "POST"]);
  expect(result!.gcal_event_id).toBe("evt_fresh");
  expect(result!.sync_state).toBe("synced");
});

test("syncModuleItem marks the row error (not throwing) on a 5xx", async () => {
  const item = createModuleItem(db, input, TODAY);
  const rec = recorder([{ status: 503, body: {} }]);
  const result = await syncModuleItem(db, item, { fetch: rec.fn, getToken: okToken });
  expect(result!.sync_state).toBe("error");
  expect(result!.sync_error).toContain("503");
});

test("syncModuleItem marks the row error when the token provider fails", async () => {
  const item = createModuleItem(db, input, TODAY);
  const result = await syncModuleItem(db, item, {
    fetch: recorder([]).fn,
    getToken: async () => ({ ok: false as const, reason: "not connected" }),
  });
  expect(result!.sync_state).toBe("error");
  expect(result!.sync_error).toBe("not connected");
});

test("deleteCalendarEvent treats 410/404 as success", async () => {
  const rec = recorder([{ status: 410, body: {} }]);
  expect(await deleteCalendarEvent("evt_x", { fetch: rec.fn, getToken: okToken })).toEqual({ ok: true });
  expect(rec.calls[0]!.method).toBe("DELETE");
});

test("reconcile retries pending rows and removes orphan events", async () => {
  const keep = createModuleItem(db, input, TODAY);
  // one pending row -> POST creates it; then the orphan sweep lists events and
  // finds an event whose modulePlannerId has no row -> DELETE.
  const rec = recorder([
    { status: 200, body: { id: "evt_keep" } }, // POST for `keep`
    {
      status: 200,
      body: {
        items: [
          { id: "evt_keep", extendedProperties: { private: { modulePlannerId: String(keep.id) } } },
          { id: "evt_orphan", extendedProperties: { private: { modulePlannerId: "9999" } } },
        ],
      },
    }, // events.list
    { status: 204, body: {} }, // DELETE evt_orphan
  ]);
  const summary = await reconcile(db, { fetch: rec.fn, getToken: okToken });
  expect(summary.synced).toBe(1);
  expect(summary.orphansRemoved).toBe(1);
  expect(rec.calls.some((c) => c.method === "DELETE" && c.url.endsWith("/evt_orphan"))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test gcal/sync.test.ts`
Expected: FAIL — `Cannot find module './sync'`.

- [ ] **Step 3: Write the implementation**

Create `gcal/sync.ts`:

```ts
import type { Database } from "bun:sqlite";
import type { ModuleItem, ModuleItemKind } from "../module-items-db";
import {
  getModuleItem,
  listModuleItems,
  listItemsNeedingSync,
  markItemSynced,
  markItemSyncError,
} from "../module-items-db";
import { getAccessToken, type TokenResult } from "./auth";

const CALENDAR_ID = "primary";
const EVENTS_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
const MARKER = "[module-planner]";
const TIME_ZONE = "Australia/Sydney";
const DEFAULT_BASE_URL = "http://localhost:3005";

const REMINDER_MINUTES = [10080, 4320, 1440] as const; // 1 week / 3 days / 1 day

const COLOR_BY_KIND: Record<ModuleItemKind, string> = {
  viva: "11", // Tomato
  presentation: "5", // Banana
  assignment: "9", // Blueberry
  other: "8", // Graphite
};

export interface SyncDeps {
  fetch?: typeof fetch;
  getToken?: () => Promise<TokenResult>;
  appBaseUrl?: string;
}

export interface GoogleEventBody {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  colorId: string;
  reminders: { useDefault: false; overrides: Array<{ method: "popup"; minutes: number }> };
  extendedProperties: { private: { modulePlannerId: string } };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function addMinutesToLocalStamp(stamp: string, minutes: number): string {
  const [date, time] = stamp.split("T");
  const [y, m, d] = date!.split("-").map(Number) as [number, number, number];
  const [hh, mm] = time!.split(":").map(Number) as [number, number];
  const dt = new Date(y, m - 1, d, hh, mm + minutes);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(
    dt.getMinutes(),
  )}:00`;
}

export function buildEvent(item: ModuleItem, appBaseUrl: string = DEFAULT_BASE_URL): GoogleEventBody {
  const linkLines = item.links.map((l) => `${l.label || "Link"}: ${l.url}`).join("\n");
  const description = [
    item.description.trim(),
    linkLines,
    `${MARKER} · ${appBaseUrl}/?tab=modules&item=${item.id}`,
  ]
    .filter((part) => part.length > 0)
    .join("\n\n");

  return {
    summary: `${item.completed ? "✓ " : ""}${item.course} ${item.kind}: ${item.title}`,
    description,
    start: { dateTime: `${item.due_at}:00`, timeZone: TIME_ZONE },
    end: { dateTime: addMinutesToLocalStamp(item.due_at, 30), timeZone: TIME_ZONE },
    colorId: COLOR_BY_KIND[item.kind],
    reminders: {
      useDefault: false,
      overrides: item.completed
        ? []
        : REMINDER_MINUTES.map((minutes) => ({ method: "popup" as const, minutes })),
    },
    extendedProperties: { private: { modulePlannerId: String(item.id) } },
  };
}

function nowStamp(): string {
  return new Date().toISOString().slice(0, 19);
}

async function resolveToken(deps: SyncDeps): Promise<TokenResult> {
  return (deps.getToken ?? getAccessToken)();
}

export async function syncModuleItem(
  db: Database,
  item: ModuleItem,
  deps: SyncDeps = {},
): Promise<ModuleItem | null> {
  const doFetch = deps.fetch ?? fetch;
  const tok = await resolveToken(deps);
  if (!tok.ok) {
    markItemSyncError(db, item.id, tok.reason);
    return getModuleItem(db, item.id);
  }
  const headers = {
    authorization: `Bearer ${tok.token}`,
    "content-type": "application/json",
  };
  const body = JSON.stringify(buildEvent(item, deps.appBaseUrl));

  try {
    if (item.gcal_event_id) {
      const res = await doFetch(`${EVENTS_URL}/${item.gcal_event_id}`, { method: "PATCH", headers, body });
      if (res.status !== 404 && res.status !== 410) {
        if (!res.ok) {
          markItemSyncError(db, item.id, `Calendar update failed (${res.status})`);
          return getModuleItem(db, item.id);
        }
        markItemSynced(db, item.id, item.gcal_event_id, nowStamp());
        return getModuleItem(db, item.id);
      }
      // fall through: event was deleted in Google — recreate it
    }

    const res = await doFetch(EVENTS_URL, { method: "POST", headers, body });
    if (!res.ok) {
      markItemSyncError(db, item.id, `Calendar create failed (${res.status})`);
      return getModuleItem(db, item.id);
    }
    const created = (await res.json()) as { id: string };
    markItemSynced(db, item.id, created.id, nowStamp());
    return getModuleItem(db, item.id);
  } catch (err) {
    markItemSyncError(db, item.id, err instanceof Error ? err.message : "Calendar sync error");
    return getModuleItem(db, item.id);
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  deps: SyncDeps = {},
): Promise<{ ok: boolean; error?: string }> {
  const doFetch = deps.fetch ?? fetch;
  const tok = await resolveToken(deps);
  if (!tok.ok) return { ok: false, error: tok.reason };
  try {
    const res = await doFetch(`${EVENTS_URL}/${eventId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${tok.token}` },
    });
    if (res.ok || res.status === 404 || res.status === 410) return { ok: true };
    return { ok: false, error: `Calendar delete failed (${res.status})` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Calendar delete error" };
  }
}

interface CalendarEvent {
  id: string;
  extendedProperties?: { private?: Record<string, string> };
}

async function listPlannerEvents(doFetch: typeof fetch, token: string): Promise<CalendarEvent[]> {
  const out: CalendarEvent[] = [];
  const year = new Date().getFullYear();
  const timeMin = new Date(year - 1, 0, 1).toISOString();
  const timeMax = new Date(year + 2, 0, 1).toISOString();
  let pageToken: string | undefined;
  do {
    const url = new URL(EVENTS_URL);
    url.searchParams.set("q", MARKER);
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("maxResults", "250");
    url.searchParams.set("showDeleted", "false");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await doFetch(url.toString(), { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) break;
    const page = (await res.json()) as { items?: CalendarEvent[]; nextPageToken?: string };
    out.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return out;
}

export async function reconcile(
  db: Database,
  deps: SyncDeps = {},
): Promise<{ synced: number; errors: number; orphansRemoved: number }> {
  let synced = 0;
  let errors = 0;
  let orphansRemoved = 0;

  for (const item of listItemsNeedingSync(db)) {
    const result = await syncModuleItem(db, item, deps);
    if (result?.sync_state === "synced") synced += 1;
    else errors += 1;
  }

  const doFetch = deps.fetch ?? fetch;
  const tok = await resolveToken(deps);
  if (tok.ok) {
    const knownIds = new Set(listModuleItems(db).map((i) => String(i.id)));
    const events = await listPlannerEvents(doFetch, tok.token);
    for (const ev of events) {
      const plannerId = ev.extendedProperties?.private?.modulePlannerId;
      if (!plannerId || knownIds.has(plannerId)) continue;
      const del = await deleteCalendarEvent(ev.id, deps);
      if (del.ok) orphansRemoved += 1;
    }
  }

  return { synced, errors, orphansRemoved };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test gcal/sync.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the whole suite + typecheck**

Run: `bun test && bunx tsc --noEmit`
Expected: all green, no type errors.

- [ ] **Step 6: Commit**

```bash
git add gcal/sync.ts gcal/sync.test.ts
git commit -m "feat: Google Calendar sync engine (create/patch/delete/reconcile)"
```

---

## Task 5: Module items API + `index.ts` wiring

**Files:**
- Create: `module-items-api.ts`
- Test: `module-items-api.test.ts`
- Modify: `index.ts` (imports near lines 6-9; `migrate*` calls near lines 28-33; route spreads near lines 47-54; add a startup reconcile after `Bun.serve`)

**Interfaces:**
- Consumes: everything from `module-items-db.ts`; `syncModuleItem`, `deleteCalendarEvent`, `reconcile`, `SyncDeps` from `gcal/sync.ts`; `COURSE_NAMES` from `semester-deadlines.ts`; `localToday` from `shared/scheduling.ts`.
- Produces:
  - `interface ModuleItemsApiDeps { sync?: SyncDeps }`
  - `function moduleItemsApiRoutes(db: Database, deps?: ModuleItemsApiDeps): Record<string, unknown>` — route object with keys `"/api/module-items"`, `"/api/module-items/:id"`, `"/api/module-items/:id/toggle"`, `"/api/module-items/sync"`, shaped like `announcementApiRoutes`.

- [ ] **Step 1: Write the failing test**

Create `module-items-api.test.ts`:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModuleItems, getModuleItem } from "./module-items-db";
import { moduleItemsApiRoutes, type ModuleItemsApiDeps } from "./module-items-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;
let calendarCalls: Array<{ kind: string; itemId: number }>;

// A stub SyncDeps: instead of hitting Google, record intent and mark the row
// synced/error deterministically based on the item title.
function stubDeps(): ModuleItemsApiDeps {
  return {
    sync: {
      getToken: async () => ({ ok: true as const, token: "t" }),
      fetch: (async (url: string, init?: RequestInit) => {
        const method = init?.method ?? "GET";
        if (method === "POST" && String(url).endsWith("/events")) {
          const body = JSON.parse(String(init!.body));
          calendarCalls.push({ kind: "create", itemId: Number(body.extendedProperties.private.modulePlannerId) });
          // title "FAILSYNC" -> 503, anything else -> created
          return new Response(
            JSON.stringify(body.summary.includes("FAILSYNC") ? {} : { id: `evt_${Date.now()}_${Math.random()}` }),
            { status: body.summary.includes("FAILSYNC") ? 503 : 200 },
          );
        }
        if (method === "PATCH") {
          calendarCalls.push({ kind: "patch", itemId: -1 });
          return new Response(JSON.stringify({ id: "evt_patched" }), { status: 200 });
        }
        if (method === "DELETE") {
          calendarCalls.push({ kind: "delete", itemId: -1 });
          return new Response("", { status: 204 });
        }
        // events.list during reconcile
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      }) as unknown as typeof fetch,
    },
  };
}

beforeEach(() => {
  db = new Database(":memory:");
  migrateModuleItems(db);
  calendarCalls = [];
  server = Bun.serve({ port: 0, routes: moduleItemsApiRoutes(db, stubDeps()) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

const post = (path: string, body: unknown) =>
  fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

const good = {
  course: "COMP5348",
  kind: "assignment",
  title: "Assignment 1",
  description: "Weeks 1-6.",
  due_at: "2026-09-20",
  links: [{ label: "Brief", url: "https://canvas.example/brief" }],
};

test("POST creates the row, syncs it, and returns 201 with a synced state", async () => {
  const res = await post("/api/module-items", good);
  expect(res.status).toBe(201);
  const item = await res.json();
  expect(item.due_at).toBe("2026-09-20T23:59");
  expect(item.sync_state).toBe("synced");
  expect(item.gcal_event_id).toMatch(/^evt_/);
  expect(calendarCalls).toEqual([{ kind: "create", itemId: item.id }]);
});

test("POST still returns 201 when the calendar call fails; row is marked error", async () => {
  const res = await post("/api/module-items", { ...good, title: "FAILSYNC now" });
  expect(res.status).toBe(201);
  const item = await res.json();
  expect(item.sync_state).toBe("error");
  expect(item.sync_error).toContain("503");
});

test("POST rejects an unknown course / bad kind / empty title / bad due_at / bad link", async () => {
  expect((await post("/api/module-items", { ...good, course: "NOPE1000" })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, kind: "exam" })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, title: "   " })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, due_at: "next tuesday" })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, links: [{ label: "x", url: "javascript:alert(1)" }] })).status).toBe(400);
});

test("GET lists items ordered incomplete-then-by-due", async () => {
  await post("/api/module-items", { ...good, title: "later", due_at: "2026-11-01" });
  await post("/api/module-items", { ...good, title: "sooner", due_at: "2026-09-10" });
  const list = await (await fetch(`${base}/api/module-items`)).json();
  expect(list.map((i: { title: string }) => i.title)).toEqual(["sooner", "later"]);
});

test("PUT edits and re-syncs (PATCH when an event id already exists)", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const res = await fetch(`${base}/api/module-items/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...good, title: "Assignment 1 (revised)" }),
  });
  expect(res.status).toBe(200);
  const item = await res.json();
  expect(item.title).toBe("Assignment 1 (revised)");
  expect(calendarCalls.some((c) => c.kind === "patch")).toBe(true);
});

test("PUT on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/module-items/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(good),
  });
  expect(res.status).toBe(404);
});

test("toggle flips completed and re-syncs", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const toggled = await (await post(`/api/module-items/${created.id}/toggle`, {})).json();
  expect(toggled.completed).toBe(true);
});

test("DELETE removes the row and deletes the calendar event", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const res = await fetch(`${base}/api/module-items/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect(getModuleItem(db, created.id)).toBeNull();
  expect(calendarCalls.some((c) => c.kind === "delete")).toBe(true);
});

test("DELETE on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/module-items/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});

test("POST /api/module-items/sync runs a reconcile and returns a summary", async () => {
  await post("/api/module-items", { ...good, title: "FAILSYNC once" }); // leaves an error row
  const summary = await (await post("/api/module-items/sync", {})).json();
  expect(summary).toHaveProperty("synced");
  expect(summary).toHaveProperty("errors");
  expect(summary).toHaveProperty("orphansRemoved");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test module-items-api.test.ts`
Expected: FAIL — `Cannot find module './module-items-api'`.

- [ ] **Step 3: Write the API implementation**

Create `module-items-api.ts`:

```ts
import type { Database } from "bun:sqlite";
import {
  createModuleItem,
  deleteModuleItem,
  getModuleItem,
  listModuleItems,
  normalizeDueAt,
  toggleModuleItem,
  updateModuleItem,
  MODULE_ITEM_KINDS,
  type ModuleItemInput,
  type ModuleItemKind,
  type ModuleItemLink,
} from "./module-items-db";
import { deleteCalendarEvent, reconcile, syncModuleItem, type SyncDeps } from "./gcal/sync";
import { COURSE_NAMES } from "./semester-deadlines";
import { localToday } from "./shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export interface ModuleItemsApiDeps {
  sync?: SyncDeps;
}

type ParseResult = { input: ModuleItemInput } | { error: string };

function parseLinks(raw: unknown): ModuleItemLink[] | { error: string } {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return { error: "links must be an array" };
  const out: ModuleItemLink[] = [];
  for (const entry of raw) {
    const url = typeof (entry as { url?: unknown })?.url === "string" ? (entry as { url: string }).url.trim() : "";
    const label = typeof (entry as { label?: unknown })?.label === "string" ? (entry as { label: string }).label.trim() : "";
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { error: "each link needs a valid http(s) url" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { error: "each link needs a valid http(s) url" };
    }
    out.push({ label, url });
  }
  return out;
}

function parseInput(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) return { error: "invalid body" };
  const b = body as Record<string, unknown>;

  const course = typeof b.course === "string" ? b.course : "";
  if (!(course in COURSE_NAMES)) return { error: "unknown course" };

  const kind = typeof b.kind === "string" ? b.kind : "";
  if (!MODULE_ITEM_KINDS.includes(kind as ModuleItemKind)) {
    return { error: `kind must be one of ${MODULE_ITEM_KINDS.join(", ")}` };
  }

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return { error: "title is required" };

  const dueRaw = typeof b.due_at === "string" ? b.due_at.trim() : "";
  let due_at: string;
  try {
    due_at = normalizeDueAt(dueRaw);
  } catch {
    return { error: "due_at must be YYYY-MM-DD or YYYY-MM-DDTHH:MM" };
  }

  const description = typeof b.description === "string" ? b.description : "";

  const links = parseLinks(b.links);
  if ("error" in links) return { error: links.error };

  return { input: { course, kind: kind as ModuleItemKind, title, description, due_at, links } };
}

export function moduleItemsApiRoutes(db: Database, deps: ModuleItemsApiDeps = {}) {
  const sync = deps.sync;
  return {
    "/api/module-items": {
      GET: () => json(listModuleItems(db)),
      POST: async (req: Request) => {
        const parsed = parseInput(await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const created = createModuleItem(db, parsed.input, localToday());
        const synced = await syncModuleItem(db, created, sync);
        return json(synced ?? created, 201);
      },
    },
    "/api/module-items/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const parsed = parseInput(await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateModuleItem(db, Number(req.params.id), parsed.input, localToday());
        if (!updated) return json({ error: "not found" }, 404);
        const synced = await syncModuleItem(db, updated, sync);
        return json(synced ?? updated);
      },
      DELETE: async (req: { params: { id: string } }) => {
        const deleted = deleteModuleItem(db, Number(req.params.id));
        if (!deleted) return json({ error: "not found" }, 404);
        if (deleted.gcal_event_id) {
          await deleteCalendarEvent(deleted.gcal_event_id, sync).catch(() => {});
        }
        return json({ ok: true });
      },
    },
    "/api/module-items/:id/toggle": {
      POST: async (req: { params: { id: string } }) => {
        const toggled = toggleModuleItem(db, Number(req.params.id), localToday());
        if (!toggled) return json({ error: "not found" }, 404);
        const synced = await syncModuleItem(db, toggled, sync);
        return json(synced ?? toggled);
      },
    },
    "/api/module-items/sync": {
      POST: async () => json(await reconcile(db, sync)),
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test module-items-api.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into `index.ts`**

In `index.ts`:
- Add imports after the `deadline-api` import (line ~9):

```ts
import { migrateModuleItems } from "./module-items-db";
import { moduleItemsApiRoutes } from "./module-items-api";
import { reconcile as reconcileModuleCalendar } from "./gcal/sync";
```

- Add the migration after `migrateInterview(db);` (line ~33):

```ts
migrateModuleItems(db);
```

- Add the route spread after `...interviewApiRoutes(db),` (line ~54):

```ts
    ...moduleItemsApiRoutes(db),
```

- After `console.log(\`leetcode-srs running at ${server.url}\`);` (end of file), add:

```ts
// Catch-up sync for any module item changed while the server was down.
reconcileModuleCalendar(db)
  .then((r) => console.log(`[module-planner] calendar reconcile:`, r))
  .catch((e) => console.error(`[module-planner] calendar reconcile failed:`, e));
```

- [ ] **Step 6: Smoke-test the running server**

Run: `SRS_DB_PATH=:memory: PORT=3999 bun index.ts` in one shell; in another:
`curl -s localhost:3999/api/module-items` → `[]`
`curl -s -X POST localhost:3999/api/module-items -H 'content-type: application/json' -d '{"course":"COMP5348","kind":"assignment","title":"Smoke","due_at":"2026-10-01"}'`
Expected: a JSON row with `"sync_state":"error"` and `sync_error` mentioning `gcal-auth.ts` (no credentials in `.env` yet) — proves the non-fatal path. Stop the server.

- [ ] **Step 7: Full suite + typecheck**

Run: `bun test && bunx tsc --noEmit`
Expected: green.

- [ ] **Step 8: Commit**

```bash
git add module-items-api.ts module-items-api.test.ts index.ts
git commit -m "feat: module items API with non-fatal calendar sync, wired into server"
```

---

## Task 6: Home dashboard `module-item` due source

**Files:**
- Modify: `home-api.ts` (the `DueSource` type ~line 22; add a `moduleItemDue` function; include it in the three `items` arrays in `homeStats`, `/api/home/due`, and — for completed — `/api/home/completed-today`)
- Modify: `home-api.test.ts` (add coverage)

**Interfaces:**
- Consumes: `listModuleItems` from `./module-items-db`; `isDue`, `overdueDays`, `localToday` (already imported).
- Produces: no new exports; `DueSource` gains `"module-item"`; `DueItem` objects with `source: "module-item"`, `linkId: <row id>`, `course: <code>`.

- [ ] **Step 1: Write the failing test**

Add to `home-api.test.ts` (new `test(...)` blocks; keep existing imports, add `migrateModuleItems`, `createModuleItem` from `./module-items-db`, and `moduleItemsApiRoutes` is not needed here — call the DB helpers directly, then hit `/api/home/due`). Wire `homeApiRoutes` into a `Bun.serve` the same way the file already does for other assertions; if the existing file builds the server once in `beforeEach`, reuse it.

```ts
test("module items due within the window appear in /api/home/due", async () => {
  // `db` and `base` come from the file's existing beforeEach harness.
  migrateModuleItems(db);
  createModuleItem(
    db,
    { course: "COMP5348", kind: "assignment", title: "Assignment 1", due_at: localToday() },
    localToday(),
  );
  const res = await fetch(`${base}/api/home/due`);
  const items = await res.json();
  const mine = items.find((i: { source: string }) => i.source === "module-item");
  expect(mine).toBeTruthy();
  expect(mine.title).toContain("Assignment 1");
  expect(mine.course).toBe("COMP5348");
});

test("completed module items are excluded from /api/home/due", async () => {
  migrateModuleItems(db);
  const item = createModuleItem(
    db,
    { course: "COMP5348", kind: "assignment", title: "Done one", due_at: localToday() },
    localToday(),
  );
  toggleModuleItem(db, item.id, localToday());
  const items = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i: { title: string }) => i.title.includes("Done one"))).toBe(false);
});
```

(Import `toggleModuleItem` too.)

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test home-api.test.ts`
Expected: FAIL — no `module-item` source in the response.

- [ ] **Step 3: Implement in `home-api.ts`**

- Extend the union:

```ts
export type DueSource = "leetcode" | "todo" | "exam" | "interview" | "module-item";
```

- Add the import near the other feature imports:

```ts
import { listModuleItems } from "./module-items-db";
```

- Add this function next to `examDue`:

```ts
// Module planner items (assignments / presentations / vivas). `due_at` is a
// datetime; compare on the date part so an item due later today still counts
// as due today. Not-completed only.
function moduleItemDue(db: Database, today: string): DueItem[] {
  return listModuleItems(db)
    .filter((m) => !m.completed && isDue(m.due_at.slice(0, 10), today))
    .map((m) => ({
      source: "module-item" as const,
      id: m.id,
      title: `${m.course} — ${m.title}`,
      subtitle: `${m.kind} · due ${m.due_at.replace("T", " ")}`,
      dueDate: m.due_at.slice(0, 10),
      overdueDays: overdueDays(m.due_at.slice(0, 10), today),
      linkId: m.id,
      course: m.course,
    }));
}
```

- Add `...moduleItemDue(db, today)` to the `items` array in **`homeStats`**, in **`/api/home/due`**, and (leave `/api/home/completed-today` unchanged — completed module items are intentionally not surfaced there for v1; note this in a one-line comment).

Wait — the spec says completed items just stop nagging, it does not ask for them in "completed today". Add this comment where the other `*CompletedToday` calls are aggregated:

```ts
// Module planner items have no per-day completion timestamp — a completed
// item simply drops off the due list; it is not counted in "completed today".
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test home-api.test.ts`
Expected: PASS.

- [ ] **Step 5: Full suite + typecheck**

Run: `bun test && bunx tsc --noEmit`
Expected: green. (If `tsc` flags the `DueSource` change anywhere in `frontend.tsx`, that's expected — Task 7 handles the frontend union; leave it for now **only if** `bun test` is green and the error is confined to `frontend.tsx`'s `navigate`/`DeepLink`. Otherwise fix here.)

- [ ] **Step 6: Commit**

```bash
git add home-api.ts home-api.test.ts
git commit -m "feat: surface module planner items on the Home due list"
```

---

## Task 7: One-time OAuth consent script (`scripts/gcal-auth.ts`)

**Files:**
- Create: `scripts/gcal-auth.ts`
- Test: `scripts/gcal-auth.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `function buildConsentUrl(clientId: string, redirectUri: string): string`
  - `async function exchangeCode(params: { clientId: string; clientSecret: string; code: string; redirectUri: string; fetch?: typeof fetch }): Promise<{ ok: true; refreshToken: string } | { ok: false; error: string }>`
  - `async function appendEnv(path: string, key: string, value: string): Promise<void>` (rewrites the line if `key` already present)
  - a `if (import.meta.main) { … }` block that runs the interactive flow (starts a `Bun.serve` on an ephemeral port for the redirect, opens/prints the consent URL, waits for the code, calls `exchangeCode`, calls `appendEnv(".env", "GOOGLE_REFRESH_TOKEN", …)`, prints success, exits).

- [ ] **Step 1: Write the failing test**

Create `scripts/gcal-auth.test.ts`:

```ts
import { test, expect } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildConsentUrl, exchangeCode, appendEnv } from "./gcal-auth";

test("buildConsentUrl requests offline access to calendar.events with consent prompt", () => {
  const url = new URL(buildConsentUrl("cid.apps.googleusercontent.com", "http://localhost:43117"));
  expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
  expect(url.searchParams.get("client_id")).toBe("cid.apps.googleusercontent.com");
  expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:43117");
  expect(url.searchParams.get("response_type")).toBe("code");
  expect(url.searchParams.get("access_type")).toBe("offline");
  expect(url.searchParams.get("prompt")).toBe("consent");
  expect(url.searchParams.get("scope")).toBe("https://www.googleapis.com/auth/calendar.events");
});

test("exchangeCode posts to the token endpoint and returns the refresh token", async () => {
  const calls: Array<{ url: string; body: string }> = [];
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), body: String(init?.body) });
    return new Response(JSON.stringify({ refresh_token: "1//rt_abc", access_token: "at" }), { status: 200 });
  }) as unknown as typeof fetch;
  const res = await exchangeCode({
    clientId: "cid",
    clientSecret: "sec",
    code: "auth_code",
    redirectUri: "http://localhost:43117",
    fetch: fakeFetch,
  });
  expect(res).toEqual({ ok: true, refreshToken: "1//rt_abc" });
  expect(calls[0]!.url).toBe("https://oauth2.googleapis.com/token");
  expect(calls[0]!.body).toContain("grant_type=authorization_code");
});

test("exchangeCode reports an error when Google returns no refresh_token", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })) as unknown as typeof fetch;
  const res = await exchangeCode({
    clientId: "cid",
    clientSecret: "sec",
    code: "bad",
    redirectUri: "http://localhost:1",
    fetch: fakeFetch,
  });
  expect(res.ok).toBe(false);
});

test("appendEnv adds a new key and replaces an existing one", async () => {
  const path = join(tmpdir(), `env-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await Bun.write(path, "GOOGLE_CLIENT_ID=cid\nGOOGLE_REFRESH_TOKEN=old\n");
  await appendEnv(path, "GOOGLE_REFRESH_TOKEN", "new");
  await appendEnv(path, "EXTRA_KEY", "yes");
  const text = await Bun.file(path).text();
  expect(text).toContain("GOOGLE_REFRESH_TOKEN=new");
  expect(text).not.toContain("GOOGLE_REFRESH_TOKEN=old");
  expect(text).toContain("EXTRA_KEY=yes");
  expect(text).toContain("GOOGLE_CLIENT_ID=cid");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test scripts/gcal-auth.test.ts`
Expected: FAIL — `Cannot find module './gcal-auth'`.

- [ ] **Step 3: Write the implementation**

Create `scripts/gcal-auth.ts`:

```ts
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

export function buildConsentUrl(clientId: string, redirectUri: string): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", SCOPE);
  return url.toString();
}

export async function exchangeCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  fetch?: typeof fetch;
}): Promise<{ ok: true; refreshToken: string } | { ok: false; error: string }> {
  const doFetch = params.fetch ?? fetch;
  try {
    const res = await doFetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: params.clientId,
        client_secret: params.clientSecret,
        code: params.code,
        redirect_uri: params.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    const data = (await res.json().catch(() => ({}))) as { refresh_token?: string; error?: string };
    if (!res.ok || !data.refresh_token) {
      return { ok: false, error: data.error ?? `token exchange failed (${res.status})` };
    }
    return { ok: true, refreshToken: data.refresh_token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "token exchange error" };
  }
}

export async function appendEnv(path: string, key: string, value: string): Promise<void> {
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  const lines = existing.split("\n").filter((l) => l.length > 0 && !l.startsWith(`${key}=`));
  lines.push(`${key}=${value}`);
  await Bun.write(path, lines.join("\n") + "\n");
}

if (import.meta.main) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first (see docs/module-planner-calendar-setup.md).");
    process.exit(1);
  }

  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const code = new URL(req.url).searchParams.get("code");
      if (code) {
        (async () => {
          const redirectUri = `http://localhost:${server.port}`;
          const result = await exchangeCode({ clientId, clientSecret, code, redirectUri });
          if (result.ok) {
            await appendEnv(".env", "GOOGLE_REFRESH_TOKEN", result.refreshToken);
            console.log("\n✅ Saved GOOGLE_REFRESH_TOKEN to .env — calendar sync is live.\n");
          } else {
            console.error("\n❌ Token exchange failed:", result.error, "\n");
          }
          setTimeout(() => process.exit(result.ok ? 0 : 1), 200);
        })();
        return new Response("You can close this tab and return to the terminal.");
      }
      return new Response("Waiting for Google redirect…");
    },
  });

  const redirectUri = `http://localhost:${server.port}`;
  const consent = buildConsentUrl(clientId, redirectUri);
  console.log("\n1. Add this exact URI to your OAuth client's 'Authorized redirect URIs':\n   " + redirectUri);
  console.log("\n2. Then open this URL and approve:\n   " + consent + "\n");
}
```

> **Note:** the interactive `import.meta.main` block is not unit-tested (it needs a real browser + Google). Its two pure helpers (`buildConsentUrl`, `exchangeCode`) and `appendEnv` are.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test scripts/gcal-auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `bunx tsc --noEmit` → clean.

```bash
git add scripts/gcal-auth.ts scripts/gcal-auth.test.ts
git commit -m "feat: one-time Google OAuth consent script"
```

---

## Task 8: Frontend — `ModulePlanner` panel (component, API client, CRUD, styles)

**Files:**
- Create: `ModulePlanner.tsx`
- Modify: `exam/App.tsx` (render `<ModulePlanner />` at the top of the board view — see Step 4)
- Modify: `index.css` (append the styles from Step 5)

> No frontend test runner exists in this repo. The automated gate for this task is `bunx tsc --noEmit`. The behavioural gate is the **browser check in Step 6**, done with the claude-in-chrome tools per the repo's verification rule.

**Interfaces:**
- Consumes: `GET/POST/PUT/DELETE /api/module-items`, `POST /api/module-items/:id/toggle`; `ModuleItem`, `ModuleItemKind`, `MODULE_ITEM_KINDS`, `ModuleItemLink` types from `./module-items-db`; `COURSE_NAMES`, `courseNameFor` from `./semester-deadlines`.
- Produces: `export default function ModulePlanner(props: { openItemId?: number | null; onOpened?: () => void }): JSX.Element`

- [ ] **Step 1: Write the component**

Create `ModulePlanner.tsx`:

```tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  MODULE_ITEM_KINDS,
  type ModuleItem,
  type ModuleItemKind,
  type ModuleItemLink,
} from "./module-items-db";
import { COURSE_NAMES, courseNameFor } from "./semester-deadlines";

const COURSE_CODES = Object.keys(COURSE_NAMES);

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

interface ItemDraft {
  course: string;
  kind: ModuleItemKind;
  title: string;
  description: string;
  dueDate: string; // 'YYYY-MM-DD'
  dueTime: string; // 'HH:MM' or ''
  links: ModuleItemLink[];
}

const api = {
  list: () => fetch("/api/module-items").then((r) => json<ModuleItem[]>(r)),
  create: (d: ItemDraft) =>
    fetch("/api/module-items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(d)),
    }).then((r) => json<ModuleItem>(r)),
  update: (id: number, d: ItemDraft) =>
    fetch(`/api/module-items/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(d)),
    }).then((r) => json<ModuleItem>(r)),
  toggle: (id: number) =>
    fetch(`/api/module-items/${id}/toggle`, { method: "POST" }).then((r) => json<ModuleItem>(r)),
  remove: (id: number) =>
    fetch(`/api/module-items/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function toPayload(d: ItemDraft) {
  return {
    course: d.course,
    kind: d.kind,
    title: d.title.trim(),
    description: d.description,
    due_at: d.dueTime ? `${d.dueDate}T${d.dueTime}` : d.dueDate,
    links: d.links.filter((l) => l.url.trim().length > 0).map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
  };
}

function draftFrom(item: ModuleItem): ItemDraft {
  const [dueDate, dueTime] = item.due_at.split("T");
  return {
    course: item.course,
    kind: item.kind,
    title: item.title,
    description: item.description,
    dueDate: dueDate!,
    dueTime: dueTime === "23:59" ? "" : dueTime ?? "",
    links: item.links.length ? item.links : [],
  };
}

function emptyDraft(course: string): ItemDraft {
  return { course, kind: "assignment", title: "", description: "", dueDate: "", dueTime: "", links: [] };
}

const KIND_LABEL: Record<ModuleItemKind, string> = {
  assignment: "Assignment",
  presentation: "Presentation",
  viva: "Viva",
  other: "Other",
};

function SyncBadge({ item }: { item: ModuleItem }) {
  if (item.sync_state === "synced") return <span className="mp-sync mp-sync-ok" title={`Synced ${item.synced_at ?? ""}`}>✓ calendar</span>;
  if (item.sync_state === "pending") return <span className="mp-sync mp-sync-pending" title="Sync queued">⟳ syncing</span>;
  return <span className="mp-sync mp-sync-error" title={item.sync_error ?? "Sync failed"}>⚠ not synced</span>;
}

function ItemForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial: ItemDraft;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (d: ItemDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ItemDraft>(initial);
  const [error, setError] = useState("");
  const set = <K extends keyof ItemDraft>(k: K, v: ItemDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form
      className="form mp-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!draft.title.trim()) return setError("Title is required.");
        if (!draft.dueDate) return setError("Due date is required.");
        try {
          await onSubmit(draft);
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <div className="mp-form-row">
        <label>
          Kind
          <select value={draft.kind} onChange={(e) => set("kind", e.target.value as ModuleItemKind)}>
            {MODULE_ITEM_KINDS.map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input type="date" value={draft.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </label>
        <label>
          Time (optional)
          <input type="time" value={draft.dueTime} onChange={(e) => set("dueTime", e.target.value)} />
        </label>
      </div>
      <label>
        Title
        <input type="text" value={draft.title} onChange={(e) => set("title", e.target.value)} autoFocus placeholder="e.g. Group Project — Source Code & Report" />
      </label>
      <label>
        Description
        <textarea rows={3} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this task, task split, notes…" />
      </label>
      <div className="mp-links">
        <span className="mp-links-head">Links</span>
        {draft.links.map((lnk, i) => (
          <div className="mp-link-row" key={i}>
            <input
              type="text"
              placeholder="Label"
              value={lnk.label}
              onChange={(e) => set("links", draft.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))}
            />
            <input
              type="url"
              placeholder="https://…"
              value={lnk.url}
              onChange={(e) => set("links", draft.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))}
            />
            <button type="button" className="btn" onClick={() => set("links", draft.links.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => set("links", [...draft.links, { label: "", url: "" }])}>+ Add link</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function ModulePlanner({
  openItemId,
  onOpened,
}: {
  openItemId?: number | null;
  onOpened?: () => void;
}) {
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("modulePlanner.collapsed") ?? "{}");
    } catch {
      return {};
    }
  });

  const refresh = () => {
    setError(null);
    return api.list().then(setItems).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (openItemId == null) return;
    const el = document.getElementById(`mp-item-${openItemId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("mp-flash");
      const t = setTimeout(() => el.classList.remove("mp-flash"), 1600);
      onOpened?.();
      return () => clearTimeout(t);
    }
  }, [openItemId, items, onOpened]);

  const toggleCollapse = (code: string) => {
    setCollapsed((c) => {
      const next = { ...c, [code]: !c[code] };
      try {
        localStorage.setItem("modulePlanner.collapsed", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const byCourse = useMemo(() => {
    const map: Record<string, ModuleItem[]> = {};
    for (const code of COURSE_CODES) map[code] = [];
    for (const item of items) (map[item.course] ??= []).push(item);
    return map;
  }, [items]);

  return (
    <section className="board mp-board" aria-label="Module planner">
      <div className="section-head">
        <h2>Module planner</h2>
        <span className="board-count">{items.length}</span>
      </div>
      <p className="rule-note">Assignments, presentations and vivas per unit. Every change syncs to Google Calendar with 1-week / 3-day / 1-day reminders.</p>
      {error && <p className="form-error">{error}</p>}

      {COURSE_CODES.map((code) => {
        const list = byCourse[code] ?? [];
        const isCollapsed = collapsed[code];
        return (
          <div className="mp-course" key={code}>
            <div className="mp-course-head">
              <button type="button" className="mp-course-toggle" onClick={() => toggleCollapse(code)}>
                {isCollapsed ? "▸" : "▾"} {courseNameFor(code)} <span className="mp-course-code">{code}</span>
                <span className="mp-course-count">{list.length}</span>
              </button>
              <button type="button" className="btn" onClick={() => { setAddingCourse(code); setEditingId(null); }}>+ Add</button>
            </div>

            {!isCollapsed && addingCourse === code && (
              <ItemForm
                initial={emptyDraft(code)}
                submitLabel="Add item"
                onCancel={() => setAddingCourse(null)}
                onSubmit={async (d) => {
                  await api.create(d);
                  setAddingCourse(null);
                  await refresh();
                }}
              />
            )}

            {!isCollapsed && (
              list.length === 0 ? (
                <p className="board-empty">No items yet — add your first assignment, presentation, or viva.</p>
              ) : (
                <ul className="board-rows">
                  {list.map((item) =>
                    editingId === item.id ? (
                      <li key={item.id} id={`mp-item-${item.id}`}>
                        <ItemForm
                          initial={draftFrom(item)}
                          submitLabel="Save changes"
                          onCancel={() => setEditingId(null)}
                          onSubmit={async (d) => {
                            await api.update(item.id, d);
                            setEditingId(null);
                            await refresh();
                          }}
                        />
                      </li>
                    ) : (
                      <li key={item.id} id={`mp-item-${item.id}`} className={item.completed ? "mp-row mp-row-done" : "mp-row"}>
                        <div className="mp-row-main">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => api.toggle(item.id).then(refresh).catch((e) => setError(errorMessage(e)))}
                            aria-label={item.completed ? "Mark not done" : "Mark done"}
                          />
                          <span className={`mp-kind mp-kind-${item.kind}`}>{KIND_LABEL[item.kind]}</span>
                          <span className="mp-title">{item.title}</span>
                          <span className="mp-due">{item.due_at.replace("T", " ")}</span>
                          <SyncBadge item={item} />
                          <span className="mp-actions">
                            {item.sync_state === "error" && (
                              <button type="button" className="btn" onClick={() => api.update(item.id, draftFrom(item)).then(refresh).catch((e) => setError(errorMessage(e)))}>Retry sync</button>
                            )}
                            <button type="button" className="btn" onClick={() => { setEditingId(item.id); setAddingCourse(null); }}>Edit</button>
                            {confirmingDelete === item.id ? (
                              <>
                                <span className="mp-confirm">Delete?</span>
                                <button type="button" className="btn btn-danger" onClick={() => api.remove(item.id).then(() => { setConfirmingDelete(null); return refresh(); }).catch((e) => setError(errorMessage(e)))}>Yes</button>
                                <button type="button" className="btn" onClick={() => setConfirmingDelete(null)}>No</button>
                              </>
                            ) : (
                              <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(item.id)}>Delete</button>
                            )}
                          </span>
                        </div>
                        {item.description && <p className="mp-desc">{item.description}</p>}
                        {item.links.length > 0 && (
                          <div className="mp-link-chips">
                            {item.links.map((l, i) => (
                              <a key={i} className="mp-chip" href={l.url} target="_blank" rel="noopener noreferrer">{l.label || l.url}</a>
                            ))}
                          </div>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              )
            )}
          </div>
        );
      })}
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: clean (component only; wiring next).

- [ ] **Step 3: Verify `semester-deadlines.ts` exports what the component imports**

Run: `grep -n "export function courseNameFor\|export const COURSE_NAMES" semester-deadlines.ts`
Expected: both present (they are). No change needed.

- [ ] **Step 4: Mount in `exam/App.tsx`**

- Add the import near the top (with the other local imports):

```ts
import ModulePlanner from "../ModulePlanner";
```

Wait — `exam/App.tsx` is inside `exam/`, so the import is `../ModulePlanner`. `ModulePlanner.tsx` itself imports `./module-items-db` and `./semester-deadlines` from repo root — correct, since it lives at repo root.

- Find the board view render (the `view.name === "board"` branch of `ExamApp`'s return, around line 1300+). Render `<ModulePlanner openItemId={openItemId ?? null} onOpened={onOpened} />` **immediately above** the existing course/paper board markup.
- Extend `ExamApp`'s props (around line 1087):

```ts
export default function ExamApp({
  openCourse,
  openWeek,
  openItemId,
  onOpened,
}: {
  openCourse?: string | null;
  openWeek?: number | null;
  openItemId?: number | null;
  onOpened?: () => void;
}) {
```

(If `onOpened` already exists in the prop list, keep it — just add `openItemId`.)

- [ ] **Step 5: Append styles to `index.css`**

Add at the end of `index.css` (uses the existing CSS-variable palette — check the top of `index.css` for the actual variable names, e.g. `--bg`, `--fg`, `--muted`, `--accent`, `--border`; substitute the real ones if they differ):

```css
/* ---- Module planner ---- */
.mp-board .rule-note { margin-top: 0; }
.mp-course { border-top: 1px solid var(--border); padding: 0.5rem 0; }
.mp-course-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.mp-course-toggle {
  background: none; border: 0; color: var(--fg); font: inherit; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;
}
.mp-course-code { color: var(--muted); font-weight: 400; font-size: 0.85em; }
.mp-course-count { color: var(--muted); font-weight: 400; }
.mp-row { padding: 0.5rem 0; border-top: 1px dashed var(--border); }
.mp-row:first-child { border-top: 0; }
.mp-row-done .mp-title { text-decoration: line-through; color: var(--muted); }
.mp-row-main { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.mp-title { font-weight: 600; flex: 1 1 12rem; }
.mp-due { color: var(--muted); font-variant-numeric: tabular-nums; }
.mp-kind { font-size: 0.75em; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.1rem 0.4rem; border-radius: 0.35rem; border: 1px solid var(--border); }
.mp-kind-viva { border-color: #c0392b; color: #c0392b; }
.mp-kind-presentation { border-color: #b8860b; color: #b8860b; }
.mp-kind-assignment { border-color: #2e6da4; color: #2e6da4; }
.mp-kind-other { color: var(--muted); }
.mp-sync { font-size: 0.75em; }
.mp-sync-ok { color: var(--muted); }
.mp-sync-pending { color: #b8860b; }
.mp-sync-error { color: #c0392b; cursor: help; }
.mp-actions { display: flex; align-items: center; gap: 0.35rem; }
.mp-confirm { color: #c0392b; font-size: 0.85em; }
.mp-desc { margin: 0.35rem 0 0 1.6rem; color: var(--muted); white-space: pre-wrap; }
.mp-link-chips { margin: 0.35rem 0 0 1.6rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
.mp-chip { font-size: 0.8em; padding: 0.1rem 0.45rem; border: 1px solid var(--border); border-radius: 0.35rem; text-decoration: none; }
.mp-form { margin: 0.5rem 0 0.75rem; }
.mp-form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.mp-links { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem; }
.mp-links-head { font-size: 0.85em; color: var(--muted); }
.mp-link-row { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.mp-flash { animation: mp-flash 1.6s ease-out; }
@keyframes mp-flash { from { background: rgba(184, 134, 11, 0.25); } to { background: transparent; } }
```

- [ ] **Step 6: Browser verification (claude-in-chrome)**

Start the app: `PORT=4321 bun run dev`. Then, with the browser tools:
1. Open `http://localhost:4321`, click the **Modules** tab. Confirm the "Module planner" panel renders above the practice-paper board with all four course sections.
2. In COMP5348, click **+ Add**, fill kind=Assignment, title="Assignment 1", due date = 2026-09-20, add a link, submit. Confirm the row appears, sorted by date, with a **⚠ not synced** badge (no `.env` credentials yet — expected) and the `sync_error` tooltip mentions `gcal-auth.ts`.
3. Click **Edit**, change the title, save — row updates.
4. Toggle the checkbox — row shows strikethrough and sinks below active items.
5. Click **Delete → Yes** — row disappears; reload the page and confirm it's gone.
6. Collapse a course section, reload — collapse state persists.
7. Check the browser console for errors (there should be none beyond expected network 4xx from the sync attempt).

Record the result in the task notes. Fix any console errors or layout breakage before continuing.

- [ ] **Step 7: Full suite + typecheck**

Run: `bun test && bunx tsc --noEmit`
Expected: green.

- [ ] **Step 8: Commit**

```bash
git add ModulePlanner.tsx exam/App.tsx index.css
git commit -m "feat: Module planner panel on the Modules tab (CRUD + sync badges)"
```

---

## Task 9: Frontend — deep link from Home to a module item

**Files:**
- Modify: `frontend.tsx` (the `DeepLink` union ~line 645; the `navigate` function ~line 728; the `<ExamApp .../>` render ~line 760)

**Interfaces:**
- Consumes: `ModulePlanner`'s `openItemId` / `onOpened` props (Task 8); `ExamApp`'s new `openItemId` / `onOpened` props (Task 8).
- Produces: clicking a `source: "module-item"` row on the Home due list switches to the Modules tab and scrolls/flashes that item.

- [ ] **Step 1: Extend the `DeepLink` union**

In `frontend.tsx`:

```ts
type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "todo"; todoId: number }
  | { tab: "exam"; course: string; week: number }
  | { tab: "exam"; moduleItemId: number };
```

- [ ] **Step 2: Handle the new source in `navigate`**

Update the `navigate` param type and body:

```ts
const navigate = (item: {
  source: "leetcode" | "todo" | "exam" | "interview" | "module-item";
  linkId: number;
  course?: string;
  externalUrl?: string;
}) => {
  if (item.source === "leetcode" && item.externalUrl) {
    openExternal(item.externalUrl);
    return;
  }
  if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
  else if (item.source === "todo") setDeepLink({ tab: "todo", todoId: item.linkId });
  else if (item.source === "exam") setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
  else if (item.source === "module-item") setDeepLink({ tab: "exam", moduleItemId: item.linkId });
  setTab(item.source === "module-item" ? "exam" : item.source);
};
```

- [ ] **Step 3: Pass the prop to `ExamApp`**

```tsx
{tab === "exam" && (
  <ExamApp
    openCourse={deepLink?.tab === "exam" && "course" in deepLink ? deepLink.course : null}
    openWeek={deepLink?.tab === "exam" && "week" in deepLink ? deepLink.week : null}
    openItemId={deepLink?.tab === "exam" && "moduleItemId" in deepLink ? deepLink.moduleItemId : null}
    onOpened={() => setDeepLink(null)}
  />
)}
```

- [ ] **Step 4: Typecheck**

Run: `bunx tsc --noEmit`
Expected: clean. If `HomeApp`'s `onNavigate` prop type is narrower than the new `navigate` signature, widen it in `HomeApp.tsx` to include `"module-item"` (it consumes `DueItem` from `home-api.ts`, whose `DueSource` already gained the value in Task 6 — so this should already line up; only touch `HomeApp.tsx` if `tsc` demands it).

- [ ] **Step 5: Browser verification (claude-in-chrome)**

With `PORT=4321 bun run dev`:
1. Add a module item with a due date of **today** (so it lands on the Home due list).
2. Go to the **Home** tab — confirm the item shows under "Everything due" / the due-today count with its course prefix.
3. Click it — the app switches to the **Modules** tab and the matching row briefly flashes (the `mp-flash` animation) and is scrolled into view.

- [ ] **Step 6: Full suite + typecheck + commit**

Run: `bun test && bunx tsc --noEmit` → green.

```bash
git add frontend.tsx HomeApp.tsx
git commit -m "feat: deep-link from Home due list to a module planner item"
```

---

## Task 10: Setup docs, README link, and weekly reconcile hook

**Files:**
- Create: `docs/module-planner-calendar-setup.md`
- Modify: `README.md` (add a link under whatever "docs" / "features" list exists; if none, add a short "## Module planner" section)
- Modify: `~/bin/exam-autogen.sh` (append one line — this file is **outside the repo**; make the edit and note it in the commit message body, since it won't be part of the commit)

**Interfaces:** none (documentation + ops).

- [ ] **Step 1: Write the setup doc**

Create `docs/module-planner-calendar-setup.md`:

```markdown
# Module planner → Google Calendar: one-time setup

The Module planner (Modules tab) pushes every assignment / presentation /
viva to your Google Calendar as a timed event with popup reminders at
**1 week, 3 days, and 1 day** before the due time. After this one-time
setup it is fully unattended — add / edit / delete an item and the change
is on your calendar within a second.

## 1. Google Cloud project + Calendar API

1. Go to <https://console.cloud.google.com/> → create a project (any name).
2. **APIs & Services → Library →** enable **Google Calendar API**.

## 2. OAuth client

1. **APIs & Services → Credentials → Create credentials → OAuth client ID.**
2. If prompted, configure the consent screen: User type **External**,
   add yourself as a **Test user** (no verification needed for personal use).
3. Application type: **Desktop app**. Create.
4. Copy the **Client ID** and **Client secret**.

## 3. .env

Add to `.env` in the repo root (already git-ignored):

```
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxx
```

## 4. Authorise once

```
bun scripts/gcal-auth.ts
```

- It prints a `http://localhost:<port>` redirect URI — add that exact
  string to the OAuth client's **Authorized redirect URIs** in the Cloud
  console, then re-run if needed.
- Open the printed consent URL, approve.
- The script writes `GOOGLE_REFRESH_TOKEN` to `.env`.

## 5. Done

```
PORT=4321 bun run dev
```

The Modules tab now shows **✓ calendar** on each item. If a sync fails
(offline, token revoked) the item shows **⚠ not synced** with the reason;
it retries automatically on the next server start, when you edit the item,
or when you hit **Sync** / `POST /api/module-items/sync`.

## Re-authorising

If you see "authorisation expired", re-run `bun scripts/gcal-auth.ts`.
```

- [ ] **Step 2: Link it from the README**

Add a bullet/line to `README.md` pointing at `docs/module-planner-calendar-setup.md` with one sentence of context.

- [ ] **Step 3: Weekly catch-up reconcile**

Append to `~/bin/exam-autogen.sh` (outside the repo), after its existing work, guarded so it's a no-op when the dev server isn't running:

```bash
# Module planner: catch up any calendar sync that failed while offline.
curl -fsS -X POST http://localhost:4321/api/module-items/sync >/dev/null 2>&1 || true
```

- [ ] **Step 4: Verify docs build / links resolve**

Run: `grep -R "module-planner-calendar-setup" README.md` → one hit.
Open `docs/module-planner-calendar-setup.md` and confirm no `TODO`/placeholder remains.

- [ ] **Step 5: Commit**

```bash
git add docs/module-planner-calendar-setup.md README.md
git commit -m "docs: Module planner Google Calendar setup guide

Also appended a weekly reconcile curl to ~/bin/exam-autogen.sh (outside repo)."
```

---

## Task 11: Final integration pass

**Files:** none created; verification only.

- [ ] **Step 1: Full green check**

Run: `bun test && bunx tsc --noEmit`
Expected: entire suite green, zero type errors.

- [ ] **Step 2: End-to-end with real credentials (if Adam has completed setup)**

If `.env` has `GOOGLE_REFRESH_TOKEN`:
1. `PORT=4321 bun run dev`.
2. Add a module item due ~8 days out.
3. Confirm in Google Calendar (web) within a few seconds: event on the primary calendar, correct Sydney time, three notifications at 1 week / 3 days / 1 day, colour matching the kind, description carrying the links + `[module-planner]`.
4. Edit the item's time in the app → the same event moves (no duplicate).
5. Delete the item → the event disappears.
6. Toggle an item complete → event stays, `✓ ` prefix, notifications removed.

If `.env` has no token: confirm instead that every item shows **⚠ not synced** with a `gcal-auth.ts` hint and the app is otherwise fully functional (the non-fatal contract).

- [ ] **Step 3: Confirm no regression to existing tabs**

Browser-check Home, LeetCode, Todo, Interview tabs still load and the Home counters are sane.

- [ ] **Step 4: Final commit (if any stray fixes)**

```bash
git add -A
git commit -m "chore: module planner integration fixes"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| §1 data model (`module_items`, all columns, helpers, `normalizeDueAt`) | Task 2 |
| §2 API (all six routes, validation rules, non-fatal sync) | Task 5 |
| §3 UI — `ModulePlanner` on Modules tab, per-course grouping, kind badges, sync indicator, inline add/edit, two-step delete, empty state, localStorage collapse | Task 8 |
| §3 UI — Home surfacing + deep link | Tasks 6 (feed) + 9 (navigation) |
| §3 "alongside, not replacing" | No migration task exists — announcements & `SEMESTER_DEADLINES` untouched (Tasks 5/6 add only) |
| §4 one-time auth (`scripts/gcal-auth.ts`, Desktop client, refresh token to `.env`, `calendar.events` scope) | Task 7 |
| §4 token handling (`gcal/auth.ts`, cache, typed failure, `invalid_grant`) | Task 3 |
| §4 event mapping (summary, Sydney local times, description+marker, `reminders.overrides` 10080/4320/1440, `colorId` per kind, `extendedProperties.private.modulePlannerId`, completed → `✓ ` + no reminders) | Task 4 (`buildEvent`) |
| §4 `syncModuleItem` create/patch/404-recreate; `deleteCalendarEvent` 404/410 = ok | Task 4 |
| §4 `reconcile` (retry needing-sync + orphan sweep via `q=[module-planner]`) | Task 4 |
| §4 reconcile invoked on startup + weekly job + `POST /sync` | Task 5 (startup + route), Task 10 (weekly curl) |
| §4 failure model (never breaks CRUD, ⚠ + retry in UI, next reconcile) | Task 5 (route contract), Task 8 (badge + Retry button) |
| §5 testing (db, api, sync, auth, script — all network stubbed) | Tasks 2,3,4,5,7 each ship their test file |
| §6 continuous-testing hook (`PostToolUse` Write/Edit → `bun test` + `tsc`, autonomous correction) | Task 1 |
| §7 one-time setup doc for Adam | Task 10 |
| §8 open items (colorId values, look-ahead window = match `home-api.ts`, hook location = repo `.claude/settings.json`, marker in description + `extendedProperties`, deep-link `moduleItemId`) | Resolved: Task 4 (colorId map + marker), Task 6 (window via `isDue`), Task 1 (`.claude/settings.json`), Task 9 (`moduleItemId`) |

No uncovered spec requirements.

**2. Placeholder scan**

- No "TBD"/"TODO" in task steps. The only `TODO` string is inside Task 10 Step 4 as a thing to *grep for and confirm absent* in the doc.
- `index.css` step notes "substitute the real variable names" — this is a genuine lookup against the file, and the step names the likely variables and where to check; acceptable (not a hidden decision).
- `exam/App.tsx` mount point is described by view branch + line region rather than an exact line, because the file is 1300+ lines and unread in full here; the anchor (`view.name === "board"` return, `ModulePlanner` above the board markup) is unambiguous.

**3. Type consistency**

- `ModuleItem` / `ModuleItemInput` / `ModuleItemKind` / `ModuleItemLink` / `SyncState` defined once in Task 2, imported everywhere else.
- `SyncDeps` defined in Task 4, consumed by Task 5's `ModuleItemsApiDeps.sync` and passed straight through.
- `TokenResult` defined in Task 3, used by Task 4's `SyncDeps.getToken` and `resolveToken`.
- `syncModuleItem` returns `Promise<ModuleItem | null>` in both its definition (Task 4) and all call sites (Task 5).
- `reconcile` return shape `{ synced, errors, orphansRemoved }` identical in Task 4 impl, Task 4 test, Task 5 route, Task 5 test.
- Reminder minutes `[10080, 4320, 1440]` identical in Task 4 impl, Task 4 test, and the spec.
- `DueSource` gains `"module-item"` in Task 6; `frontend.tsx` `navigate` union widened to match in Task 9; `DeepLink` uses `{ tab: "exam"; moduleItemId: number }` consistently in Tasks 9 Steps 1 and 3.
- `ExamApp` prop additions (`openItemId`, `onOpened`) declared in Task 8 Step 4 and consumed in Task 9 Step 3.

No inconsistencies found.
