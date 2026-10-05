# Card redesign + day sidebar, race calendar and month view — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ship the six UI issues from the 2026-10-01 Excalidraw sketch —
Notes month-grouped sidebar and phone drawer, Goals and Home as card
grids, a Week / Month switch on the weekly plan, and a year-scoped race
calendar on the Roadmap tab.

**Architecture:** every behaviour change is a new pure function with
tests (`groupDaysByMonth`, `parseGoalText`, `inferGoalCategory`,
`monthWeeks`, `splitARaces`, `racesForYear`) plus a thin component that
renders its output. One schema change: a `category` column on `goals`.
One shared CSS primitive: `.card` / `.card-grid` in `index.css`. Notes
keeps its own self-contained CSS because the phone capture bundle has no
app shell.

**Tech Stack:** Bun, `bun:sqlite`, React 19, existing tokens in
`index.css` and `notes/notes.css`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-04-card-redesign-and-calendar-views-design.md`

**Visual reference:** the "Redesign 1–6" groups in
`~/Documents/Vault/Excalidraw/Drawing 2026-10-01 01.41.41.excalidraw.md`.

## Global Constraints

- Bun runtime throughout — `bun test` (flat `test()`, no `describe`), `bunx tsc --noEmit` must pass with zero errors after every task. The PostToolUse hook in `.claude/settings.json` runs both on every Write/Edit; a red result is fixed before moving on.
- Boundary validation lives in `*-api.ts` only; `*-db.ts` and pure modules trust their inputs.
- Migrations are additive and idempotent: running `migrateGoals` twice must be a no-op.
- Goal text is never rewritten. `parseGoalText` is display-only.
- `notes/` must not use `index.css` classes or tokens — it renders standalone on the phone. Use `--notes-*` tokens only.
- Todo, Jobs, Uni and Exam keep `.board-row` exactly as it is. Do not edit the `.board-row` rules; add new classes instead.
- No component-level UI tests, matching the rest of the app. UI is verified live in the browser at desktop width and at 390px (Task 10).
- The pure-function code and tests in Tasks 3, 6, 8 and 9 were run in isolation under `bun test` and `tsc --strict --noUncheckedIndexedAccess` before this plan was written. Component code was not run — treat it as a starting point and let the type checker correct it.

## Review Focus

- **Goal category order.** "Powerman Run 2 (10km off the bike)" contains "bike" but is a running goal; "Injury: cycling only … cleared to run" contains both sport words but is recovery. Rule order is recovery → events → running → cycling. Covered in Task 3.
- **Migrating a goals table twice.** The `ALTER TABLE` must be guarded, and the backfill must not re-run and overwrite a category the user picked. Covered in Task 4.
- **Goal text with no arrow** ("Join Suvelo") must render as a plain card, not crash or show an empty big number. Covered in Task 3 (`null`) and Task 5 (fallback branch).
- **The optional Races tab failing** must not blank the Roadmap page. Covered in Task 9's API step.
- **A year with Races-tab rows must not also list its `aRaces` entries** (double listing). Covered in Task 9's `racesForYear` test.
- **Month boundaries.** A month starting mid-week includes the previous month's Monday; December's last week runs into January. Covered in Task 8.
- **Phone drawer above 640px.** `daysOpen` must have no visual effect on desktop, and the Days button must not render there. Checked in Task 10.

---

### Task 1: Shared card style

**Files:**
- Modify: `index.css` (append after the `.tag` block, before `/* Rung meter */`)

- [ ] **Step 1: Add the classes**

```css
/* Cards — the short, bordered tile used by Goals, Home and the race
   calendar. Deliberately no coloured left border (that is .board-row's
   look); urgency and category are carried by a tag inside the card. */
.card-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min, 240px), 1fr));
}

.card-grid > li {
  display: flex;
  min-width: 0;
  animation: row-in var(--dur-base) var(--ease) backwards;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
  padding: var(--space-4);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  transition: background var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}

.card:hover {
  background: var(--panel-raised);
  box-shadow: var(--shadow-panel);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.card-title {
  font-size: var(--text-md);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.card-meta {
  font-family: var(--mono);
  font-size: var(--text-sm);
  color: var(--dim);
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--line);
}

.card-kicker {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim);
}
```

- [ ] **Step 2: Verify**

Run: `bun test` and `bunx tsc --noEmit`
Expected: unchanged, all green (CSS only).

- [ ] **Step 3: Commit**

```bash
git add index.css
git commit -m "feat(ui): add shared card and card-grid styles"
```

---

### Task 2: Home cards

**Files:**
- Modify: `AnnouncementsBoard.tsx` (the `<ul className="board-rows">` block)
- Modify: `HomeApp.tsx` (the Everything due `<ul className="board-rows">` block)
- Modify: `index.css` (two small rules)

**Interfaces:** consumes `.card*` from Task 1. No logic changes — every handler, form and state variable stays as it is.

- [ ] **Step 1: Announcements**

In `AnnouncementsBoard.tsx` change the list to
`<ul className="card-grid" style={{ "--card-min": "320px" } as React.CSSProperties}>`.
Keep the editing `<li>` as is. Replace the non-editing `<li>` body with:

```tsx
<li key={a.id} style={{ animationDelay: `${i * 60}ms` }}>
  <div className={a.completed ? "card announcement-done" : "card"}>
    <label className="card-check">
      <input type="checkbox" checked={a.completed} onChange={() => toggle(a.id)} />
      <span className="announcement-message">{a.message}</span>
    </label>
    <div className="card-actions">
      <button type="button" className="btn" onClick={() => setEditingId(a.id)}>Edit</button>
      <button type="button" className="btn btn-danger" onClick={() => remove(a.id)}>Delete</button>
      <button
        type="button"
        className="btn"
        disabled={modulesError || modules.length === 0}
        title={
          modulesError
            ? "Couldn't load modules"
            : modules.length === 0
              ? "No modules to add to"
              : "Add this as a deadline"
        }
        onClick={() => setDeadlineFor(a.id)}
      >
        + Add to deadlines
      </button>
    </div>
    {deadlineFor === a.id && (
      <DeadlineQuickForm
        announcement={a}
        modules={modules}
        onCancel={() => setDeadlineFor(null)}
        onDone={() => {
          setDeadlineFor(null);
          setAddedFor(a.id);
          setTimeout(() => setAddedFor(null), 2500);
        }}
      />
    )}
    {addedFor === a.id && <p className="announcement-added">✓ Added to deadlines</p>}
  </div>
</li>
```

The buttons are no longer inside the `<label>`, so the `e.preventDefault()`
calls that stopped a button click from toggling the checkbox are no
longer needed — delete them rather than carrying them over.

- [ ] **Step 2: Everything due**

In `HomeApp.tsx` change the list to `<ul className="card-grid">` and each
item to:

```tsx
<li key={`${item.source}-${item.id}`} style={{ animationDelay: `${i * 60}ms` }}>
  <div className="card" style={{ "--urgency": `var(--${color})` } as React.CSSProperties}>
    <button type="button" className="card-click" onClick={() => onNavigate(item)}>
      <span className="card-top">
        <span className="cat-tag" style={{ "--cat-color": SOURCE_COLOR[item.source] } as React.CSSProperties}>
          {SOURCE_LABEL[item.source]}
        </span>
        <span className="tag">{item.overdueDays > 0 ? `${item.overdueDays}d late` : "due"}</span>
      </span>
      <span className="card-title">{item.title}</span>
      {item.subtitle && !hasLink && <span className="card-meta">{item.subtitle}</span>}
    </button>
    {hasLink && (
      <div className="card-actions">
        <a className="btn" href={item.subtitle} target="_blank" rel="noopener noreferrer">
          Open link ↗
        </a>
      </div>
    )}
  </div>
