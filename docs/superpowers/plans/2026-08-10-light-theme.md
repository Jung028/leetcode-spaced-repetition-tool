# Light Theme (Brown/Cream) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second, light theme (warm cream background, brown/coffee accent) alongside the existing dark theme, switchable via a masthead-area toggle button that persists the choice and defaults to the OS's `prefers-color-scheme`.

**Architecture:** CSS + minimal JS. Every color in `index.css` already flows through a `var(--token)`, so light mode is a second block of token values gated by a `data-theme` attribute on `<html>`, set by an inline pre-paint script (`index.html`) reading `localStorage`, and flipped at runtime by a new `ThemeToggle` React component mounted inside `TabBar` (`frontend.tsx:645-680`) — the one element actually shared across all 5 tabs (NOT `.masthead`, which only renders inside the LeetCode tab — confirmed by reading `frontend.tsx` directly; the original design doc's mention of "masthead" for toggle placement is superseded by this finding).

**Tech Stack:** Bun/React 19, plain CSS custom properties, no new dependencies.

## Global Constraints

- CSS + one small React component only — no changes to any other component's logic, no new files besides what's listed per task.
- No layout/breakpoint changes.
- Every property in the light-mode token/syntax blocks must be gated by the same two selectors: `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { ... } }` and `:root[data-theme="light"] { ... }` — both blocks always carry identical property lists, differing only in which selector wraps them.
- `bun test` and `bunx tsc` must stay green/clean after every task (baseline: 284 pass, 5 pre-existing unrelated failures — 4 in `home-api.test.ts`, 1 in `exam-api.test.ts`, both date-dependent).
- This repo has no PostToolUse test/typecheck hook configured yet (outstanding requirement per project CLAUDE.md, out of scope here) — run `bun test` and `bunx tsc` manually after every task instead.

---

### Task 1: Theme mechanism + light color tokens

**Files:**
- Modify: `index.html` (add inline script in `<head>`)
- Modify: `index.css:1-39` (`:root` block — add `--on-accent`), `index.css` line with `.btn-primary`'s `color: #1a1108` (change to `var(--on-accent)`), and a new block of light-mode token overrides added directly after the `:root` block

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `--on-accent` (dark value `#1a1108`, light value `#fbf8f0`) — consumed by `.btn-primary` in this task and available to any later rule. The `data-theme` attribute mechanism (read by CSS `[data-theme="..."]` selectors, written by `localStorage`/JS) — Task 2 and Task 3 both add more rules under the same two gating selectors this task establishes.

- [ ] **Step 1: Add the pre-paint theme-init script**

Find in `index.html`:

```html
    <link rel="stylesheet" href="./index.css" />
  </head>
```

Replace with:

```html
    <script>
      (function () {
        var t = localStorage.getItem("theme");
        if (t === "light" || t === "dark") {
          document.documentElement.dataset.theme = t;
        }
      })();
    </script>
    <link rel="stylesheet" href="./index.css" />
  </head>
```

- [ ] **Step 2: Add `--on-accent` to the dark `:root` block, use it in `.btn-primary`**

Find in `index.css`:

```css
  --accent: #f2994a;
  --green: #00b8a3;
  --gold: #e0a83e;
  --red: #ff5470;
```

Replace with:

```css
  --accent: #f2994a;
  --on-accent: #1a1108;
  --green: #00b8a3;
  --gold: #e0a83e;
  --red: #ff5470;
```

Find:

```css
.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #1a1108;
  font-weight: 600;
}
```

Replace with:

```css
.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
  font-weight: 600;
}
```

- [ ] **Step 3: Add the light-mode token block**

Directly after the closing `}` of the dark `:root` block (the block that ends right before `* { box-sizing: border-box; }`), insert:

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --bg: #fbf8f0;
    --panel: #f3eee0;
    --panel-raised: #ece4d0;
    --line: #e0d6c0;
    --line-strong: #8a7a5a;
    --text: #2a2018;
    --dim: #756349;

    --accent: #8b5e34;
    --on-accent: #fbf8f0;
    --green: #17685b;
    --gold: #7d5f00;
    --red: #b33a3a;

    --shadow-panel: 0 1px 2px rgba(60, 45, 20, 0.08), 0 6px 20px rgba(60, 45, 20, 0.06);
  }
}

