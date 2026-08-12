# Light Theme (Brown/Cream) — Design

## Overview

The app currently ships one dark theme (the "Refined Neutral" redesign — see `2026-08-10-refined-neutral-redesign-design.md`). This adds a second, light theme: a warm cream/tan background with a brown/coffee accent color, replacing the dark theme's near-black/orange pairing. Users switch via a small icon toggle in the masthead; the choice is remembered and defaults to the OS/browser's `prefers-color-scheme` on first visit.

This is a **CSS + minimal-JS addition, not a rebuild** — every color in `index.css` already flows through a `var(--token)` (the dark-theme redesign made this true), so light mode is almost entirely a second block of token values gated by theme state. The two exceptions handled here: `.btn-primary`'s hardcoded on-accent text color (`#1a1108`) becomes a new `--on-accent` token so it can flip per theme, and the syntax-highlighting block gets a parallel light palette.

## Goals

- A complete light theme: every token, every component, both tabs' syntax-highlighted code blocks.
- Toggle button (sun/moon icon) in the masthead, far right, after the date.
- Explicit choice persists via `localStorage`; unset falls back to `prefers-color-scheme`.
- No flash of the wrong theme on load.
- Same accessibility bar as the dark theme: contrast-verified tokens, working focus ring, full `prefers-reduced-motion` respect (the toggle's own icon swap, if animated, must also respect it).

## Non-goals

- No third theme, no per-tab theme override, no user-customizable colors.
- No changes to layout, spacing, motion timing, or any non-color CSS — light mode reuses every existing rule's structure, only its color values change.
- No changes to component logic/behavior beyond the toggle button itself.

## Theme mechanism

```html
<!-- index.html, in <head>, before the stylesheet link -->
<script>
  (function () {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") {
      document.documentElement.dataset.theme = t;
    }
  })();
</script>
```

Runs synchronously before first paint — no flash of the wrong theme. If `localStorage.theme` is unset, no attribute is set and the `prefers-color-scheme` media query (below) governs.

```css
/* index.css */
:root {
  /* existing dark tokens stay as the bare-:root default, unchanged */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* light token overrides — same block as [data-theme="light"] below */
  }
}

:root[data-theme="light"] {
  /* light token overrides */
}

:root[data-theme="dark"] {
  /* redefines nothing new — dark IS the bare :root default — this
     selector exists only so an explicit "dark" choice overrides a
     light system preference; no properties needed beyond what :root
     already has, so this rule is a no-op placeholder and can be
     omitted. (Documented here so the implementer doesn't wonder why
     it's missing.) */
}
```

Toggle button (`frontend.tsx`, in the masthead, after `.masthead-date`):

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

Mounted once in the masthead (`frontend.tsx`'s root `App` component), so it's shared across all 5 tabs.

## Light-mode token values

Draft values — exact hex gets a contrast-verification pass during implementation (same process the dark theme used: compute WCAG ratios, adjust only the token that fails, smallest change that clears the bar, and re-check every *other* pair that shares that token before committing to a fix, learning from the dark theme's `--line` overshoot).

```css
--bg: #fbf8f0;
--panel: #f3eee0;
--panel-raised: #ece4d0;
--line: #e0d6c0;
--line-strong: #8a7a5a;
--text: #2a2018;
--dim: #756349;

--accent: #8b5e34;
--on-accent: #fbf8f0;   /* new token — text color for content sitting on --accent */
--green: #17685b;
--gold: #7d5f00;
--red: #b33a3a;

--shadow-panel: 0 1px 2px rgba(60, 45, 20, 0.08), 0 6px 20px rgba(60, 45, 20, 0.06);
```

Pre-checked by hand against the WCAG relative-luminance formula before writing the plan (`--dim`, `--gold`, `--green`, `--line-strong` all needed darkening from an initial pass — see Task 4 in the implementation plan for the formal re-verification, since hand computation can have small errors):
- `--text` vs `--bg`: ~15.3:1
- `--dim` vs `--bg`: ~5.5:1
- `--accent` vs `--bg`/`--panel`: ~5.3:1 / ~4.9:1
- `--on-accent` vs `--accent`: ~5.3:1
- `--green` vs `--bg`/`--panel`: ~6.3:1 / ~5.7:1
- `--gold` vs `--bg`/`--panel`: ~5.7:1 / ~5.2:1
- `--red` vs `--bg`/`--panel`: ~5.5:1 / ~5.1:1
- `--line-strong` vs `--bg`/`--panel` (non-text, ≥3:1): ~4.0:1 / ~3.6:1

Unchanged in both themes (not color tokens, or deliberately theme-invariant): `--mono`, `--sans`, all `--text-*`/`--space-*` scale tokens, `--ease`/`--dur-*`, and `.modal-backdrop`'s hardcoded `rgba(0, 0, 0, 0.6)` scrim (a dark backdrop behind a modal is conventional in both themes and isn't a token today).

**`--on-accent` also needs a dark-mode value**, added to the bare `:root` block alongside the rest: `--on-accent: #1a1108;` (the exact value `.btn-primary` already hardcodes today) — then `.btn-primary`'s `color: #1a1108;` becomes `color: var(--on-accent);`.

## Light syntax-highlighting palette

Parallel block to the existing "Dark+" one, gated the same way as the color tokens, using VS Code's "Light+" token colors:

```css
/* under the light-mode selectors */
.solution { color: #333333; }
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #008000; }
.token.keyword, .token.atrule { color: #0000ff; }
.token.string, .token.char, .token.attr-value, .token.builtin { color: #a31515; }
.token.number, .token.boolean, .token.constant { color: #098658; }
.token.class-name, .token.namespace { color: #267f99; }
.token.function, .token.annotation { color: #795e26; }
.token.operator, .token.punctuation { color: #333333; }
.token.property { color: #001080; }
```

## Toggle button styling

```css
.theme-toggle {
  font-size: 1rem;
  line-height: 1;
  padding: 0.4rem;
  border-radius: 5px;
  color: var(--dim);
  transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
}

.theme-toggle:hover {
  color: var(--text);
  background: var(--panel-raised);
}
```

Added to the `prefers-reduced-motion` block's transition-only selector list (it's a color/background transition, not a transform toggle, so it belongs in the existing transition-none group, not the transform-none group).

## Responsive & accessibility

- `:focus-visible` already uses `var(--accent)` — works correctly in both themes with no changes.
- Contrast verification (implementation-time, mirroring the dark theme's Task 9 process) required for every light-mode pair: `--text`/`--dim`/`--accent`/`--green`/`--gold`/`--red` against `--bg` and `--panel`; `--line-strong` against `--panel`/`--bg` (non-text UI, ≥3:1); `--on-accent` against `--accent` (text-on-accent, ≥4.5:1, e.g. `.btn-primary`'s label).
- `--line` itself is exempt from the 3:1 non-text bar for the same reason established in the dark theme: its remaining uses are decorative dividers, not essential UI-component boundaries.
- Toggle button gets a real `<button>` with `aria-label`, keyboard-operable by default, focus ring inherited from the global `:focus-visible` rule with no extra work.

## File structure

- Modify: `index.html` — add the inline theme-init script in `<head>`.
- Modify: `index.css` — add `--on-accent` to the dark `:root` block, change `.btn-primary`'s `color: #1a1108` to `color: var(--on-accent)`, add the light-mode token block (under both the `@media (prefers-color-scheme: light)` and `[data-theme="light"]` selectors), add the light syntax-highlighting block (same gating), add `.theme-toggle` styling, add `.theme-toggle` to the reduced-motion transition-none list.
- Modify: `frontend.tsx` — add the `ThemeToggle` component and mount it in the masthead JSX after `.masthead-date`.
- No new files, no test files change (this is presentational; no existing logic test touches theme).

## Verification approach

Same as the dark-theme redesign: `bun test` and `bunx tsc` must stay green/clean (this is CSS + a small isolated component, no existing logic touched). Manual verification: toggle between themes across all 5 tabs, confirm no flash-of-wrong-theme on reload with each explicit choice, confirm `prefers-color-scheme` governs correctly when no explicit choice is stored (test via browser devtools emulation), confirm computed contrast ratios meet targets for every listed pair, confirm `prefers-reduced-motion` still disables all transitions/animations in both themes.

## Spec requirement: continuous testing

- **Automated Hooks**: a hook fires every time the AI saves a change (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test suite (`bun test`), and the type checker (`bunx tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure output immediately and attempts to fix its own mistake before the user has to intervene, so the user always returns to a green (passing) state.

This repo has no such hook configured yet. Outstanding requirement independent of this feature; the implementation plan runs `bun test`/`bunx tsc` manually after each task in the interim.