</li>
```

- [ ] **Step 3: CSS**

Append to `index.css` after the Task 1 block:

```css
.card-click {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.card-check {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
}

.card-check input[type="checkbox"] {
  flex: 0 0 auto;
  margin-top: 0.2rem;
}
```

Check the existing `.announcement-done` rule still reads correctly on a
`.card` (it was written for `.board-row`); adjust the selector only if it
referenced `.board-row` explicitly.

- [ ] **Step 4: Verify and commit**

Run: `bun test` and `bunx tsc --noEmit` — green.

```bash
git add AnnouncementsBoard.tsx HomeApp.tsx index.css
git commit -m "feat(home): show announcements and everything-due as card grids"
```

---

### Task 3: Goal text parsing and category inference

**Files:**
- Create: `training/goal-text.ts`
- Test: `training/goal-text.test.ts`

**Interfaces — produces (for Tasks 4 and 5):**
- `GOAL_CATEGORIES`, `type GoalCategory`, `isGoalCategory(value): value is GoalCategory`
- `inferGoalCategory(text: string): GoalCategory`
- `interface GoalParts { title; current; target; note: string | null }`
- `parseGoalText(text: string): GoalParts | null`

- [ ] **Step 1: Write the failing tests**

Create `training/goal-text.test.ts`:

```ts
import { test, expect } from "bun:test";
import { GOAL_SEED } from "./goals-seed";
import { inferGoalCategory, isGoalCategory, parseGoalText } from "./goal-text";

test("parseGoalText splits a simple title: current → target line", () => {
  expect(parseGoalText("5K: 17:36 → 16:00")).toEqual({
    title: "5K",
    current: "17:36",
    target: "16:00",
    note: null,
  });
});

test("parseGoalText keeps a parenthetical in the title and lifts one off the target into the note", () => {
  expect(parseGoalText("Powerman Bike (60km): 1:45 → 1:28 (~280–300W)")).toEqual({
    title: "Powerman Bike (60km)",
    current: "1:45",
    target: "1:28",
    note: "~280–300W",
  });
});

test("parseGoalText folds a third arrow segment into the note", () => {
  expect(parseGoalText("FTP (20-min test): ~215–230W → 250W (Mar 2027) → 280–300W (2028)")).toEqual({
    title: "FTP (20-min test)",
    current: "~215–230W",
    target: "250W",
    note: "Mar 2027 · then 280–300W (2028)",
  });
});

test("parseGoalText returns null when the text has no title or no arrow", () => {
  expect(parseGoalText("Join Suvelo")).toBeNull();
  expect(parseGoalText("Sleep: 8 hours")).toBeNull();
});

test("every seeded goal parses", () => {
  for (const text of GOAL_SEED) expect(parseGoalText(text)).not.toBeNull();
});

test("inferGoalCategory files each seeded goal under the right sport", () => {
  expect(GOAL_SEED.map(inferGoalCategory)).toEqual([
    "recovery",
    "running",
    "running",
    "running",
    "running",
    "cycling",
    "running",
    "cycling",
    "events",
    "events",
    "running",
  ]);
});

test("inferGoalCategory falls back to other", () => {
  expect(inferGoalCategory("Read more")).toBe("other");
});

test("isGoalCategory accepts only the known categories", () => {
  expect(isGoalCategory("cycling")).toBe(true);
  expect(isGoalCategory("swimming")).toBe(false);
  expect(isGoalCategory(3)).toBe(false);
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `bun test training/goal-text.test.ts`
Expected: FAIL — cannot find module `./goal-text`.

- [ ] **Step 3: Implement**

Create `training/goal-text.ts`:

```ts
export const GOAL_CATEGORIES = ["running", "cycling", "events", "recovery", "other"] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const GOAL_CATEGORY_LABEL: Record<GoalCategory, string> = {
  running: "Running",
  cycling: "Cycling",
  events: "Events",
  recovery: "Recovery",
  other: "Other",
};

// First match wins. Running is tested before cycling because a running goal
// can mention the bike ("10km off the bike"); recovery and events come first
// because those lines mention sports without being a sport target.
const CATEGORY_RULES: [RegExp, GoalCategory][] = [
  [/injury/i, "recovery"],
  [/games|worlds|zofingen/i, "events"],
  [/\b(run|5k|10k|marathon)/i, "running"],
  [/\b(bike|ftp|cycling)/i, "cycling"],
];

export function inferGoalCategory(text: string): GoalCategory {
  return CATEGORY_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? "other";
}

export function isGoalCategory(value: unknown): value is GoalCategory {
  return typeof value === "string" && (GOAL_CATEGORIES as readonly string[]).includes(value);
}

export interface GoalParts {
  title: string;
  current: string;
  target: string;
  note: string | null;
}

const TRAILING_PAREN_RE = /^(.*\S)\s*\(([^()]*)\)$/;

export function parseGoalText(text: string): GoalParts | null {
  const colon = text.indexOf(": ");
  if (colon <= 0) return null;
  const title = text.slice(0, colon).trim();
  const segments = text
    .slice(colon + 2)
    .split(" → ")
    .map((segment) => segment.trim());
  if (segments.length < 2 || segments.some((segment) => segment === "")) return null;

  const [current, rawTarget, ...later] = segments;
  const notes: string[] = [];
  let target = rawTarget!;
  const paren = TRAILING_PAREN_RE.exec(target);
  if (paren) {
    target = paren[1]!;
    notes.push(paren[2]!.trim());
  }
  if (later.length > 0) notes.push(`then ${later.join(" → ")}`);

  return { title, current: current!, target, note: notes.length > 0 ? notes.join(" · ") : null };
}
```

- [ ] **Step 4: Run to confirm it passes**

Run: `bun test training/goal-text.test.ts` — all pass. `bunx tsc --noEmit` — no errors.

- [ ] **Step 5: Commit**

```bash
git add training/goal-text.ts training/goal-text.test.ts
git commit -m "feat(goals): parse goal text for display and infer a sport category"
```

---

### Task 4: Goal category in the db and API

**Files:**
- Modify: `training/goals-db.ts`
- Modify: `training/goals-api.ts`
- Test: `training/goals-db.test.ts`, `training/goals-api.test.ts`

**Interfaces — produces (for Task 5):** `Goal` gains `category: GoalCategory`. `POST`/`PUT /api/goals` accept optional `category`.

- [ ] **Step 1: Write the failing tests**

Append to `training/goals-db.test.ts`:

```ts
test("createGoal infers the category from the text when none is given", () => {
  expect(createGoal(db, "FTP (20-min test): 220W → 250W", TODAY).category).toBe("cycling");
});

test("createGoal stores an explicit category over the inferred one", () => {
  expect(createGoal(db, "FTP (20-min test): 220W → 250W", TODAY, "other").category).toBe("other");
});

test("updateGoal leaves the category alone when none is given, and replaces it when one is", () => {
  const goal = createGoal(db, "5K: 17:36 → 16:00", TODAY);
  expect(updateGoal(db, goal.id, "5K: 17:20 → 16:00")!.category).toBe("running");
  expect(updateGoal(db, goal.id, "5K: 17:20 → 16:00", "events")!.category).toBe("events");
});

test("migrateGoals adds category to a pre-category table and backfills it by inference", () => {
  const old = new Database(":memory:");
  old.exec(`
    CREATE TABLE goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT,
      created_at TEXT NOT NULL
    );
    INSERT INTO goals (text, created_at) VALUES ('Injury: cycling only → cleared to run pain-free', '2026-09-28');
    INSERT INTO goals (text, created_at) VALUES ('Powerman Run 2 (10km off the bike): 44:00+ → 35:00', '2026-09-28');
  `);
  migrateGoals(old);
  expect(listGoals(old).map((g) => g.category)).toEqual(["recovery", "running"]);
});

test("migrateGoals does not re-run the backfill over a category the user chose", () => {
  const goal = createGoal(db, "5K: 17:36 → 16:00", TODAY, "other");
  migrateGoals(db);
  expect(listGoals(db).find((g) => g.id === goal.id)!.category).toBe("other");
});
```

Append to `training/goals-api.test.ts`:

```ts
const post = (body: unknown) =>
  fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("POST /api/goals infers a category when none is sent", async () => {
  const body = await (await post({ text: "10K: 38:46 → 34:00" })).json();
  expect(body.category).toBe("running");
});

test("POST /api/goals rejects an unknown category", async () => {
  expect((await post({ text: "10K: 38:46 → 34:00", category: "swimming" })).status).toBe(400);
});

test("PUT /api/goals/:id keeps the category when none is sent", async () => {
  const created = await (await post({ text: "10K: 38:46 → 34:00", category: "events" })).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "10K: 38:00 → 34:00" }),
  });
  expect((await res.json()).category).toBe("events");
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `bun test training/goals-db.test.ts training/goals-api.test.ts`
Expected: FAIL — `category` is undefined; `createGoal` takes 3 arguments.

- [ ] **Step 3: Implement the db layer**

In `training/goals-db.ts`:

```ts
import { inferGoalCategory, type GoalCategory } from "./goal-text";
```

Add `category: GoalCategory` to both `Goal` and `GoalRow`.

At the end of `migrateGoals` (after the legacy title/current/target
rebuild, so it also covers a table that was just rebuilt):

```ts
  const columns = db.query(`PRAGMA table_info(goals)`).all() as { name: string }[];
  if (!columns.some((column) => column.name === "category")) {
    db.exec(`ALTER TABLE goals ADD COLUMN category TEXT NOT NULL DEFAULT 'other'`);
    const existing = db.query(`SELECT id, text FROM goals`).all() as { id: number; text: string }[];
    const setCategory = db.query(`UPDATE goals SET category = ? WHERE id = ?`);
    for (const goal of existing) setCategory.run(inferGoalCategory(goal.text), goal.id);
  }
```

The `CREATE TABLE IF NOT EXISTS` statement stays as it is: a fresh
database takes the same `ALTER` path, so there is one way the column
comes to exist, not two.

Replace `createGoal` and `updateGoal`:

```ts
export function createGoal(
  db: Database,
  text: string,
  today: string,
  category: GoalCategory = inferGoalCategory(text),
): Goal {
  const row = db
    .query(`INSERT INTO goals (text, done, done_at, created_at, category) VALUES (?, 0, NULL, ?, ?) RETURNING *`)
    .get(text, today, category) as GoalRow;
  return toGoal(row);
}

export function updateGoal(db: Database, id: number, text: string, category?: GoalCategory): Goal | null {
  const row = db
    .query(`UPDATE goals SET text = ?, category = COALESCE(?, category) WHERE id = ? RETURNING *`)
    .get(text, category ?? null, id) as GoalRow | undefined;
  return row ? toGoal(row) : null;
}
```

- [ ] **Step 4: Implement the API layer**

In `training/goals-api.ts` replace `parseText` with:

```ts
import { GOAL_CATEGORIES, isGoalCategory, type GoalCategory } from "./goal-text";

function parseGoalBody(body: unknown): { text: string; category: GoalCategory | undefined } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const { text, category } = body as { text?: unknown; category?: unknown };
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return { error: "text is required" };
  if (category === undefined || category === null) return { text: trimmed, category: undefined };
  if (!isGoalCategory(category)) return { error: `category must be one of: ${GOAL_CATEGORIES.join(", ")}` };
  return { text: trimmed, category };
}
```

and pass `parsed.category` through: `createGoal(db, parsed.text, localToday(), parsed.category)`
and `updateGoal(db, Number(req.params.id), parsed.text, parsed.category)`.

- [ ] **Step 5: Run, type-check, commit**

Run: `bun test` — all pass, including the untouched older goal tests. `bunx tsc --noEmit` — no errors.

```bash
git add training/goals-db.ts training/goals-api.ts training/goals-db.test.ts training/goals-api.test.ts
git commit -m "feat(goals): store a sport category per goal, inferred on create and on migration"
```

---

### Task 5: Goals as grouped cards

**Files:**
- Modify: `training/GoalsApp.tsx`
- Modify: `index.css` (one rule)

**Interfaces:** consumes Tasks 1, 3, 4.

- [ ] **Step 1: Send and edit the category**

`api.create` and `api.update` take a second/third `category: GoalCategory`
argument and include it in the JSON body. `NewGoalForm` and
`EditGoalForm` each gain:

```tsx
const [category, setCategory] = useState<GoalCategory>(goal?.category ?? "running");
…
<label>
  Group
  <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)}>
    {GOAL_CATEGORIES.map((key) => (
      <option key={key} value={key}>{GOAL_CATEGORY_LABEL[key]}</option>
    ))}
  </select>