:root[data-theme="light"] {
  --bg: #fbf8f0;
  --panel: #f3eee0;
  --panel-raised: #ece4d0;
  --line: #e0d6c0;
  --line-strong: #8a7a5a;
  --text: #2a2018;
  --dim: #756349;

  --accent: #8b5e34;
  --on-accent: #fbf8f0;
  --green: #17685b;
  --gold: #7d5f00;
  --red: #b33a3a;

  --shadow-panel: 0 1px 2px rgba(60, 45, 20, 0.08), 0 6px 20px rgba(60, 45, 20, 0.06);
}
```

(The two blocks are deliberately identical property lists — one applies when the OS prefers light and no explicit choice is stored, the other when the user explicitly picked light. No `:root[data-theme="dark"]` block is needed: dark IS the bare `:root` default already, so an explicit "dark" choice needs no extra CSS — the `data-theme="dark"` attribute's only job is to make the `:not([data-theme="dark"])` guard above correctly turn itself off.)

- [ ] **Step 4: Run the regression suite and type checker**

Run: `bun test`
Expected: 284 pass, 5 pre-existing fail (unchanged from baseline).

Run: `bunx tsc`
Expected: no errors.

- [ ] **Step 5: Manual visual check**

Run: `bun run dev`, open the app. Confirm dark mode is unchanged (no `data-theme` attribute set yet, no toggle button exists yet — this task only lays plumbing). In browser devtools, manually set `document.documentElement.dataset.theme = "light"` in the console and confirm the whole app (all 5 tabs) switches to the cream/brown palette — background, text, panels, accent-colored elements (active tab underline, `due`/`overdue` badges, buttons) all update. Confirm `.btn-primary`'s label text stays readable against its brown background in both themes.

- [ ] **Step 6: Commit**

```bash
git add index.html index.css
git commit -m "feat: add light theme token system and pre-paint init script"
```

---

### Task 2: Light syntax-highlighting palette

**Files:**
- Modify: `index.css` (the existing "Dark+" syntax-highlighting block, originally around what is now line ~702-750)

**Interfaces:**
- Consumes: the `@media (prefers-color-scheme: light)` / `[data-theme="light"]` gating pattern established in Task 1.
- Produces: no new tokens (these are direct hex values per VS Code convention, matching how the existing dark syntax block also uses direct hex rather than tokens).

- [ ] **Step 1: Add the light syntax-highlighting block**

Find the closing `}` of the dark syntax-highlighting block — the last rule in that block is:

```css
.token.property {
  color: #9cdcfe;
}
```

Directly after it (and after the `/* History */` comment that follows, i.e. insert the new block right after `.token.property`'s closing brace, before `/* History */`), add:

```css
/* Light syntax highlighting — VS Code "Light+" token colors */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) .solution {
    color: #333333;
  }

  :root:not([data-theme="dark"]) .token.comment,
  :root:not([data-theme="dark"]) .token.prolog,
  :root:not([data-theme="dark"]) .token.doctype,
  :root:not([data-theme="dark"]) .token.cdata {
    color: #008000;
    font-style: italic;
  }

  :root:not([data-theme="dark"]) .token.keyword,
  :root:not([data-theme="dark"]) .token.atrule {
    color: #0000ff;
  }

  :root:not([data-theme="dark"]) .token.string,
  :root:not([data-theme="dark"]) .token.char,
  :root:not([data-theme="dark"]) .token.attr-value,
  :root:not([data-theme="dark"]) .token.builtin {
    color: #a31515;
  }

  :root:not([data-theme="dark"]) .token.number,
  :root:not([data-theme="dark"]) .token.boolean,
  :root:not([data-theme="dark"]) .token.constant {
    color: #098658;
  }

  :root:not([data-theme="dark"]) .token.class-name,
  :root:not([data-theme="dark"]) .token.namespace {
    color: #267f99;
  }

  :root:not([data-theme="dark"]) .token.function,
  :root:not([data-theme="dark"]) .token.annotation {
    color: #795e26;
  }

  :root:not([data-theme="dark"]) .token.operator,
  :root:not([data-theme="dark"]) .token.punctuation {
    color: #333333;
  }

  :root:not([data-theme="dark"]) .token.property {
    color: #001080;
  }
}

