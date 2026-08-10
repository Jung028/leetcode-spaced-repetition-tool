# Refined Neutral Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the shared `index.css` design system (and nothing else — this app's 5 tabs are pure consumers of these classes) from a literal LeetCode-orange-on-near-black look to a "Refined Neutral" visual language: richer/warmer neutral surfaces with real elevation, a single accent color reserved for meaningful state signals, hierarchy from a type/spacing scale instead of decorative color, and a consistent motion system for every hover/focus/reveal transition.

**Architecture:** This is a CSS-only change. Investigation confirmed zero `var(--orange)` or component-level color/style logic lives outside `index.css` — every `.tsx` file only ever references class names (`tag`, `lang-tag`, `cat-tag`, `exam-option`, `board-row`, `stat`, `modal-panel`, etc.), never CSS custom properties or inline colors tied to the old naming. That means every task in this plan touches only `index.css`; no `.tsx` file needs a single line changed. Tasks proceed foundation-first (design tokens) then outward per component group, so later tasks can rely on tokens (`--accent`, `--space-*`, `--dur-*`, `--shadow-panel`) already existing.

**Tech Stack:** Bun (`bun --hot index.ts` dev server), plain CSS custom properties (no preprocessor/Tailwind), React 19 via Bun's HTML-import bundler, `bun test` for the existing logic test suite, `bunx tsc` for type checking (already configured `noEmit: true` in `tsconfig.json`).

## Global Constraints