</label>
```

(`NewGoalForm` has no `goal`; it starts at `"running"`.) The two forms
are now identical apart from initial values and the submit call — merge
them into one `GoalForm({ initialText, initialCategory, submitLabel, onSubmit, onCancel })`,
the way `AnnouncementForm` already serves both add and edit.

- [ ] **Step 2: Replace `GoalRow` with `GoalCard`**

```tsx
function GoalCard({
  goal,
  onToggle,
  onDelete,
  onEdit,
}: {
  goal: Goal;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}) {
  const parts = parseGoalText(goal.text);
  return (
    <div className={goal.done ? "card goal-card goal-card-done" : "card goal-card"}>
      <label className="card-check">
        <input type="checkbox" checked={goal.done} onChange={() => onToggle(goal.id)} />
        <span className="card-title">{parts ? parts.title : goal.text}</span>
      </label>
      {parts && (
        <div>
          <div className="goal-card-target">{parts.target}</div>
          <div className="card-meta">from {parts.current}</div>
        </div>
      )}
      {parts?.note && <div className="card-meta">{parts.note}</div>}
      {goal.done && <span className="tag">achieved {goal.done_at}</span>}
      <div className="card-actions">
        <button type="button" className="btn" onClick={() => onEdit(goal.id)}>Edit</button>
        <button type="button" className="btn btn-danger" onClick={() => onDelete(goal.id)}>Delete</button>
      </div>
    </div>
  );
}
```

The current row passes `readOnly={goal.done}` to the checkbox; check
`toggleGoal` — it un-achieves a done goal — and keep whichever behaviour
the app has today (do not change it as a side effect of this task).

- [ ] **Step 3: Group the active goals**

```tsx
function groupByCategory(goals: Goal[]): { category: GoalCategory; goals: Goal[] }[] {
  return GOAL_CATEGORIES.map((category) => ({
    category,
    goals: goals.filter((goal) => goal.category === category),
  })).filter((group) => group.goals.length > 0);
}
```

Render inside the existing Goals `<section className="board">`, replacing
the single `<ul className="board-rows">`:

```tsx
{groupByCategory(active).map((group) => (
  <div key={group.category} className="goal-group">
    <h3 className="card-kicker">
      {GOAL_CATEGORY_LABEL[group.category]} · {group.goals.length}
    </h3>
    <ul className="card-grid" style={{ "--card-min": "220px" } as React.CSSProperties}>
      {group.goals.map((goal, i) => (
        <li key={goal.id} style={{ animationDelay: `${i * 60}ms` }}>
          {goal.id === editingId ? <GoalForm … /> : <GoalCard goal={goal} … />}
        </li>
      ))}
    </ul>
  </div>
))}
```

The Achieved section uses one ungrouped `card-grid` of `GoalCard`s.

- [ ] **Step 4: CSS**

```css
.goal-group + .goal-group {
  margin-top: var(--space-5);
}