[data-theme="light"] .solution {
  color: #333333;
}

[data-theme="light"] .token.comment,
[data-theme="light"] .token.prolog,
[data-theme="light"] .token.doctype,
[data-theme="light"] .token.cdata {
  color: #008000;
  font-style: italic;
}

[data-theme="light"] .token.keyword,
[data-theme="light"] .token.atrule {
  color: #0000ff;
}

[data-theme="light"] .token.string,
[data-theme="light"] .token.char,
[data-theme="light"] .token.attr-value,
[data-theme="light"] .token.builtin {
  color: #a31515;
}

[data-theme="light"] .token.number,
[data-theme="light"] .token.boolean,
[data-theme="light"] .token.constant {
  color: #098658;
}

[data-theme="light"] .token.class-name,
[data-theme="light"] .token.namespace {
  color: #267f99;
}

[data-theme="light"] .token.function,
[data-theme="light"] .token.annotation {
  color: #795e26;
}

[data-theme="light"] .token.operator,
[data-theme="light"] .token.punctuation {
  color: #333333;
}

[data-theme="light"] .token.property {
  color: #001080;
}
```

(This block uses direct class selectors like `.token.comment`, not `:root ... .token.comment` element-descendant chaining for the `[data-theme="light"]` variant, because `.token.comment` elements are nested inside `<body>`, which is inside `<html>` — `[data-theme="light"]` sits on `<html>`, so `[data-theme="light"] .token.comment` correctly matches any such element anywhere in the document, same pattern already implied by how `:root[data-theme="light"]` token overrides in Task 1 work for custom properties, which cascade down regardless of selector nesting.)

- [ ] **Step 2: Run the regression suite and type checker**

Run: `bun test` — expect 284 pass, 5 pre-existing fail.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 3: Manual visual check**

`bun run dev`, open a LeetCode problem's detail view with a saved solution (or Theory tab's model answer if it has a code block). With `document.documentElement.dataset.theme = "light"` set in devtools console, confirm the code block's syntax highlighting uses the light palette (dark-on-light, not the dark theme's pale-on-dark colors) and is clearly legible.

- [ ] **Step 4: Commit**

```bash
git add index.css
git commit -m "feat: add light-mode syntax highlighting palette"
```

---

### Task 3: Theme toggle button

**Files:**
- Modify: `frontend.tsx` (add `ThemeToggle` component, mount inside `TabBar`)
- Modify: `index.css` (add `.theme-toggle` styling, add it to the reduced-motion transition-none list)

**Interfaces:**
- Consumes: the `data-theme` attribute / `localStorage.theme` mechanism from Task 1. `Tab` type (`frontend.tsx:637`) — not used by `ThemeToggle` itself, just noting `TabBar`'s existing prop shape (`{ tab: Tab; onChange: (t: Tab) => void }`) is unchanged by this task.
- Produces: `ThemeToggle` component (no props, no exports needed by later tasks — this plan has no Task 4 dependency on it beyond it existing and working).

- [ ] **Step 1: Add the `ThemeToggle` component**

Directly above the `TabBar` function (`frontend.tsx:645`, `function TabBar({ tab, onChange }: ...) {`), insert:

```tsx
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}

