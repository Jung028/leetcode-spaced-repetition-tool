# Refined Neutral Redesign — Design

## Overview

The app (Home, LeetCode board, Theory, Goals, Exam tabs — all sharing `index.css`) currently uses a literal LeetCode-clone look: near-black background, saturated orange accent applied to nearly every badge/border, and mono font used for almost all text. Feedback: it reads as flat/dated, transitions are abrupt or absent, and visual hierarchy is unclear because color is used decoratively rather than to signal state.

This redesign moves to a "Refined Neutral" direction: richer/warmer neutral surfaces with real elevation, a single accent color reserved for meaningful state signals only, hierarchy built from a type scale and spacing instead of color-coding everything, and a consistent motion system for all interactive transitions.

This is a **visual/styling redesign only** — no changes to data flow, component structure, routing, or business logic. All existing `bun test` suites must continue to pass unmodified.

## Goals

- Replace ad hoc color values with a token system (`index.css` `:root`) that reads as richer/warmer and less "shouty."
- Introduce a type scale; move primary reading content (titles, questions, prompts) from mono to sans, keeping mono only for code, dates, and tabular/numeric data.
- Introduce a spacing scale and apply it consistently across all 5 tabs.
- Add elevation (soft shadows) to modals and raised/hover panel states, replacing reliance on flat borders alone.
- Add a motion token system (`--ease`, `--dur-fast`, `--dur-base`) and apply smooth transitions to every hover/focus/active/reveal state that currently snaps instantly.
- Downgrade purely informational badges (language tag, category tag) to quiet outlined/ghost style; keep filled color only for state-meaningful tags (urgency, pass/fail, correct/wrong).
- Preserve `prefers-reduced-motion: reduce` behavior across all new transitions.

## Non-goals

- No layout/structural changes (breakpoints, grid arrangement, information architecture stay as-is).
- No new features, no new components, no routing changes.
- No changes to `.ts`/`.tsx` logic beyond `className` adjustments needed to apply new/renamed CSS classes.
- No light mode — dark theme only, per approved direction.

## Design tokens (`index.css` `:root`)

Replace the current token block:

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

Notes:
- `--orange` is renamed `--accent` throughout (grep/replace across `index.css` and any `.tsx` inline style usage — check `HomeApp.tsx`, `ExamApp.tsx`, `GoalsApp.tsx`, `TheoryApp.tsx`, `frontend.tsx` for `var(--orange)` or `--orange` references before removing the old name).
- `--gold` and `--red` are re-tuned slightly (`#ffc01e`→`#e0a83e`, `#ff375f`→`#ff5470`) to sit better against the new darker neutrals — verify contrast against `--bg`/`--panel` stays readable (aim ≥ 4.5:1 for text use, ≥ 3:1 for large text/borders).
- Existing `--green` value is kept unchanged (already reads well against the new neutrals).

## Component-level changes

### Masthead (`.masthead`, `.wordmark`, `.masthead-date`)
- `.masthead` border-bottom: `2px solid var(--orange)` → `1px solid var(--line)`.
- `.wordmark::before` (diamond glyph) keeps `background: var(--accent)` — the one deliberate brand touch.
- `.masthead-date` font-family: `var(--mono)` → `var(--sans)`, size drops to `var(--text-xs)`.

### Tabs (`.tabs`, `.tab`, `.tab-active`)
- `.tab`: add `transition: color var(--dur-fast) var(--ease); position: relative;`
- `.tab-active`: remove `border-bottom-color: var(--orange)`. Instead add a pseudo-element underline:
  ```css
  .tab-active::after {
    content: "";
    position: absolute;
    left: 0.9rem;
    right: 0.9rem;
    bottom: -2px;
    height: 2px;
    background: var(--accent);
    transform: scaleX(1);
    transition: transform var(--dur-base) var(--ease);
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
  ```
  (base `.tab::after` at `scaleX(0)`, active overrides to `scaleX(1)` — gives an animated underline when switching tabs since both elements are always present, only the scale differs).