- CSS-only scope: no `.tsx`/`.ts` file may be modified by this plan (per spec Non-goals). If any task appears to require a `.tsx` change, stop and flag it — that means an assumption in this plan was wrong.
- No layout/breakpoint changes — existing `@media (max-width: 640px)` rules are preserved as-is.
- No light mode — dark theme only.
- Every new `transition`/`animation` declaration must have a corresponding override in the `@media (prefers-reduced-motion: reduce)` block (Task 9 collects all of them, but note them as you go).
- `--orange` is renamed to `--accent` everywhere (mechanical rename, Task 1) — no other token is renamed, only re-valued.
- After every task: `bun test` must stay green and `bunx tsc` must stay clean (CSS changes can't logically break either, but this proves no incidental edit slipped into the wrong file).
- This repo has no PostToolUse test/typecheck hook configured yet (outstanding requirement per project CLAUDE.md, out of scope for this plan) — run `bun test` and `bunx tsc` manually after every task instead.

---

### Task 1: Foundation tokens (`:root` block + global `--orange` → `--accent` rename)

**Files:**
- Modify: `index.css:1-14` (the `:root` token block), plus a file-wide mechanical rename of every remaining `var(--orange)` occurrence.

**Interfaces:**
- Consumes: nothing (this is the first task).
- Produces: `--bg`, `--panel`, `--panel-raised`, `--line`, `--text`, `--dim`, `--accent`, `--green`, `--gold`, `--red`, `--mono`, `--sans`, `--text-xs`, `--text-sm`, `--text-base`, `--text-md`, `--text-lg`, `--text-xl`, `--space-1`..`--space-8`, `--shadow-panel`, `--ease`, `--dur-fast`, `--dur-base` — every later task in this plan uses these names verbatim.

- [ ] **Step 1: Replace the `:root` token block**

Current `index.css:1-14`:

```css
:root {
  --bg: #1a1a1a;
  --panel: #262626;
  --panel-raised: #2d2d2d;
  --line: #3e3e3e;
  --text: #eff2f6;
  --dim: #9c9c9c;
  --orange: #ffa116;
  --green: #00b8a3;
  --gold: #ffc01e;
  --red: #ff375f;
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --sans: "Space Grotesk", system-ui, -apple-system, sans-serif;
}
```

Replace with:

```css
:root {
  --bg: #17171a;
  --panel: #1f1f23;
  --panel-raised: #27272c;
  --line: #2c2c31;
  --text: #ececea;
  --dim: #97969e;

  --accent: #f2994a;
  --green: #00b8a3;
  --gold: #e0a83e;
  --red: #ff5470;

  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --sans: "Space Grotesk", system-ui, -apple-system, sans-serif;

  --text-xs: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 0.9375rem;
  --text-md: 1.0625rem;
  --text-lg: 1.3rem;
  --text-xl: 1.7rem;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;

  --shadow-panel: 0 1px 2px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15);

  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast: 120ms;
  --dur-base: 200ms;
}
```

- [ ] **Step 2: Globally rename every remaining `var(--orange)` to `var(--accent)`**

Run a search to find every remaining occurrence (there are 21 after Step 1 removed the definition line):

```bash
grep -n -- "--orange" index.css
```

Replace every `var(--orange)` with `var(--accent)` across the whole file (find/replace, not line-by-line — the goal is that after this step, `grep -n -- "--orange" index.css` returns nothing). Do not change anything else in these rules yet — later tasks handle each section's other properties.

- [ ] **Step 3: Verify the rename is complete**

Run: `grep -n -- "--orange" index.css`
Expected: no output (zero matches).

- [ ] **Step 4: Run the regression suite and type checker**

Run: `bun test`
Expected: all existing suites PASS (unchanged — this is a CSS-only edit).

Run: `bunx tsc`
Expected: no errors.

- [ ] **Step 5: Manual visual smoke check**

Run: `bun run dev`, open the app in a browser. Confirm: the page loads without console errors about missing CSS variables, the background reads as a deep neutral (not pure black), and the accent color (masthead diamond glyph, active tab, primary buttons, `due`/`overdue` badges) still reads as a warm orange/amber, just slightly less saturated than before.

- [ ] **Step 6: Commit**

```bash
git add index.css
git commit -m "style: introduce Refined Neutral design tokens, rename --orange to --accent"
```

---

### Task 2: Masthead + tabs navigation

**Files:**
- Modify: `index.css` — `.masthead`, `.masthead-date` rules (originally lines 48-80); `.tabs`, `.tab`, `.tab-active` rules (originally lines 734-757). Locate by the exact snippets below — Task 1 shifted line numbers.

**Interfaces:**
- Consumes: `--line`, `--sans`, `--text-xs`, `--accent`, `--dur-fast`, `--dur-base`, `--ease` (from Task 1).
- Produces: no new tokens; `.tab`/`.tab-active` gain a `::after` pseudo-element used only within these two rules.

- [ ] **Step 1: Quiet the masthead border, de-emphasize the date**

Find:

```css
.masthead {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 0.75rem;
  margin-bottom: 1.75rem;
}
```

Replace with:

```css
.masthead {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0.75rem;
  margin-bottom: 1.75rem;
}
```

Find:

```css
.masthead-date {
  color: var(--dim);
  flex: 1;
  font-family: var(--mono);
  font-size: 0.85rem;
}
```

Replace with:

```css
.masthead-date {
  color: var(--dim);
  flex: 1;
  font-family: var(--sans);
  font-size: var(--text-xs);
}
```

(`.wordmark::before` keeps `background: var(--accent)` unchanged — it's the one deliberate brand touch, per spec.)

- [ ] **Step 2: Animated underline for tabs**

Find:

```css
.tab {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  border-radius: 5px;
  color: var(--dim);
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--text);
}

.tab-active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

Replace with:

```css
.tab {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  border-radius: 5px;
  color: var(--dim);
  position: relative;
  transition: color var(--dur-fast) var(--ease);
}

.tab::after {
  content: "";
  position: absolute;
  left: 0.9rem;
  right: 0.9rem;
  bottom: -2px;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transition: transform var(--dur-base) var(--ease);
}

.tab:hover {
  color: var(--text);
}

.tab-active {
  color: var(--accent);
}

.tab-active::after {
  transform: scaleX(1);
}
```

- [ ] **Step 3: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 4: Manual visual check**

`bun run dev`, open the app. Confirm: masthead has a thin neutral divider (not a thick orange one), the date text is smaller/sans-serif, and switching tabs slides an orange underline under the active tab instead of an instant hard border. Click through all 5 tabs (Home, LeetCode, Theory, Goals, Exam) to confirm the underline follows correctly on each.

- [ ] **Step 5: Commit**

```bash
git add index.css
git commit -m "style: refine masthead and animate tab underline"
```

---

### Task 3: Stats strip + board rows

**Files:**
- Modify: `index.css` — `.stats`, `.stats-3`, `.stat`, `button.stat:hover` rules (originally lines 92-151); `.board-rows li`, `@keyframes row-in`, `.board-row`, `.board-row:hover` rules (originally lines 333-366).

**Interfaces:**
- Consumes: `--space-2`, `--space-6`, `--shadow-panel`, `--dur-fast`, `--dur-base`, `--ease` (from Task 1).
- Produces: no new tokens.

- [ ] **Step 1: Give each stat its own elevated card instead of a shared grid-line background**

Find:

```css
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.stats-3 {
  grid-template-columns: repeat(3, 1fr);
}

.stat {
  background: var(--panel);
  padding: 0.9rem 1.1rem;
}
```

Replace with:

```css
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.stats-3 {
  grid-template-columns: repeat(3, 1fr);
}

.stat {
  background: var(--panel);
  padding: 0.9rem 1.1rem;
  border-radius: 6px;
  box-shadow: var(--shadow-panel);
}
```

Find:

```css
button.stat {
  text-align: left;
  width: 100%;
  cursor: pointer;
}

button.stat:hover {
  background: var(--panel-raised);
}
```

Replace with:

```css
button.stat {
  text-align: left;
  width: 100%;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}

button.stat:hover {
  background: var(--panel-raised);
}
```

- [ ] **Step 2: Smooth board row hover, tokenize row-in timing**

Find:

```css
.board-rows li {
  animation: row-in 0.35s ease backwards;
}
```

Replace with:

```css
.board-rows li {
  animation: row-in var(--dur-base) var(--ease) backwards;
}
```

Find:

```css
.board-row {
  display: flex;
  align-items: stretch;
  width: 100%;
  background: var(--panel);
  border-radius: 6px;
  border-left: 3px solid var(--urgency, var(--gold));
  font-family: var(--mono);
  transition: background 0.15s ease;
}

.board-row:hover {
  background: var(--panel-raised);
}
```

Replace with:

```css
.board-row {
  display: flex;
  align-items: stretch;
  width: 100%;
  background: var(--panel);
  border-radius: 6px;
  border-left: 3px solid var(--urgency, var(--gold));
  font-family: var(--mono);
  transition: background var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}

.board-row:hover {
  background: var(--panel-raised);
  box-shadow: var(--shadow-panel);
}
```

- [ ] **Step 3: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 4: Manual visual check**

`bun run dev`. On Home, LeetCode board, Theory, Goals, and Exam tabs (all use `.stats`/`.board-row`), confirm: each stat tile reads as a distinct raised card (not a shared grid with hairlines), hovering a board row lifts it slightly via shadow instead of just a flat background swap, and the due-list row-in animation still plays on load/filter without visible timing changes.

- [ ] **Step 5: Commit**

```bash
git add index.css
git commit -m "style: elevate stat cards and board rows with shadow-based depth"
```

---

### Task 4: Buttons + forms + textarea focus states

**Files:**
- Modify: `index.css` — `.btn`, `.btn-primary:hover`, `.btn-pass:hover`, `.btn-fail:hover` rules (originally lines 534-580); `.form input/select/textarea`, focus rules (originally lines 487-514); `.theory-answer`, `.theory-answer:focus` (originally lines 789-808).

**Interfaces:**
- Consumes: `--dur-fast`, `--ease`, `--shadow-panel`, `--accent` (from Task 1).
- Produces: no new tokens.

- [ ] **Step 1: Smooth + lift primary/pass/fail buttons on hover**

Find:

```css
.btn {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  color: var(--text);
}
```

Replace with:

```css
.btn {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  color: var(--text);
  transition:
    background var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
}
```

Find:

```css
.btn-primary:hover {
  border-color: var(--accent);
  filter: brightness(1.08);
}
```

Replace with:

```css
.btn-primary:hover {
  border-color: var(--accent);
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: var(--shadow-panel);
}
```

Find:

```css
.btn-pass:hover {
  background: color-mix(in srgb, var(--green) 12%, transparent);
}
```

Replace with:

```css
.btn-pass:hover {
  background: color-mix(in srgb, var(--green) 12%, transparent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-panel);
}
```

Find:

```css
.btn-fail:hover {
  background: color-mix(in srgb, var(--red) 12%, transparent);
}
```

Replace with:

```css
.btn-fail:hover {
  background: color-mix(in srgb, var(--red) 12%, transparent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-panel);
}
```

(`.btn:hover` plain/neutral buttons — e.g. Cancel/Back — are intentionally left untouched: they already only change `border-color`, and now inherit the smooth `transition` from the base `.btn` rule above with no added lift, per spec: motion is reserved for committing actions.)

- [ ] **Step 2: Soft focus ring on form inputs**

Find:

```css
.form input,
.form select,
.form textarea {
  font-family: var(--mono);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 0.6rem 0.7rem;
}

.form select {
  max-width: 12rem;
}

.form input:focus,
.form select:focus,
.form textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: 0;
  border-color: transparent;
}
```

Replace with:

```css
.form input,
.form select,
.form textarea {
  font-family: var(--mono);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 0.6rem 0.7rem;
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}

.form select {
  max-width: 12rem;
}

.form input:focus,
.form select:focus,
.form textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}
```

- [ ] **Step 3: Same soft focus ring on the Theory tab's answer textarea**

Find:

```css
.theory-answer {
  display: block;
  width: 100%;
  font-family: var(--mono);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 0.7rem 0.8rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.theory-answer:focus {
  outline: 2px solid var(--accent);
  outline-offset: 0;
  border-color: transparent;
}
```

Replace with:

```css
.theory-answer {
  display: block;
  width: 100%;
  font-family: var(--mono);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 0.7rem 0.8rem;
  resize: vertical;
  margin-bottom: 1rem;
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}

.theory-answer:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}
```

- [ ] **Step 4: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 5: Manual visual check**

`bun run dev`. On the "Add problem" form and the Theory tab's answer box: click into an input/textarea and confirm the focus ring fades in smoothly (soft glow, not a hard-cut outline). On a board row's Pass/Fail buttons (Exam or LeetCode detail view) and the primary Save/Submit button: hover and confirm a slight upward lift with shadow, smoothly animated. Confirm plain/secondary buttons (e.g. Cancel) still just fade their border color with no lift.

- [ ] **Step 6: Commit**

```bash
git add index.css
git commit -m "style: smooth button and form focus/hover transitions"
```

---

### Task 5: Badges/tags — downgrade informational tags to ghost style

**Files:**
- Modify: `index.css` — `.lang-tag` rule (originally lines 434-445); `.cat-tag` rule (originally lines 760-770). `.tag` is **not modified** — it stays filled (state-meaningful).

**Interfaces:**
- Consumes: `--panel-raised`, `--line`, `--dim`, `--accent` (from Task 1, values already updated by Task 1).
- Produces: no new tokens.

- [ ] **Step 1: `.lang-tag` loses its fill, keeps only the outline**

Find:

```css
.lang-tag {
  font-family: var(--mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dim);
  background: var(--panel-raised);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;
}
```

Replace with:

```css
.lang-tag {
  font-family: var(--mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dim);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;
}
```

- [ ] **Step 2: `.cat-tag` becomes an outlined badge instead of a solid block**

Find:

```css
.cat-tag {
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bg);
  background: var(--cat-color, var(--accent));
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
}
```

Replace with:

```css
.cat-tag {
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--cat-color, var(--accent));
  background: transparent;
  border: 1px solid var(--cat-color, var(--accent));
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
}
```

(`.cat-tag` is used with an inline `style={{ "--cat-color": ... }}` in `HomeApp.tsx`, `TheoryApp.tsx` — this is unaffected since `--cat-color` is set per-instance via inline style, not touched by this CSS-only change.)

- [ ] **Step 3: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 4: Manual visual check**

`bun run dev`. On Home (deadline banners, tracked-list modal), LeetCode board (language tags), and Theory (category tags): confirm language and category tags now read as quiet outlined badges (no solid fill), while the due/overdue urgency `.tag` badges (and Exam's pass/fail-style tags) still show as solid filled pills. The two should now look visually distinct — filled = "this needs your attention", outlined = "this is just metadata".

- [ ] **Step 5: Commit**

```bash
git add index.css
git commit -m "style: downgrade language/category tags to outlined ghost badges"
```

---

### Task 6: Modal elevation + entrance animation

**Files:**
- Modify: `index.css` — `.modal-backdrop`, `.modal-panel` rules (originally lines 154-174), plus two new `@keyframes` blocks.

**Interfaces:**
- Consumes: `--shadow-panel`, `--dur-base`, `--ease` (from Task 1).
- Produces: `@keyframes backdrop-in`, `@keyframes modal-in` — referenced again in Task 9's reduced-motion block.

- [ ] **Step 1: Add elevation shadow and fade/scale-in animation**

Find:

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.25rem;
}
```