```

- [ ] **Step 2: Mount it inside `TabBar`**

Find:

```tsx
      <button
        className={tab === "exam" ? "tab tab-active" : "tab"}
        onClick={() => onChange("exam")}
      >
        Modules
      </button>
    </nav>
  );
}
```

Replace with:

```tsx
      <button
        className={tab === "exam" ? "tab tab-active" : "tab"}
        onClick={() => onChange("exam")}
      >
        Modules
      </button>
      <ThemeToggle />
    </nav>
  );
}
```

- [ ] **Step 3: Style the toggle button**

Find in `index.css`:

```css
.tab-active::after {
  transform: scaleX(1);
}
```

Directly after it, add:

```css

.theme-toggle {
  margin-left: auto;
  font-size: 1rem;
  line-height: 1;
  padding: 0.4rem 0.6rem;
  border-radius: 5px;
  color: var(--dim);
  transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
}

.theme-toggle:hover {
  color: var(--text);
  background: var(--panel-raised);
}
```

(`margin-left: auto` pushes it to the far right within `.tabs`'s flex row, since `.tabs` is `display: flex` with no other flex-growing sibling — this is what achieves "far right of the shared tab bar" without needing the `.masthead-date`-style `flex: 1` spacer the original design draft assumed existed here.)

- [ ] **Step 4: Add `.theme-toggle` to the reduced-motion guard**

Find in `index.css`:

```css
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
  .step-row input[type="checkbox"],
  .deadlines-chevron {
    transition: none !important;
  }
```

Replace with:

```css
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
  .step-row input[type="checkbox"],
  .deadlines-chevron,
  .theme-toggle {
    transition: none !important;
  }
```

- [ ] **Step 5: Run the regression suite and type checker**

Run: `bun test` — expect 284 pass, 5 pre-existing fail.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 6: Manual visual check**

`bun run dev`. Confirm the toggle button (sun/moon icon) appears at the far right of the tab bar on every one of the 5 tabs. Click it: the whole app switches theme instantly, the icon swaps (☀ ↔ ☾), and reloading the page keeps the chosen theme (no flash of the other theme before it settles — this is what Task 1's inline script prevents). Clear `localStorage` (devtools → Application → Local Storage → delete `theme` key) and reload: the app should now follow your OS/browser's light/dark preference instead. Toggle your OS's `prefers-color-scheme` (or use devtools' rendering-tab emulation) with no stored preference and confirm the app follows it.

- [ ] **Step 7: Commit**

```bash
git add frontend.tsx index.css
git commit -m "feat: add theme toggle button to the tab bar"
```

---

### Task 4: Contrast verification pass

**Files:**
- Modify: `index.css` (only the light-mode token values from Task 1, if any fail verification — no other file)

**Interfaces:**
- Consumes: every light-mode token defined in Task 1.
- Produces: nothing further (final task).

- [ ] **Step 1: Compute WCAG contrast ratios for every pair below**

Using the WCAG relative-luminance formula (sRGB → linearize each channel: `c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4` → `L = 0.2126*R + 0.7152*G + 0.0722*B` → contrast ratio `= (L_lighter + 0.05) / (L_darker + 0.05)`), verify these pairs against the current light-mode token values in `index.css`:

1. `--text` (`#2a2018`) vs `--bg` (`#fbf8f0`): target ≥ 4.5:1 (hand-computed during planning: ~15.3:1, expect PASS)
2. `--dim` (`#756349`) vs `--bg` (`#fbf8f0`): target ≥ 4.5:1 (hand-computed: ~5.5:1, expect PASS)
3. `--accent` (`#8b5e34`) vs `--bg` and vs `--panel` (`#f3eee0`): target ≥ 4.5:1 (hand-computed: ~5.3:1 / ~4.9:1, expect PASS but the panel pairing is closer — verify carefully)
4. `--on-accent` (`#fbf8f0`) vs `--accent` (`#8b5e34`): target ≥ 4.5:1 (hand-computed: ~5.3:1, expect PASS)
5. `--green` (`#17685b`) vs `--bg` and vs `--panel`: target ≥ 4.5:1 (hand-computed: ~6.3:1 / ~5.7:1, expect PASS)
6. `--gold` (`#7d5f00`) vs `--bg` and vs `--panel`: target ≥ 4.5:1 (hand-computed: ~5.7:1 / ~5.2:1, expect PASS)
7. `--red` (`#b33a3a`) vs `--bg` and vs `--panel`: target ≥ 4.5:1 (hand-computed: ~5.5:1 / ~5.1:1, expect PASS)
8. `--line-strong` (`#8a7a5a`) vs `--bg` and vs `--panel` (non-text UI — form field borders): target ≥ 3:1 (hand-computed: ~4.0:1 / ~3.6:1, expect PASS)

