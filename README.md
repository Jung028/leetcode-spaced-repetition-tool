# LeetCode Review Board

A small spaced-repetition tool for LeetCode problems. Solve a problem, save
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

## Todo tab

A simple due-date todo list, independent of the spaced-repetition decks.
Add a task with when it's due and an optional link or description, and it
shows up on the Due board once its due date arrives (or has passed). Check
a task off to mark it done, or delete it outright. No ladder, no
scheduling — just a flat list of due/overdue/completed-today items.

## Exam tab

Daily practice papers for university course content (currently INFO5995 —
Intro to Cybersecurity). One full paper (a mix of multiple choice,
true/false, short-answer, and scenario questions) unlocks per day, gated by
its own backlog cap — fall behind and a few
papers queue up, but the whole bank doesn't dump on you at once. Multiple
choice and true/false grade themselves instantly on selection; short-answer
and scenario questions ask you to write your own answer first, then reveal
a model answer and self-mark Correct/Wrong. Submit
the paper once every question is graded to lock in a score. Any question
marked wrong reschedules individually onto its own ladder (3 → 5 → 7 → 14 →
30 days, `exam-scheduling.ts`) and resurfaces under "Review due" until you
get it right — the paper itself is one-and-done, but its weak spots keep
coming back.

Content lives in `exam-content/<course>/week-<n>.ts`, one file per course
week, all aggregated into a single per-course schedule by `exam-content.ts`.
Each course paces its own daily paper release independently. To add a new
week once its materials land in the course folder:

```sh
bun scripts/generate-exam-week.ts --week 2 --course INFO5995
```

`--course` defaults to `INFO5995` if omitted, matching today's one-command
usage. This scans that week's folder for readable material (PDFs, markdown,
slides — video lectures are noted but not transcribed) and writes a blank
scaffold to `exam-content/<course-lowercase>/week-2.ts` in the same shape as
the real content files. Generating for a course other than INFO5995 also
requires `--course-dir <path>` pointing at that course's own material
folder — there's no built-in course→folder lookup yet. Ask Claude Code to
fill in the scaffold's blanks by reading the listed source files directly
(no PDF-parsing dependency needed — Claude's own Read tool handles PDFs),
then add one import + array entry to `exam-content.ts` to bring the new
week into the schedule.

## Home tab

The default tab when the app loads. Shows the Google Calendar embed
(previously only on the LeetCode tab) plus one unified "Everything due"
list merging due/overdue items from LeetCode, Todo, and Exam, sorted
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
   it POSTs to `http://localhost:3000/api/capture` (edit `APP_URL` at the top
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