.goal-group .card-kicker {
  margin: 0 0 var(--space-2);
}

.goal-card-target {
  font-family: var(--mono);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.goal-card-done .card-title {
  text-decoration: line-through;
  color: var(--dim);
}
```

- [ ] **Step 5: Verify and commit**

Run: `bun test`, `bunx tsc --noEmit` — green.

```bash
git add training/GoalsApp.tsx index.css
git commit -m "feat(goals): show goals as short cards grouped by sport"
```

---

### Task 6: Notes — month-grouped sidebar and card entries

**Files:**
- Modify: `notes/notes-grouping.ts`, `notes/NotesSidebar.tsx`, `notes/NotesView.tsx`, `notes/NotesTimeline.tsx`, `notes/notes.css`
- Test: `notes/notes-grouping.test.ts`

**Interfaces — produces (for Task 7):** `NotesSidebar` takes `months: MonthGroup[]` in place of `groups`.

- [ ] **Step 1: Write the failing tests**

Append to `notes/notes-grouping.test.ts` (add `groupDaysByMonth` and
`formatNoteTime` to the import):

```ts
test("groupDaysByMonth splits days into months, newest first, with a note count per month", () => {
  const days = [
    { dateKey: "2026-10-04", label: "Today", notes: [noteAt(new Date(2026, 9, 4, 9), "a")] },
    {
      dateKey: "2026-10-01",
      label: "Thu, 1 Oct",
      notes: [noteAt(new Date(2026, 9, 1, 9), "b"), noteAt(new Date(2026, 9, 1, 10), "c", "bbbb")],
    },
    { dateKey: "2026-09-30", label: "Wed, 30 Sep", notes: [noteAt(new Date(2026, 8, 30, 9), "d")] },
  ];
  const months = groupDaysByMonth(days);
  expect(months.map((m) => [m.monthKey, m.label, m.noteCount, m.days.length])).toEqual([
    ["2026-10", "October 2026", 3, 2],
    ["2026-09", "September 2026", 1, 1],
  ]);
});

test("groupDaysByMonth returns no months for no days", () => {
  expect(groupDaysByMonth([])).toEqual([]);
});

test("formatNoteTime renders the note's local time as HH:mm", () => {
  expect(formatNoteTime(idFor(new Date(2026, 8, 30, 9, 5)))).toBe("09:05");
});

test("formatNoteTime falls back to the raw id when the id has no timestamp", () => {
  expect(formatNoteTime("not-a-timestamp")).toBe("not-a-timestamp");
});
```

Run: `bun test notes/notes-grouping.test.ts` — FAIL, exports missing.

- [ ] **Step 2: Implement**

Append to `notes/notes-grouping.ts`:

```ts
export interface MonthGroup {
  monthKey: string;
  label: string;
  noteCount: number;
  days: DayGroup[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Takes groupNotesByDay's output, so day bucketing, day order and the
// Today / Yesterday labels are decided in exactly one place.
export function groupDaysByMonth(groups: DayGroup[]): MonthGroup[] {
  const months = new Map<string, MonthGroup>();
  for (const day of groups) {
    const monthKey = day.dateKey.slice(0, 7);
    let month = months.get(monthKey);
    if (!month) {
      const [year, monthNumber] = monthKey.split("-").map(Number);
      month = { monthKey, label: `${MONTH_NAMES[monthNumber! - 1]} ${year}`, noteCount: 0, days: [] };
      months.set(monthKey, month);
    }
    month.days.push(day);
    month.noteCount += day.notes.length;
  }
  return Array.from(months.values());
}

export function formatNoteTime(id: string): string {
  const timestamp = parseNoteTimestamp(id);
  if (!timestamp) return id;
  const hours = String(timestamp.getHours()).padStart(2, "0");
  const minutes = String(timestamp.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
```

Run: `bun test notes/notes-grouping.test.ts` — pass.

- [ ] **Step 3: Sidebar**

`notes/NotesSidebar.tsx` — props become
`{ months: MonthGroup[]; selectedDayKey: string; onSelectDay: (dateKey: string) => void }`;
the body of `<nav>` becomes:

```tsx
<h2 className="notes-sidebar-heading">Days</h2>
{months.map((month) => (
  <section key={month.monthKey} className="notes-month">
    <h3 className="notes-month-heading">
      <span>{month.label}</span>
      <span className="notes-day-count">{month.noteCount}</span>
    </h3>
    <ul className="notes-day-list">
      {month.days.map((group) => (
        <li key={group.dateKey}>
          <button
            type="button"
            aria-current={group.dateKey === selectedDayKey ? "true" : undefined}
            className={group.dateKey === selectedDayKey ? "notes-day-item notes-day-item-active" : "notes-day-item"}
            onClick={() => onSelectDay(group.dateKey)}
          >
            <span className="notes-day-label">{group.label}</span>
            <span className="notes-day-count">{group.notes.length}</span>
          </button>
        </li>
      ))}
    </ul>
  </section>
))}
{months.length === 0 && <p className="notes-day-empty">No notes yet</p>}
```

`notes/NotesView.tsx`: add
`const months = useMemo(() => groupDaysByMonth(groups), [groups]);` and
pass `months={months}`.

- [ ] **Step 4: Entries as cards**

`notes/NotesTimeline.tsx`: in `NoteEntry`, replace `{note.createdAt}` with
`{formatNoteTime(note.id)}` and delete both
`<span className="notes-entry-dot" …/>` elements.

`notes/notes.css`:
- Delete the `.notes-entry-dot` rule and the
  `.notes-entry:not(:last-child)::after` connector rule.
- `.notes-timeline`: `display: flex; flex-direction: column; gap: 0.75rem;`
- `.notes-entry`: `background: var(--notes-panel); border: 1px solid var(--notes-line); border-radius: 10px; padding: 0.85rem 1rem;`
- Add:

```css
.notes-month + .notes-month {
  margin-top: 1rem;
}

.notes-month-heading {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.35rem;
  padding: 0 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--notes-dim);
}
```

- [ ] **Step 5: Verify and commit**

Run: `bun test`, `bunx tsc --noEmit` — green.

```bash
git add notes/
git commit -m "feat(notes): group sidebar days by month and show notes as cards"
```

---

### Task 7: Notes — slide-in day sidebar on a phone

**Files:**
- Modify: `notes/NotesView.tsx`, `notes/NotesSidebar.tsx`, `notes/NotesTimeline.tsx`, `notes/notes.css`

- [ ] **Step 1: State and handlers in `NotesView`**

```tsx
const [daysOpen, setDaysOpen] = useState(false);
const daysToggleRef = useRef<HTMLButtonElement>(null);

const closeDays = () => {
  setDaysOpen(false);
  daysToggleRef.current?.focus();
};

const selectDay = (dateKey: string) => {
  setSelectedDayKey(dateKey);
  closeDays();
};

useEffect(() => {
  if (!daysOpen) return;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") closeDays();
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [daysOpen]);
```

Root element: `className={daysOpen ? "notes-view notes-view-days-open" : "notes-view"}`.
Render, between the sidebar and `.notes-content`:

```tsx
<button type="button" className="notes-scrim" aria-label="Close days" tabIndex={daysOpen ? 0 : -1} onClick={closeDays} />
```

Pass `onSelectDay={selectDay}` and `id="notes-days"` to `NotesSidebar`
(add an `id` prop, put it on the `<nav>`). Pass
`daysOpen`, `onOpenDays={() => setDaysOpen(true)}` and `daysToggleRef`
to `NotesTimeline`.

- [ ] **Step 2: The Days button**

In `NotesTimeline`'s header, before the title block:

```tsx
<button
  type="button"
  ref={daysToggleRef}
  className="notes-days-toggle"
  aria-expanded={daysOpen}
  aria-controls="notes-days"
  onClick={onOpenDays}
>
  Days
</button>
```

- [ ] **Step 3: Focus on open**

In `NotesSidebar`, take an `open: boolean` prop and move focus to the
active day (or the first day) when it becomes true:

```tsx
const navRef = useRef<HTMLElement>(null);
useEffect(() => {
  if (!open) return;
  const target = navRef.current?.querySelector<HTMLButtonElement>(".notes-day-item-active, .notes-day-item");
  target?.focus();
}, [open]);
```

- [ ] **Step 4: CSS**

Outside any media query:

```css
.notes-days-toggle,
.notes-scrim {
  display: none;
}
```

Replace the whole `@media (max-width: 640px)` block's sidebar, day-list,
day-item and day-count rules (the chip row) with:

```css
@media (max-width: 640px) {
  .notes-view {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .notes-days-toggle {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 0.9rem;
    border: 1px solid var(--notes-line);
    border-radius: 8px;
    background: var(--notes-panel);
    color: var(--notes-text);
    font: inherit;
    font-weight: 600;
  }

  .notes-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    width: min(300px, 85vw);
    padding: 1rem 0.75rem;
    overflow-y: auto;
    background: var(--notes-bg);
    border-right: 1px solid var(--notes-line);
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform 200ms ease, visibility 200ms;
  }

  .notes-view-days-open .notes-sidebar {
    transform: none;
    visibility: visible;
  }

  .notes-view-days-open .notes-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 20;
    border: 0;
    background: rgba(0, 0, 0, 0.45);
  }

  .notes-day-item {
    min-height: 44px;
  }

  .notes-composer-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .notes-main-header {
    flex-wrap: wrap;
    align-items: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notes-sidebar {
    transition: none;
  }
}
```

`visibility: hidden` on the closed drawer keeps its buttons out of the
tab order and away from screen readers, which a transform alone does not.

- [ ] **Step 5: Verify and commit**

Run: `bun test`, `bunx tsc --noEmit` — green.

```bash
git add notes/
git commit -m "feat(notes): replace the phone day-chip row with a slide-in day sidebar"
```

---

### Task 8: Weekly plan — Week / Month switch with month tabs

**Files:**
- Modify: `shared/weekly-plan/week.ts`, `shared/weekly-plan/model.ts`, `shared/weekly-plan/WeeklyPlanView.tsx`, `shared/weekly-plan/components/WeekBoardTable.tsx`, `shared/weekly-plan/weekly-plan.css`
- Create: `shared/weekly-plan/components/PlanDayDetail.tsx`, `shared/weekly-plan/components/WeekBoardMonth.tsx`, `shared/weekly-plan/components/MonthTabs.tsx`
- Test: `shared/weekly-plan/week.test.ts`, `shared/weekly-plan/model.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `shared/weekly-plan/week.test.ts` (extend the import):

```ts
test("monthWeeks returns the Monday of every week overlapping the month", () => {
  // October 2026 starts on a Thursday, so its first week begins in September.
  expect(monthWeeks("2026-10-04")).toEqual(["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"]);
});

test("monthWeeks starts on the 1st when the month begins on a Monday", () => {
  expect(monthWeeks("2026-06-15")).toEqual(["2026-06-01", "2026-06-08", "2026-06-15", "2026-06-22", "2026-06-29"]);
});

test("monthWeeks returns exactly four weeks for a February that fits them", () => {
  expect(monthWeeks("2027-02-10")).toEqual(["2027-02-01", "2027-02-08", "2027-02-15", "2027-02-22"]);
});

test("monthWeeks stops at December's last Monday instead of running into January", () => {
  expect(monthWeeks("2026-12-31")).toEqual(["2026-11-30", "2026-12-07", "2026-12-14", "2026-12-21", "2026-12-28"]);
});

test("monthLabel names the month and year", () => {
  expect(monthLabel("2026-10-04")).toBe("October 2026");
});

test("monthsOfYear lists the first day of each month of that year", () => {
  const months = monthsOfYear("2026-10-04");
  expect(months).toHaveLength(12);
  expect(months[0]).toBe("2026-01-01");
  expect(months[11]).toBe("2026-12-01");
});
```

Append to `shared/weekly-plan/model.test.ts`:

```ts
test("focusFor names a rest day and joins category labels otherwise", () => {
  const categories = { bike: { label: "Bike", colorToken: "--accent" }, strength: { label: "Strength", colorToken: "--red" } };
  expect(focusFor({ day: "Fri", items: [] }, categories)).toBe("Rest");
  expect(
    focusFor(
      { day: "Tue", items: [{ title: "a", category: "bike", steps: [] }, { title: "b", category: "strength", steps: [] }] },
      categories,
    ),
  ).toBe("Bike / Strength");
});
```

Run: `bun test shared/weekly-plan` — FAIL, exports missing.

- [ ] **Step 2: Implement the date helpers**

Append to `shared/weekly-plan/week.ts`:

```ts
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ISO dates compare correctly as strings, so "is this Monday still inside
// or before the month" is a plain prefix comparison.
export function monthWeeks(anyDateInMonth: string): string[] {
  const monthKey = anyDateInMonth.slice(0, 7);
  const mondays: string[] = [];
  for (let monday = mondayOf(`${monthKey}-01`); monday.slice(0, 7) <= monthKey; monday = addDays(monday, 7)) {
    mondays.push(monday);
  }
  return mondays;
}

export function monthLabel(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return `${MONTH_NAMES[month! - 1]} ${year}`;
}

export function monthsOfYear(date: string): string[] {
  const year = date.slice(0, 4);
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}-01`);
}
```

Move `focusFor` from `components/WeekBoardTable.tsx` to `model.ts`
(exported, same body) and import it back into `WeekBoardTable`.

Run: `bun test shared/weekly-plan` — pass.

- [ ] **Step 3: Extract `PlanDayDetail`**

Create `components/PlanDayDetail.tsx` from the `plan-day-detail` block at
the bottom of `WeekBoardTable`, unchanged in markup:

```tsx
import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { shortDate } from "../week";
import { PlanItemView } from "./PlanItemView";

export function PlanDayDetail<TItem extends PlanItem>({
  date,
  day,
  isToday,
  categories,
}: {
  date: string;
  day: PlanDay<TItem>;
  isToday: boolean;
  categories: Record<string, CategoryStyle>;
}) {
  // A single-session day tints the panel's border with that session's
  // category colour; a multi-session or rest day falls back to the neutral accent.
  const tone = day.items.length === 1 ? categories[day.items[0]!.category]!.colorToken : "--accent";
  return (
    <div key={date} className="plan-day-detail" style={{ "--tone": `var(${tone})` } as React.CSSProperties}>
      <header className="plan-day-detail-head">
        <span className="plan-table-weekday">{day.day}</span>
        <span className="plan-table-date">{shortDate(date)}</span>
        {isToday && <span className="tag">today</span>}
      </header>
      {day.items.length === 0 ? (
        <p className="plan-day-rest">Rest</p>
      ) : (
        day.items.map((item, i) => <PlanItemView key={i} item={item} categories={categories} />)
      )}
    </div>
  );
}
```

`WeekBoardTable` renders
`<PlanDayDetail date={selectedEntry.date} day={selectedEntry.day} isToday={selectedEntry.isToday} categories={categories} />`
and loses its own `detailTone`. Run `bun test` — `view.test.ts` must
still pass unchanged; that is the check that the extraction changed
nothing.

- [ ] **Step 4: `MonthTabs`**

```tsx
import { monthsOfYear } from "../week";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthTabs({ anchor, onChange }: { anchor: string; onChange: (date: string) => void }) {
  const active = anchor.slice(0, 7);
  return (
    <nav className="plan-month-tabs" aria-label="Month">
      {monthsOfYear(anchor).map((firstOfMonth, i) => (
        <button
          key={firstOfMonth}
          type="button"
          aria-current={firstOfMonth.slice(0, 7) === active ? "true" : undefined}
          className={firstOfMonth.slice(0, 7) === active ? "plan-month-tab plan-month-tab-active" : "plan-month-tab"}
          onClick={() => onChange(firstOfMonth)}
        >
          {SHORT_MONTHS[i]}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: `WeekBoardMonth`**

```tsx
import { useState } from "react";
import type { PlanItem, WeeklyPlan } from "../model";
import { focusFor } from "../model";
import { WEEKDAYS, datesOfWeek, monthLabel, monthWeeks, shortDate } from "../week";
import { PlanDayDetail } from "./PlanDayDetail";
import { MonthTabs } from "./MonthTabs";

function cellClass(isRest: boolean, isToday: boolean, isSelected: boolean, inMonth: boolean): string | undefined {
  const classes = [
    isRest && "plan-table-rest",
    isToday && "plan-table-today",
    isSelected && "plan-table-selected",
    !inMonth && "plan-month-outside",
  ].filter(Boolean);
  return classes.length > 0 ? classes.join(" ") : undefined;
}

export function WeekBoardMonth<TItem extends PlanItem>({
  plan,
  anchor,
  today,
  onAnchorChange,
}: {
  plan: WeeklyPlan<TItem>;
  anchor: string;
  today: string;
  onAnchorChange: (date: string) => void;
}) {
  const monthKey = anchor.slice(0, 7);
  const [selected, setSelected] = useState(today);
  const shown = selected.slice(0, 7) === monthKey ? selected : `${monthKey}-01`;

  return (
    <section className="board plan-board" aria-label={monthLabel(anchor)}>
      <div className="section-head">
        <h2>{monthLabel(anchor)}</h2>
      </div>
      <div className="plan-table-wrap">
        <table className="plan-table plan-month-table">
          <thead>
            <tr>
              <th scope="col">Week</th>
              {WEEKDAYS.map((weekday) => (
                <th key={weekday} scope="col">{weekday}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthWeeks(anchor).map((monday) => (
              <tr key={monday}>
                <th scope="row" className="plan-month-week">
                  {shortDate(monday)} – {shortDate(datesOfWeek(monday)[6]!)}
                </th>
                {datesOfWeek(monday).map((date) => {
                  // definePlan() guarantees all 7 weekdays are present.
                  const day = plan.dayFor(date)!;
                  return (
                    <td
                      key={date}
                      className={cellClass(day.items.length === 0, date === today, date === shown, date.slice(0, 7) === monthKey)}
                    >
                      <button
                        type="button"
                        className="plan-table-daybtn"
                        aria-pressed={date === shown}
                        onClick={() => setSelected(date)}
                      >
                        <span className="plan-table-date">{Number(date.slice(8))}</span>
                        <span>{focusFor(day, plan.categories)}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MonthTabs anchor={anchor} onChange={onAnchorChange} />
      <PlanDayDetail date={shown} day={plan.dayFor(shown)!} isToday={shown === today} categories={plan.categories} />
    </section>
  );
}
```

- [ ] **Step 6: Wire into `WeeklyPlanView`**

Add a `range` choice beside `view`, persisted the same way:

```tsx
type PlanRange = "week" | "month";
```

`loadView`/`saveView` and a new `loadRange`/`saveRange` would be two
copies of the same try/catch — replace them with one pair,
`loadChoice<T extends string>(key: string, allowed: readonly T[], fallback: T): T`
and `saveChoice(key: string, value: string)`, used for both
`"weekly-plan-view"` and `"weekly-plan-range"`.

`ViewToggle` becomes a generic `SegmentedToggle<T extends string>({ label, options, value, onChange })`
rendering the same `plan-view-toggle` / `plan-view-btn` markup, with
`aria-pressed` on each button. Render two of them in a
`<div className="plan-toggles">`: Week / Month, then Table / Cards (the
second only when `range === "week"`).

State: `const [anchor, setAnchor] = useState(today);`. Body:

```tsx
{range === "month" ? (
  <WeekBoardMonth plan={plan} anchor={anchor} today={today} onAnchorChange={setAnchor} />
) : view === "table" ? (
  <WeekBoardTable week={week} categories={plan.categories} heading={heading} />
) : (
  <WeekBoardCards week={week} categories={plan.categories} heading={heading} />
)}
```

- [ ] **Step 7: CSS**

Append to `weekly-plan.css`:

```css
.plan-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.plan-month-table {
  min-width: 720px;
}

.plan-month-table .plan-table-daybtn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  min-height: 56px;
  text-align: left;
}

.plan-month-week {
  font-family: var(--mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--dim);
  white-space: nowrap;
  text-align: left;
}

.plan-month-outside {
  opacity: 0.5;
}

.plan-month-tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  margin-top: var(--space-2);
  padding: var(--space-1);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.plan-month-tab {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dim);
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}

.plan-month-tab:hover {
  color: var(--text);
}

.plan-month-tab-active,
.plan-month-tab-active:hover {
  background: var(--accent);
  color: var(--on-accent);
}

@media (max-width: 640px) {
  .plan-month-tab {
    min-height: 44px;
  }
}
```

- [ ] **Step 8: Verify and commit**

Run: `bun test`, `bunx tsc --noEmit` — green, including the unchanged
`view.test.ts`.

```bash
git add shared/weekly-plan/
git commit -m "feat(weekly-plan): add a Week / Month switch with month tabs"
```

---

### Task 9: Race calendar by year

**Files:**
- Modify: `training/roadmap.ts`, `training/RoadmapLinks.tsx`, `index.css`
- Create: `training/RaceCalendar.tsx`
- Test: `training/roadmap.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `training/roadmap.test.ts` (extend the import):

```ts
test("splitARaces splits on the middle dot and treats unmarked entries as A races", () => {
  const races = splitARaces("2027", "TriFactor Malaysia · Asia Duathlon Cup · Sydney 10 · SEA Games (if selected)");
  expect(races.map((r) => [r.name, r.priority, r.note])).toEqual([
    ["TriFactor Malaysia", "A", null],
    ["Asia Duathlon Cup", "A", null],
    ["Sydney 10", "A", null],
    ["SEA Games", "A", "if selected"],
  ]);
  expect(races.every((r) => r.year === "2027" && r.date === null)).toBe(true);
});

test("splitARaces reads a (B) marker as the priority, not a note", () => {
  expect(splitARaces("2026", "Cycling TTs (B)").map((r) => [r.name, r.priority, r.note])).toEqual([
    ["Cycling TTs", "B", null],
  ]);
});

test("splitARaces returns nothing for an empty cell", () => {
  expect(splitARaces("2026", "")).toEqual([]);
});

const RACES_CSV = `Year,Date,Competition,Location,Priority,Entered
2026,2026-05-17,Sydney 10,SOPAC,a,10km
2026,,NSW Road Relays,The Crest,,
2026,2026-04-11,Canberra Marathon,Canberra,A,21km
soon,2026-01-01,Bad year,,,
2026,17/5,Odd date,,,
`;

test("parseRacesCsv skips rows without a 4-digit year and nulls a non-ISO date", () => {
  const races = parseRacesCsv(RACES_CSV);
  expect(races.map((r) => r.name)).toEqual(["Sydney 10", "NSW Road Relays", "Canberra Marathon", "Odd date"]);
  expect(races[0]).toEqual({
    year: "2026",
    name: "Sydney 10",
    date: "2026-05-17",
    location: "SOPAC",
    priority: "A",
    entered: "10km",
    note: null,
  });
  expect(races[3]!.date).toBeNull();
});

const ROWS = [
  { year: "2026", aRaces: "Cycling TTs (B)" },
  { year: "2027", aRaces: "Sydney 10" },
];

test("racesForYear uses the Races tab alone when it has rows for that year, dated first", () => {
  expect(racesForYear(ROWS, parseRacesCsv(RACES_CSV), "2026").map((r) => r.name)).toEqual([
    "Canberra Marathon",
    "Sydney 10",
    "NSW Road Relays",
    "Odd date",
  ]);
});

test("racesForYear falls back to the roadmap row when the tab has nothing for that year", () => {
  expect(racesForYear(ROWS, parseRacesCsv(RACES_CSV), "2027").map((r) => r.name)).toEqual(["Sydney 10"]);
  expect(racesForYear(ROWS, [], "2031")).toEqual([]);
});

test("groupRacesByMonth bands dated races by month and puts undated ones last", () => {
  const races = racesForYear(ROWS, parseRacesCsv(RACES_CSV), "2026");
  expect(groupRacesByMonth(races).map((m) => [m.label, m.races.length])).toEqual([
    ["April", 1],
    ["May", 1],
    ["Date TBC", 2],
  ]);
});

test("raceDayLabel renders weekday and day/month", () => {
  expect(raceDayLabel("2026-04-11")).toBe("Sat 11/4");
});
```

Run: `bun test training/roadmap.test.ts` — FAIL, exports missing.

- [ ] **Step 2: Implement in `training/roadmap.ts`**

```ts
// Empty until a "Races" tab exists in the roadmap sheet; while empty, only
// the undated A-race names from the roadmap rows are shown.
const ROADMAP_RACES_GID = "";

export interface RaceEntry {
  year: string;
  name: string;
  date: string | null;
  location: string | null;
  priority: "A" | "B" | null;
  entered: string | null;
  note: string | null;
}

export interface RoadmapData {
  rows: RoadmapRow[];
  notes: string[];
  races: RaceEntry[];
}

const TRAILING_PAREN_RE = /^(.*\S)\s*\(([^()]*)\)$/;

// The column is "A races", so an entry with no marker is priority A.
export function splitARaces(year: string, aRaces: string): RaceEntry[] {
  return aRaces
    .split("·")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part) => {
      const suffix = TRAILING_PAREN_RE.exec(part);
      const inside = suffix ? suffix[2]!.trim() : "";
      const isPriority = inside === "A" || inside === "B";
      return {
        year,
        name: suffix ? suffix[1]! : part,
        date: null,
        location: null,
        priority: isPriority ? inside : "A",
        entered: null,
        note: suffix && !isPriority ? inside : null,
      };
    });
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_RE = /^\d{4}$/;

const blankToNull = (value: string | undefined): string | null => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

export function parseRacesCsv(csv: string): RaceEntry[] {
  const [, ...body] = parseCsvRows(csv);
  const races: RaceEntry[] = [];
  for (const [year, date, name, location, priority, entered] of body) {
    const cleanYear = (year ?? "").trim();
    const cleanName = (name ?? "").trim();
    if (!YEAR_RE.test(cleanYear) || cleanName === "") continue;
    const cleanDate = (date ?? "").trim();
    const cleanPriority = (priority ?? "").trim().toUpperCase();
    races.push({
      year: cleanYear,
      name: cleanName,
      date: ISO_DATE_RE.test(cleanDate) ? cleanDate : null,
      location: blankToNull(location),
      priority: cleanPriority === "A" || cleanPriority === "B" ? cleanPriority : null,
      entered: blankToNull(entered),
      note: null,
    });
  }
  return races;
}

// A year with Races-tab rows uses those alone: mixing in the roadmap row's
// names would list the same race twice.
export function racesForYear(
  rows: Pick<RoadmapRow, "year" | "aRaces">[],
  races: RaceEntry[],
  year: string,
): RaceEntry[] {
  const fromTab = races.filter((race) => race.year === year);
  if (fromTab.length === 0) {
    const row = rows.find((r) => r.year === year);
    return row ? splitARaces(year, row.aRaces) : [];
  }
  const dated = fromTab.filter((race) => race.date !== null).sort((a, b) => a.date!.localeCompare(b.date!));
  return [...dated, ...fromTab.filter((race) => race.date === null)];
}

export interface RaceMonth {
  label: string;
  races: RaceEntry[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function groupRacesByMonth(races: RaceEntry[]): RaceMonth[] {
  const months: RaceMonth[] = [];
  for (const race of races) {
    const label = race.date ? MONTH_NAMES[Number(race.date.slice(5, 7)) - 1]! : "Date TBC";
    const last = months[months.length - 1];
    if (last && last.label === label) last.races.push(race);
    else months.push({ label, races: [race] });
  }
  return months;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function raceDayLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${DAY_NAMES[new Date(year!, month! - 1, day!).getDay()]} ${day}/${month}`;
}
```

TypeScript may widen `priority: isPriority ? inside : "A"` to `string`;
if `tsc` objects, annotate the mapped object's return type as `RaceEntry`
rather than casting.

`parseRoadmapCsv` keeps returning rows and notes only — change its return
type to `Pick<RoadmapData, "rows" | "notes">` so its two existing tests
stand untouched. Replace `fetchRoadmapData`:

```ts
async function fetchSheetCsv(gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${ROADMAP_SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch roadmap sheet: ${res.status}`);
  return res.text();
}

// The Races tab is optional: a missing or unreadable tab must leave the
// roadmap itself on screen, so its failure becomes "no dated races".
async function fetchRacesOrNone(): Promise<RaceEntry[]> {
  if (ROADMAP_RACES_GID === "") return [];
  try {
    return parseRacesCsv(await fetchSheetCsv(ROADMAP_RACES_GID));
  } catch {
    return [];
  }
}

export async function fetchRoadmapData(): Promise<RoadmapData> {
  const [csv, races] = await Promise.all([fetchSheetCsv(ROADMAP_GID), fetchRacesOrNone()]);
  return { ...parseRoadmapCsv(csv), races };
}
```

`roadmap-api.ts` needs no change. Run: `bun test training/roadmap.test.ts` — pass.

- [ ] **Step 3: `RaceCalendar`**

Create `training/RaceCalendar.tsx`:

```tsx
import { useState } from "react";
import { localToday } from "../shared/scheduling";
import { groupRacesByMonth, raceDayLabel, racesForYear } from "./roadmap";
import type { RaceEntry, RoadmapData } from "./roadmap";

function RaceCard({ race }: { race: RaceEntry }) {
  return (
    <div className={race.entered ? "card race-card race-card-entered" : "card race-card"}>
      <div className="card-top">
        <span className="card-meta">{race.date ? raceDayLabel(race.date) : "Date TBC"}</span>
        {race.priority && <span className="tag">{race.priority} race</span>}
      </div>
      <div className="card-title">{race.name}</div>
      {race.location && <div className="card-meta">{race.location}</div>}
      {race.note && <div className="card-meta">{race.note}</div>}
      {race.entered && <span className="race-entered">Entered · {race.entered}</span>}
    </div>
  );
}

export default function RaceCalendar({ data }: { data: RoadmapData }) {
  const years = data.rows.map((row) => row.year);
  const thisYear = localToday().slice(0, 4);
  const [year, setYear] = useState(years.includes(thisYear) ? thisYear : (years[0] ?? thisYear));
  const row = data.rows.find((r) => r.year === year);
  const races = racesForYear(data.rows, data.races, year);

  return (
    <div className="race-calendar">
      <div className="section-head">
        <label className="race-year">
          <span className="card-kicker">Year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <h2>{year} competitions</h2>
        <span className="board-count">{races.length}</span>
      </div>

      {races.length === 0 ? (
        <p className="board-empty">No competitions listed for {year} yet.</p>
      ) : (
        <div className="race-strip">
          {groupRacesByMonth(races).map((month) => (
            <section key={month.label} className="race-month">
              <h3 className="race-month-label">{month.label}</h3>
              <ul className="race-month-cards">
                {month.races.map((race) => (
                  <li key={`${race.name}-${race.date ?? "tbc"}`}>
                    <RaceCard race={race} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {row && (
        <dl className="race-glance">
          <div><dt>Phase</dt><dd>{row.phase}</dd></div>
          <div><dt>Age</dt><dd>{row.age}</dd></div>
          <div><dt>Main goal</dt><dd>{row.mainGoal}</dd></div>
          <div><dt>Run targets</dt><dd>{row.runTargets}</dd></div>
          <div><dt>Bike target</dt><dd>{row.bikeTarget}</dd></div>
          <div><dt>Status</dt><dd>{row.status || "—"}</dd></div>
        </dl>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Use it in `RoadmapLinks`**

Delete the local `RoadmapRow` / `RoadmapData` interfaces and
`import type { RoadmapData } from "./roadmap";` instead. Replace the
`roadmap-table-wrap` block with `<RaceCalendar data={data} />`; keep the
`failed` / loading states and the `roadmap-notes` list. Change the
section heading to "Race calendar" (the hard-coded "2026–2031" range was
already drifting from the sheet). Delete the now-unused `.roadmap-table*`
rules from `index.css` — no dead CSS.

- [ ] **Step 5: CSS**

```css
.race-year {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.race-year select {
  min-height: 44px;
  padding: 0 var(--space-3);
  font: inherit;
  font-family: var(--mono);
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.race-strip {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.race-month {
  flex: 0 0 auto;
}

.race-month-label {
  margin: 0 0 var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
  background: var(--panel-raised);
  border-radius: 6px;
}

.race-month-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: var(--space-2);
}

.race-month-cards > li {
  display: flex;
}

.race-card {
  width: 150px;
}

.race-card-entered {
  border-color: var(--gold);
}

.race-entered {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.2rem 0.5rem;
  font-family: var(--mono);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--on-accent);
  background: var(--gold);
  border-radius: 4px;
}

.race-glance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  margin: var(--space-5) 0 0;
}

.race-glance > div {
  padding: var(--space-3) var(--space-4);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.race-glance dt {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim);
}

.race-glance dd {
  margin: var(--space-1) 0 0;
}
```

Check `--on-accent` on `--gold` reads at 4.5:1 in both themes; if the
light theme fails, use `var(--text)` on a `color-mix` tint of gold
instead.

- [ ] **Step 6: Verify and commit**

Run: `bun test`, `bunx tsc --noEmit` — green.

```bash
git add training/ index.css
git commit -m "feat(training): replace the roadmap table with a per-year race calendar"
```

---

### Task 10: Live verification

No code. With `bun run dev` running, check each at desktop width and at
390px wide, in light and dark theme:

- [ ] **Home** — announcements and due items are card grids; ticking an
  announcement, Edit, Delete and "+ Add to deadlines" all still work;
  clicking a due card navigates; a due item with a link shows "Open
  link ↗". No horizontal page scroll at 390px.
- [ ] **Todo / Jobs / Uni** — look exactly as before (their rows were not
  touched).
- [ ] **Goals** — groups appear in the order Running, Cycling, Events,
  Recovery; "Powerman Run 2" is under Running; the FTP card shows
  `250W` large with "Mar 2027 · then 280–300W (2028)" beneath. Add a goal
  with no arrow ("Join Suvelo") — it renders as a title-only card. Edit a
  goal's group — it moves. Restart the server — categories persist.
- [ ] **Notes, desktop** — sidebar shows month headings with totals; the
  selected day is filled; entries are cards showing `HH:mm`; no Days
  button is visible.
- [ ] **Notes, 390px** (also load the phone capture page) — the chip row
  is gone; Days opens the drawer; choosing a day closes it and shows that
  day; the scrim and Escape close it; focus returns to Days.
- [ ] **Schedule** — Week / Month toggles and survives a reload; Month
  shows the right weeks for the current month with today outlined;
  clicking a cell updates the detail panel; the month tabs change month;
  the grid scrolls inside its box at 390px.
- [ ] **Roadmap** — year select defaults to the current year; each year
  lists its races; a year with none shows the empty message; the at-a-
  glance panel changes with the year; sheet notes still show.

- [ ] **Final:** `bun test` and `bunx tsc --noEmit` both green on `main`.

## Follow-up for the user (not a code task)

To get dates and month bands on the race calendar: add a tab named
"Races" to the roadmap Google Sheet with the header row
`Year, Date, Competition, Location, Priority, Entered` (Date as
`YYYY-MM-DD`), then put that tab's `gid` into `ROADMAP_RACES_GID` in
`training/roadmap.ts`.

## Continuous testing

- **Automated Hooks**: a hook fires every time the AI saves a change
  (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test
  suite (`bun test`), and the type checker (`tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure
  output immediately and attempts to fix its own mistake before the user
  has to intervene, so the user always returns to a green (passing)
  state.

The PostToolUse hook is configured repo-wide in `.claude/settings.json`
(runs `bun test` and `tsc --noEmit`); this section documents the
requirement rather than adding a feature-specific hook.
