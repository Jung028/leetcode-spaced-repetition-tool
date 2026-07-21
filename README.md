# LeetCode Review Board

A small spaced-repetition calendar for LeetCode problems. After you solve a
problem, add it with its title, link, and your solution; the app schedules
re-solves on a fixed ladder and lays them out on a month calendar.

## Run

```sh
bun install
bun run dev      # http://localhost:3000 (hot reload)
```

`PORT` changes the port; `SRS_DB_PATH` moves the SQLite file (default
`srs.db` next to this file).

## How it works

- **Add a problem** — title, LeetCode link, and the solution code you want to
  be able to re-derive. The first review is due tomorrow.
- **Fixed ladder** — reviews come back after 1 → 3 → 7 → 14 → 30 days.
  **Passed** climbs one rung (and stays at 30 days at the top); **Failed**
  resets to the start, due tomorrow. The small amber meter next to each
  problem shows its rung.
- **Due today** — due and overdue problems appear on the board at the top
  (overdue ones surface on today's calendar cell, not in the past).
- **Reviewing** — open a problem, try to solve it on LeetCode first; the
  saved solution stays hidden until you reveal it. Then mark Passed or
  Failed.

## Tests

```sh
bun test
```

Covers the scheduling ladder and date math, the SQLite layer, and the HTTP
API (served against an in-memory database).

## Stack

Bun (`Bun.serve` with HTML imports, `bun:sqlite`), React 19. The scheduler
(`scheduling.ts`) is pure and shared by the server and the frontend, so the
due/rung logic is identical in both.