### Stats strip (`.stats`, `.stat`, `button.stat:hover`)
- `.stats` container: drop the `background: var(--line)` grid-line trick in favor of `gap: var(--space-2)` between individually-elevated `.stat` cards, each with `box-shadow: var(--shadow-panel)` and `border-radius: 6px`. Remove the outer `border: 1px solid var(--line)`.
- `button.stat` hover: add `transition: background var(--dur-fast) var(--ease);`
- Numbers keep their semantic coloring (`.stat-due` gold, `.stat-overdue` red, `.stat-total` accent, `.stat-completed` green) — unchanged.

### Board / due list (`.board-row`, `.board-rows li`)
- `.board-row`: add `transition: background var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);`
- `.board-row:hover`: add `box-shadow: var(--shadow-panel);` alongside existing `background: var(--panel-raised)`.
- Left urgency border (`border-left: 3px solid var(--urgency, var(--gold))`) unchanged — real signal, stays.
- `@keyframes row-in` unchanged in shape; update the rule that applies it to use `var(--dur-base) var(--ease)` instead of the current hardcoded `0.35s ease`.

### Buttons (`.btn`, `.btn-primary`, `.btn-pass`, `.btn-fail`, `.btn-danger`)
- `.btn`: add `transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);`
- `.btn-primary:hover`, `.btn-pass:hover`, `.btn-fail:hover`: add `transform: translateY(-1px); box-shadow: var(--shadow-panel);` — lift effect reserved for these three (the "committing an action" buttons).
- Plain `.btn:hover` (neutral/secondary, e.g. Cancel/Back): keep color-only transition, no transform.

### Forms (`.form input`, `.form select`, `.form textarea`)
- Replace the hard `:focus { outline: 2px solid var(--orange); outline-offset: 0; border-color: transparent; }` with:
  ```css
  .form input, .form select, .form textarea {
    transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
  }
  .form input:focus, .form select:focus, .form textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
  }
  ```
- Same treatment applies to `.theory-answer:focus` (currently duplicates the hard-outline pattern).

### Badges/tags (`.tag`, `.lang-tag`, `.cat-tag`)
- `.tag` (urgency due/overdue badge): **unchanged** — filled background is a real state signal.
- `.lang-tag`: currently `background: var(--panel-raised); border: 1px solid var(--line);` — becomes borderless ghost style: `background: transparent; border: 1px solid var(--line); color: var(--dim);` (drop the panel-raised fill, keep only the outline — reads as metadata not alert). Add `transition: border-color var(--dur-fast) var(--ease);` if it ever appears interactive.
- `.cat-tag`: currently `background: var(--cat-color, var(--orange)); color: var(--bg);` (filled) — becomes outlined: `background: transparent; border: 1px solid var(--cat-color, var(--accent)); color: var(--cat-color, var(--accent));`. Category color remains distinguishable per-category, just no longer a solid block competing with real state badges.

### Modal (`.modal-backdrop`, `.modal-panel`)
- `.modal-panel`: add `box-shadow: var(--shadow-panel);` add entrance animation:
  ```css
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.97); }
  }
  .modal-panel {
    animation: modal-in var(--dur-base) var(--ease);
  }
  .modal-backdrop {
    animation: backdrop-in var(--dur-base) var(--ease);
  }
  @keyframes backdrop-in {
    from { opacity: 0; }
  }
  ```