Write a small throwaway script (e.g. a `.ts` file run with `bun run`) to compute these programmatically rather than trusting the hand computation above — the hand-computed values are estimates from planning and may contain arithmetic errors; this step is the authoritative check. Delete the script before committing.

`--line` itself is deliberately NOT in this list: per the precedent set in the dark theme's contrast pass, its remaining uses are decorative dividers, not essential UI-component boundaries under WCAG 1.4.11, so it's exempt from the 3:1 non-text target.

- [ ] **Step 2: Fix any failing pair**

If any pair fails its target, adjust ONLY that token's lightness (do not change hue/saturation) in BOTH light-mode blocks in `index.css` (the `@media (prefers-color-scheme: light)` block and the `[data-theme="light"]` block — they must stay identical) — the smallest change that clears the bar. If a token is shared across multiple pairs (e.g. `--accent` appears in both the vs-`--bg` and vs-`--panel` checks), re-verify every other pair using that token after adjusting it, not just the one that failed. Do not repeat the dark theme's `--line` mistake of overshooting "smallest change" — check the new ratio is just above target, not far above it, unless a natural round hex value happens to land further above.

- [ ] **Step 3: Run the regression suite and type checker**

Run: `bun test` — expect 284 pass, 5 pre-existing fail.
Run: `bunx tsc` — expect no errors.

- [ ] **Step 4: Manual verification — reduced motion (light theme)**

In browser devtools, emulate `prefers-reduced-motion: reduce` with the theme set to light. Confirm all the same reduced-motion checks from the dark-theme plan still hold (no row-in animation, no modal fade/scale, no tab-underline slide, no hover lift) — this task doesn't add new motion, so this is a regression check that Task 3's `.theme-toggle` addition to the guard list didn't break anything.

- [ ] **Step 5: Commit**

```bash
git add index.css
git commit -m "fix: verify and tune light-theme token contrast ratios"
```

(If Step 2 required no changes — all 8 pairs passed as computed — commit an empty-diff-avoiding no-op is unnecessary; instead just note in the PR/handoff that verification passed with no adjustments needed, and skip this commit.)

---

## Self-Review Notes

**Spec coverage:** Theme mechanism (script + gating) → Task 1. Light color tokens → Task 1. `--on-accent` for `.btn-primary` → Task 1. Light syntax palette → Task 2. Toggle button + styling + reduced-motion → Task 3. Contrast verification → Task 4. The design doc's mention of mounting the toggle in `.masthead` was corrected after reading the actual code — `.masthead` only renders inside the LeetCode tab (`frontend.tsx:551-644`'s `LeetCodeApp`), not globally; `TabBar` (`frontend.tsx:645-680`) is what's actually shared across all 5 tabs, so Task 3 mounts there instead, achieving the same "always-visible, far right" placement via `margin-left: auto` within `.tabs`'s existing flex row.

**Placeholder scan:** every step has literal CSS/TSX to write, every command is real and runnable for this stack.

**Type consistency:** `ThemeToggle` takes no props and is referenced only as `<ThemeToggle />` inside `TabBar` — matches its declared signature. `--on-accent` is introduced in Task 1 and referenced identically (same name) in `.btn-primary` in Task 1 itself; no later task touches it. The `data-theme`/`localStorage.theme` string values (`"light"` / `"dark"`) are used identically across `index.html`'s script (Task 1), `ThemeToggle`'s state (Task 3), and the CSS selectors (Tasks 1-2) — verified no typos in any occurrence while writing this plan.
