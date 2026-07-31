# LeetCode Review Board

A small spaced-repetition tool for LeetCode problems, plus a Theory tab for
working through system design/DSA/interview concepts. Solve a problem, save
it (by hand or straight from LeetCode's own page via the included
userscript), and the app schedules re-solves on a fixed ladder, shows what's
due today, and mirrors the schedule onto an embedded Google Calendar.

## Run

```sh
bun install
bun run dev      # http://localhost:3000 (hot reload)
```

`PORT` changes the port; `SRS_DB_PATH` moves the SQLite file (default
`srs.db` next to this file).

## How it works

- **Add a problem** — title, LeetCode link, language, and the solution code
  you want to be able to re-derive. The first review is due tomorrow.
- **Fixed ladder** — reviews come back after 1 → 3 → 7 → 14 → 30 days.
  **Passed** climbs one rung (and stays at 30 days at the top); **Failed**
  resets to the start, due tomorrow. The small orange meter next to each
  problem shows its rung.
- **Due today** — due and overdue problems appear on the board at the top,
  color-coded by urgency (green/gold/red — the same visual language LeetCode
  uses for difficulty, repointed at "how soon").
- **Reviewing** — open a problem, try to solve it on LeetCode first; the
  saved solution stays hidden until you reveal it, then renders with real
  syntax highlighting for whatever language it's in. Then mark Passed or
  Failed.
- **Calendar** — the schedule is also mirrored onto a Google Calendar (kept
  in sync on request, not automatically) and embedded directly in the app.

## Theory tab

A spaced-repetition deck of 150 concept cards — System Design (50), Data
Structures & Algorithms (30), Distributed Systems (20), Databases (20),
Networking & OS (15), and Behavioral/interview questions (15) — content
lives in `theory-content.ts`. One concept is introduced per day (concept 1
due day one, concept 2 the next day, and so on), and each concept then
follows its own ladder: write your own answer, reveal the model answer to
compare, then mark **Correct** or **Wrong**. Correct climbs a ladder of
3 → 5 → 7 → 14 → 30 days; Wrong resets it, due again tomorrow — same shape
as the LeetCode ladder, just its own interval sequence
(`theory-scheduling.ts`). The Due board shows everything due today or
overdue (there's no cap — miss a few days and they stack up, same as the
LeetCode board). Reviewing a card opens a Google Calendar quick-add for its
new next-review date (21:00-21:30 Sydney time, tagged `[theory-150]`,
distinct from the LeetCode review slot at 22:00-00:00), so LeetCode reviews
and Theory reviews both show up on the same embedded calendar. Your saved
answers and scheduling state persist in `srs.db`; the question/answer
content itself is static and ships with the code.

## Goals tab

A project/deadline tracker, independent of the spaced-repetition decks.
Create a project with a title and a deadline (e.g. "Complete tracely
onboarding", due in two weeks), then break it into weighted steps (e.g.
"Complete signup page" — 20%). Each step gets its own due date
automatically — the first step is due the day you create it, and each
later step is due the day after the previous one (never backdated: if
that would land in the past, it's due today instead). Check steps off as
you finish them; a project's progress is the sum of its done steps'
weights, and it drops off the active board once that reaches 100%.
Weights aren't forced to sum to 100 — the detail view just shows how much
is allocated as a hint.

## Home tab

The default tab when the app loads. Shows the Google Calendar embed
(previously only on the LeetCode tab) plus one unified "Everything due"
list merging due/overdue items from LeetCode, Theory, and Goals, sorted
together by due date. Clicking an item jumps straight to its detail view
in the right tab, so you don't have to check three tabs separately to see
what needs attention.

## LeetCode → Review Board userscript

`userscript/leetcode-sync.user.js` adds a "💾 Save to Review Board" button
directly on LeetCode's problem pages. Clicking it:

1. Reads the current problem's title and your in-progress code straight out
   of the editor.
2. Saves it to this app — if the problem's new, it's added; if it's already
   tracked, the solution is updated **and the review is marked Passed**
   (advancing the ladder), since successfully re-solving is exactly what
   that means here.
3. Resets the editor back to LeetCode's own default template for the
   current language, so the next scheduled attempt starts clean.

**Install:**
1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Open `userscript/leetcode-sync.user.js` in this repo, copy its contents.
3. In Tampermonkey's dashboard, create a new script and paste it in, then save.
4. Make sure the app is running (`bun run dev`) before clicking the button —
   it POSTs to `http://localhost:4321/api/capture` (edit `APP_URL` at the top
   of the script if you run the app on a different port).

## Tests

```sh
bun test
```

Covers the scheduling ladder and date math, the SQLite layer (including the
capture/upsert flow), the syntax-highlighting language mapping, and the HTTP
API (served against an in-memory database).

## Stack

Bun (`Bun.serve` with HTML imports, `bun:sqlite`), React 19, Prism.js for
syntax highlighting. The scheduler (`scheduling.ts`) is pure and shared by
the server and the frontend, so the due/rung logic is identical in both.