- Guard both new keyframe animations under the existing `@media (prefers-reduced-motion: reduce)` block (which currently only disables `.board-rows li`'s animation — extend it to disable `.modal-panel` and `.modal-backdrop` animations too).

### Theory tab (`.theory-model-answer`)
- Add `box-shadow: var(--shadow-panel);` to `.theory-model-answer` (currently border-only).
- Reveal/hide of the model-answer panel (controlled by existing toggle state in `TheoryApp.tsx`) gets a `transition: opacity var(--dur-base) var(--ease);` — confirm whether the toggle currently conditionally renders (unmount/mount) vs. CSS-hides the panel; if it's conditional rendering, no CSS transition is possible without restructuring the component (out of scope — a `max-height`/`opacity` CSS-only crossfade requires the element to stay mounted). **Decision: if `TheoryApp.tsx` conditionally renders the panel, leave the reveal instant (no code restructuring) — this is a CSS-only redesign.** Only apply the transition if the panel is already always-mounted and toggled via a class/style.

### Goals tab (`.goal-weight`, `.goal-deadline`, `.step-row input[type="checkbox"]`)
- Retint `.goal-weight`/`.goal-deadline` to new `--dim`/`--text-sm` tokens — no structural change.
- `.step-row input[type="checkbox"]`: add `transition: accent-color var(--dur-fast) var(--ease);` (best-effort — checkbox transition support is limited across browsers; acceptable if it has no visible effect in some browsers, it's a progressive enhancement).

### Exam tab (`.exam-option`, `.exam-option-correct`, `.exam-option-wrong`)
- `.exam-option`: add `transition: background var(--dur-base) var(--ease), border-color var(--dur-base) var(--ease);`
- `.exam-option-correct` / `.exam-option-wrong`: unchanged colors, but since the base `.exam-option` now transitions, adding/removing these modifier classes on reveal will animate smoothly instead of snapping — **no code change needed** if `ExamApp.tsx` already toggles these classes conditionally after mount (verify during implementation; if colors are applied via inline style instead of class toggle, transition still works as long as the property change happens post-mount, not on initial render).

## Responsive & accessibility

- No breakpoint changes — existing `@media (max-width: 640px)` rules stay as-is, just inherit new token values.
- Extend the existing `@media (prefers-reduced-motion: reduce)` block to disable: `.board-rows li` animation (already covered), `.modal-panel`/`.modal-backdrop` animations (new), and set `transition: none !important` on `.tab::after`/`.tab-active::after`, `.btn`, `.board-row`, `.exam-option`, form inputs — i.e., every new `transition`/`animation` declaration added by this redesign must have a corresponding reduced-motion override.
- `:focus-visible` global rule updates from hard `outline: 2px solid var(--orange)` to the same soft ring treatment as form inputs (`outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);`) — verify this remains clearly visible against both `--bg` and `--panel` backgrounds (manual check, not automated).
- Contrast check (manual, via browser devtools or a contrast checker) required for: `--dim` on `--bg`, `--gold`/`--red`/`--accent` text-use on `--bg`/`--panel`, new ghost badge text (`--dim` on `transparent`/`--panel`). Target ≥ 4.5:1 for body text, ≥ 3:1 for large text (≥ 24px) and non-text UI (borders, focus rings).

## File structure

All changes are contained in:
- Modify: `index.css` (token block + all component rules listed above)
- Modify (className only, no logic changes, only if a class is renamed/removed — e.g. `.tag`/`.lang-tag`/`.cat-tag` usages): `HomeApp.tsx`, `ExamApp.tsx`, `GoalsApp.tsx`, `TheoryApp.tsx`, `frontend.tsx`
- No new files, no deleted files, no test files change (existing `.test.ts`/`.test.tsx` suites are logic tests unaffected by CSS-only changes — they must still pass unmodified).

## Verification approach

This is a CSS/visual change with no automated visual regression tooling in this repo. Verification is:
1. `bun test` — full suite must remain green (proves no logic was broken by incidental className edits).
2. `tsc` — must remain clean (proves no TypeScript errors introduced).
3. Manual review in the running app (`bun --hot ./index.ts`) — walk all 5 tabs (Home, LeetCode board, Theory, Goals, Exam), check: hover/focus states transition smoothly, modal open/close animates, exam answer reveal animates, tab switch underline animates, badges read as intended (filled = state, outlined = metadata), contrast is readable, `prefers-reduced-motion` (via OS/browser emulation) disables all motion.

## Spec requirement: continuous testing

- **Automated Hooks**: a hook fires every time the AI saves a change (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test suite (`bun test`), and the type checker (`tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure output immediately and attempts to fix its own mistake before the user has to intervene, so the user always returns to a green (passing) state.

This repo has no such hook configured yet (no `.git/hooks/pre-commit`, no CI, no PostToolUse hook in `.claude/settings.json`). This remains an outstanding requirement independent of this redesign; the implementation plan should run `bun test` and `tsc` manually after each task in the interim.