Replace with:

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
  animation: backdrop-in var(--dur-base) var(--ease);
}

.modal-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow-panel);
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.25rem;
  animation: modal-in var(--dur-base) var(--ease);
}

@keyframes backdrop-in {
  from {
    opacity: 0;
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
}
```

- [ ] **Step 2: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 3: Manual visual check**

`bun run dev`. Open any modal (e.g. click the "due" stat tile on Home, or the tracked-list stat on the LeetCode board, or the completed-papers modal on Exam). Confirm the backdrop fades in and the panel fades+scales in smoothly rather than popping in instantly, and the panel now has a visible soft shadow lifting it off the backdrop.

- [ ] **Step 4: Commit**

```bash
git add index.css
git commit -m "style: add modal elevation and entrance animation"
```

---

### Task 7: Theory model-answer panel + Goals tab retint

**Files:**
- Modify: `index.css` — `.theory-model-answer` rule (originally lines 810-816); `.goal-weight`, `.goal-deadline` rules (originally lines 874-887); `.step-row input[type="checkbox"]` rule (originally lines 894-899).

**Interfaces:**
- Consumes: `--shadow-panel`, `--text-sm`, `--text-xs`, `--dur-fast`, `--ease`, `--accent` (from Task 1).
- Produces: no new tokens.

- [ ] **Step 1: Elevate the model-answer reveal panel**

Find:

```css
.theory-model-answer {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 1rem;
  margin: 0 0 1.2rem;
}
```

Replace with:

```css
.theory-model-answer {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: var(--shadow-panel);
  padding: 1rem;
  margin: 0 0 1.2rem;
}
```

This panel is conditionally rendered (`{revealed ? (<div className="theory-model-answer">...) : null}` in `TheoryApp.tsx`), so no reveal *transition* is added here (per spec: CSS transitions can't animate mount/unmount without restructuring the component, which is out of scope) — it just gets the same elevation treatment as other panels.

- [ ] **Step 2: Move Goals meta text onto the type scale**

Find:

```css
.goal-weight {
  font-family: var(--mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dim);
  flex-shrink: 0;
}

.goal-deadline {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--dim);
  flex-shrink: 0;
}
```

Replace with:

```css
.goal-weight {
  font-family: var(--mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--dim);
  flex-shrink: 0;
}

