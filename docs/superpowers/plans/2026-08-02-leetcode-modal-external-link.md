# LeetCode Popup Row-Click External Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make clicking a row in the LeetCode tab's Tracked/Due/Overdue/Completed popup lists open the problem's external LeetCode page, matching the tab's own "Due today" board, with the internal detail view moved to the small icon button instead.

**Architecture:** Single-component change — swap which of `TrackedListModal`'s two existing buttons calls `openExternal(p.url)` versus `onOpen(p.id)`. No new components, props, or CSS.

**Tech Stack:** React (via Bun's HTML-import bundling), no build step beyond `bun --hot index.ts`.

## Global Constraints

- Scope is exactly `TrackedListModal` in `frontend.tsx:108-173` — no changes to `home-api.ts`, `HomeApp.tsx`, Theory, or Goals code.
- Reuse existing CSS classes (`modal-row`, `board-row-review`) and copy ("View details & mark review" / "View details") verbatim from the Due board's own icon (`frontend.tsx:303-310`) — no new classes.
- This repo has no frontend test harness for `frontend.tsx` — verification is manual via `bun --hot index.ts`, not automated tests.

---

### Task 1: Swap row and icon click handlers in `TrackedListModal`

**Files:**
- Modify: `frontend.tsx:144-165`

**Interfaces:**
- No exported signatures change — `TrackedListModal`'s props (`title`, `emptyMessage`, `problems`, `onOpen`, `onClose`) and its four call sites (`frontend.tsx:231-261`, the Tracked/Due/Overdue/Completed modal invocations) are untouched.

- [ ] **Step 1: Make the change**

Replace this block (`frontend.tsx:144-165`):

```tsx
                <div className="modal-row">
                  <button
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0, textAlign: "left" }}
                    onClick={() => {
                      onOpen(p.id);
                      onClose();
                    }}
                  >
                    <span className="modal-row-date">{p.next_review}</span>
                    <span className="modal-row-title">{p.title}</span>
                    <span className="lang-tag">{p.language}</span>
                    <RungMeter rung={p.rung} />
                  </button>
                  <button
                    className="board-row-review"
                    onClick={() => openExternal(p.url)}
                    title="Open on LeetCode"
                    aria-label="Open on LeetCode"
                  >
                    ↗
                  </button>
                </div>
```

with:

```tsx
                <div className="modal-row">
                  <button
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0, textAlign: "left" }}
                    onClick={() => openExternal(p.url)}
                  >
                    <span className="modal-row-date">{p.next_review}</span>
                    <span className="modal-row-title">{p.title}</span>
                    <span className="lang-tag">{p.language}</span>
                    <RungMeter rung={p.rung} />
                  </button>
                  <button
                    className="board-row-review"
                    onClick={() => {
                      onOpen(p.id);
                      onClose();
                    }}
                    title="View details & mark review"
                    aria-label="View details"
                  >
                    ⋯
                  </button>
                </div>
```

The only differences: the main row button's `onClick` changes from `onOpen(p.id); onClose();` to `openExternal(p.url)` (and no longer needs the multi-line handler, since it's a single call). The icon button's `onClick` changes from `openExternal(p.url)` to `onOpen(p.id); onClose();`, its `title`/`aria-label` change to describe the detail view, and its glyph changes from `↗` to `⋯`.

- [ ] **Step 2: Type-check**

Run: `bunx tsc --noEmit`
Expected: no new errors (this is a pure behavior swap, no type shape changes).

- [ ] **Step 3: Manual verification**

Run: `bun --hot index.ts` (check the terminal for the port it prints, or set `PORT` if 3000 is in use).

In a browser, on the LeetCode tab:
1. Click each of the four stat tiles (Tracked, Due, Overdue, Completed) to open their popups.
2. In each popup, click a row's main body — confirm it opens the problem's LeetCode page in a new browser tab, and the popup stays open.
3. Click the `⋯` icon on a row — confirm it opens that problem's internal detail/review view and the popup closes.
4. Confirm this didn't change the "Due today" board itself (`frontend.tsx:288-315`) — it wasn't touched, but worth a quick glance to confirm no visual regression from CSS reuse.

- [ ] **Step 4: Commit**

```bash
git add frontend.tsx
git commit -m "Swap LeetCode popup row click to open external link, icon to open detail view"
```

---

## Self-Review Notes

- **Spec coverage:** the design doc's single requirement (swap the two handlers, reuse existing classes/copy, no other files touched) is fully covered by Task 1's one code change.
- **Placeholder scan:** none — the before/after code blocks are complete and copy-pasteable.
- **Type consistency:** no signatures changed; `onOpen`/`onClose`/`openExternal` are all pre-existing functions used exactly as they're already defined elsewhere in this file.