.goal-deadline {
  font-family: var(--mono);
  font-size: var(--text-xs);
  color: var(--dim);
  flex-shrink: 0;
}
```

- [ ] **Step 3: Smooth checkbox accent transition**

Find:

```css
.step-row input[type="checkbox"] {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  accent-color: var(--accent);
}
```

Replace with:

```css
.step-row input[type="checkbox"] {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  accent-color: var(--accent);
  transition: accent-color var(--dur-fast) var(--ease);
}
```

(Browser support for transitioning `accent-color` varies — this is a best-effort progressive enhancement; if a browser ignores it, the checkbox still functions and looks correct, just without the transition.)

- [ ] **Step 4: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 5: Manual visual check**

`bun run dev`. On Theory, reveal a model answer and confirm the panel has a visible soft shadow. On Goals, confirm weight/deadline text still reads clearly (just very slightly resized) and checking/unchecking a step still works correctly.

- [ ] **Step 6: Commit**

```bash
git add index.css
git commit -m "style: elevate theory model-answer panel, retint goals meta text"
```

---

### Task 8: Exam tab — smooth answer reveal

**Files:**
- Modify: `index.css` — `.exam-option` rule (originally lines 918-927).

**Interfaces:**
- Consumes: `--dur-base`, `--ease` (from Task 1).
- Produces: no new tokens.

- [ ] **Step 1: Add transition to the base exam-option so the correct/wrong reveal animates**

Find:

```css
.exam-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  cursor: pointer;
}
```

Replace with:

```css
.exam-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  cursor: pointer;
  transition: background var(--dur-base) var(--ease), border-color var(--dur-base) var(--ease);
}
```

`.exam-option-correct`/`.exam-option-wrong` need no changes — in `ExamApp.tsx`, the `cls` variable that picks these modifier classes is computed from the `graded` boolean, which starts `false` and only becomes `true` after the user answers (a genuine post-mount class swap via React re-render), so the browser will animate the `background`/`border-color` change on the existing `.exam-option` element rather than snapping — confirmed by reading `ExamApp.tsx:160-185`.

- [ ] **Step 2: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 3: Manual visual check**

`bun run dev`, go to Exam, answer a question. Confirm the correct/wrong background and border color fade in smoothly over ~200ms instead of snapping instantly.

- [ ] **Step 4: Commit**

```bash
git add index.css
git commit -m "style: animate exam answer reveal"
```

---

### Task 9: Reduced-motion guards + accessible focus ring + contrast verification

**Files:**
- Modify: `index.css` — `:focus-visible` rule (originally lines 36-39); `@media (prefers-reduced-motion: reduce)` block (originally lines 867-871).

**Interfaces:**
- Consumes: every `transition`/`animation` declaration added in Tasks 2-8, plus `--accent` (from Task 1).
- Produces: nothing further consumed by later tasks (this is the final task).

- [ ] **Step 1: Soft global focus ring, consistent with the form-input treatment from Task 4**

Find:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

Replace with:

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}
```

- [ ] **Step 2: Extend the reduced-motion block to cover every animation/transition added by this redesign**

Find:

```css
@media (prefers-reduced-motion: reduce) {
  .board-rows li {
    animation: none;
  }
}
```

Replace with:

```css
@media (prefers-reduced-motion: reduce) {
  .board-rows li,
  .modal-panel,
  .modal-backdrop {
    animation: none;
  }

  .tab::after,
  .tab,
  .btn,
  .board-row,
  button.stat,
  .exam-option,
  .form input,
  .form select,
  .form textarea,
  .theory-answer,
  .step-row input[type="checkbox"] {
    transition: none !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Run the regression suite and type checker**

Run: `bun test` — expect all PASS.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 4: Manual verification — reduced motion**

In browser devtools, emulate `prefers-reduced-motion: reduce` (Chrome DevTools: Rendering tab → "Emulate CSS media feature prefers-reduced-motion"). Reload the app and confirm: the due-list row-in animation no longer plays, modals appear instantly with no fade/scale, tab switching shows/hides the underline instantly with no slide, and hover/focus states apply instantly with no fade or lift. Turn the emulation off and confirm all motion returns.

- [ ] **Step 5: Manual verification — contrast**

Using browser devtools' contrast checker (or an equivalent tool) on the running app, verify these pairs meet target ratios:
- `--dim` (`#97969e`) text on `--bg` (`#17171a`): target ≥ 4.5:1 (body text)
- `--gold` (`#e0a83e`) text on `--bg`/`--panel`: target ≥ 4.5:1
- `--red` (`#ff5470`) text on `--bg`/`--panel`: target ≥ 4.5:1
- `--accent` (`#f2994a`) text on `--bg`/`--panel` (e.g. active tab label, `.lang-tag`/`.cat-tag` outlined text): target ≥ 4.5:1
- `--line` (`#2c2c31`) as a border against `--panel`/`--bg` (non-text UI): target ≥ 3:1

If any pair fails its target, adjust that single token's lightness slightly (do not change hue) and re-check — do not proceed to commit with a failing pair.

- [ ] **Step 6: Commit**

```bash
git add index.css
git commit -m "style: add reduced-motion guards and accessible focus ring"
```

---

## Self-Review Notes

**Spec coverage:** every section of `docs/superpowers/specs/2026-08-10-refined-neutral-redesign-design.md` maps to a task — Foundation tokens → Task 1; Masthead/Tabs/Stats/Board → Tasks 2-3; Buttons/Forms/Badges/Modal → Tasks 4-6; Theory/Goals/Exam tab-specifics → Tasks 7-8; Responsive & accessibility → Task 9. The spec's two open ambiguities (Theory model-answer mount behavior, Exam option class-toggle timing) were resolved by reading the actual component code (`TheoryApp.tsx:510`, `ExamApp.tsx:160-185`) before writing Tasks 7 and 8, rather than left as a decision for the implementer.

**Placeholder scan:** no TBD/TODO; every step shows exact CSS before/after; every command is a real, runnable command for this stack (`bun test`, `bunx tsc`, `bun run dev`).

**Type/token consistency:** all token names (`--accent`, `--space-*`, `--text-*`, `--dur-*`, `--ease`, `--shadow-panel`) are defined once in Task 1 and referenced identically (same spelling) in every later task — verified by re-reading each task's CSS against the Task 1 token list above.
