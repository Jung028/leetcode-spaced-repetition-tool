# Notes tab + phone capture, synced via GitHub — design

**Date:** 2026-09-30
**Goal:** add a **Notes** feature to the existing app — one shared UI
component used both as a new desktop tab (same pattern as Todo, Exam,
etc.) and as a free, standalone phone page — with no server to run or pay
for. The two stay in sync through a private GitHub repo acting as shared
storage, matching the user's original "git push/pull" instinct, just
automated behind a single Sync/Pull action instead of the raw commands.

## Prerequisites (one-time, manual — not part of the implementation plan)

Before implementation starts, the user creates:
- `notes-data`: a new **private** GitHub repo, empty except for a
  `notes/` folder. Kept as its own repo, separate from `leetcode-srs`,
  for two reasons: `leetcode-srs` is a **public** GitHub repo (confirmed
  2026-09-30), so personal notes living in a folder there would be
  world-readable; and a fine-grained GitHub token can only be scoped to
  whole repos, not subfolders — keeping notes in their own small repo
  means a token that leaks from the phone's browser storage can, at
  worst, touch some notes, never the app's actual source code.
- GitHub Pages enabled on the **existing `leetcode-srs` repo**, with
  **Source: GitHub Actions** (not "deploy from a branch" — the workflow
  in this plan deploys directly, no build output is ever committed).
- A **fine-grained** personal access token scoped to only the
  `notes-data` repo, with Contents read/write permission — classic
  tokens can't be scoped to one repo, so this must be fine-grained.

## Scope

**v1 (this spec):**
- A new private GitHub repo (`notes-data`) holding one markdown file per
  note, filename = ISO timestamp. One-file-per-note means concurrent notes
  from phone and desktop never collide — no merge-conflict handling needed.
- **One shared UI component** (`NotesView`) — note list, add box, "N new"
  badge, Pull button, Save & Sync button — used in two places:
  - As a new **Notes** tab inside the existing Bun app (desktop), talking
    to a local Bun API backed by a local git clone of `notes-data`. Uses
    the desktop's existing GitHub SSH access — no new credentials needed
    there.
  - As a standalone bundle deployed to **GitHub Pages** (phone use),
    talking directly to GitHub's REST API with a personal access token
    entered once and kept in the phone's browser storage. No server
    involved on this side at all.
  Which backend `NotesView` talks to is decided by which small adapter
  it's given (see Architecture) — the component itself doesn't know or
  care which one it's running against.
- Typing or using the iPhone keyboard's built-in dictation mic writes
  straight into the add box — no custom audio recording or transcription
  pipeline of any kind.
- A **GitHub Actions workflow** that rebuilds and redeploys the phone
  bundle to GitHub Pages automatically on every push that touches the
  shared Notes code — no manual build/deploy step to remember.

**Out of scope (explicitly deferred, not part of this build):**
- Editing or deleting existing notes from the phone page (v1 is
  add-only from the phone; desktop can edit/delete local files directly
  via normal git if ever needed).
- Automatic/background sync — both sides require an explicit tap
  (Sync / Pull), matching what was asked for over building silent
  background sync.
- Rich formatting, tags, search, folders — plain flat list of notes.
- Any transcription service/API — dictation is entirely the phone
  keyboard's own feature, not something this build implements.

## Design principles

Follows `CLAUDE.md`'s code quality standards:

- **Single Responsibility:** git-clone mechanics (`notes-repo.ts`), HTTP
  routes (`notes-api.ts`), the shared UI (`NotesView.tsx`), and each
  backend adapter are five separate files, same split as every other tab
  (`todo/db.ts` / `todo/api.ts` / `todo/App.tsx`).
- **Dependency Inversion:** `NotesView` depends only on the `NotesClient`
  interface (`listNotes`, `addNote`, `checkForUpdates`, `pull`, `sync`) —
  never on `fetch("/api/notes")` or the GitHub API directly. This is what
  makes one component usable from both the desktop tab and the phone
  bundle: swap the adapter, not the UI.
- **Interface Segregation:** `NotesClient` exposes only the five methods
  the UI actually calls — nothing about git, GitHub's API shape, or
  localStorage leaks into `NotesView`.
- **Boundaries validate, internals trust:** `notes-api.ts` validates
  incoming note text at the route; `notes-repo.ts` trusts what it's given.
  `github-client.ts` validates what it gets back from GitHub before
  handing it to `NotesView`.
- **DRY only for real duplication:** the UI is shared because it's
  genuinely the same component; the two adapters are *not* merged into
  one, because "write a note" means something structurally different in
  each (an HTTP POST vs. a queued localStorage entry synced later) — that
  difference is real, not incidental.

## Architecture

```
notes/                         (new, inside the existing leetcode-srs app)
  notes-repo.ts       local clone lifecycle: ensure-cloned, fetch/pull,
                       write file + commit + push, read all notes from disk
  notes-api.ts         routes: GET notes, POST note, GET sync-status,
                       POST pull, POST push — thin wrapper over notes-repo.ts
  notes-client.ts      the NotesClient interface + shared Note type
  local-client.ts      NotesClient impl: calls /api/notes/* (desktop)
  github-client.ts      NotesClient impl: calls GitHub's REST API directly,
                       queues writes in localStorage when offline (phone)
  NotesView.tsx        the shared UI: note list, add box, badge, Pull,
                       Save & Sync — takes a NotesClient as a prop
  App.tsx              desktop entry: <NotesView client={localClient} />,
                       this is what frontend.tsx imports as the Notes tab
  capture-entry.tsx    phone entry: one-time token prompt, then
                       <NotesView client={githubClient} />
  notes-repo.test.ts       exercises git operations against a local temp
                           bare repo (no network, no real GitHub calls)
  notes-api.test.ts        route tests, same shape as todo/api.test.ts
  NotesView.test.tsx       UI behavior tests against an in-memory fake
                           NotesClient (fast, backend-agnostic)
  github-client.test.ts    queue/sync/error-handling logic, GitHub API
                           calls mocked

notes-capture/
  index.html           static shell: viewport meta, <div id="root">,
                       <script src="bundle.js">. Committed once, never
                       rebuilt — the workflow only rebuilds bundle.js.

.github/workflows/
  deploy-notes-capture.yml   on push touching notes/** or
                             notes-capture/index.html: bun install,
                             bun build notes/capture-entry.tsx
                               --outdir notes-capture --outfile bundle.js,
                             then actions/upload-pages-artifact +
                             actions/deploy-pages. Nothing built is ever
                             committed to the repo.
```

`index.ts` gains: an `ensureNotesRepoCloned`-style startup step (clone
`notes-data` locally if missing) and `...notesApiRoutes()`, following the
existing per-module import pattern. `frontend.tsx` gains a `notes` tab
entry rendering `notes/App.tsx`, same as every other tab.

### Where the local git clone lives

The desktop app keeps its own local clone of `notes-data` on disk
(outside the `leetcode-srs` repo itself, e.g. a sibling directory such as
`../notes-data`, path configurable via an env var the same way
`SRS_DB_PATH` configures the SQLite path today). `notes-repo.ts` is the
only module that touches it, via `Bun.$` git commands (`git fetch`,
`git pull`, `git add`/`commit`/`push`).

### Data flow

**Desktop, viewing (`local-client.ts` → `notes-api.ts` → `notes-repo.ts`):**
1. On mount, `NotesView` calls `client.checkForUpdates()`. `local-client`
   hits `GET /api/notes/sync-status`, which runs `git fetch` against the
   local clone (no working-tree change) and compares local vs. origin
   `HEAD`. A mismatch surfaces as the "N new" badge.
2. `client.listNotes()` hits `GET /api/notes`, a plain directory read of
   the local clone's `notes/*.md`, sorted by filename (timestamp)
   descending.

**Desktop, adding/syncing:**
1. `client.addNote(text)` → `POST /api/notes` writes a new
   `notes/{timestamp}.md` file into the local clone, then `client.sync()`
   → `POST /api/notes/push` runs `git add` + `git commit` + `git push`.
2. `client.pull()` → `POST /api/notes/pull` runs `git pull`, then
   `notes-api.ts` re-reads the directory and returns the fresh list.

**Phone, capturing (`github-client.ts`):**
1. `client.addNote(text)` appends to a `pending` array in `localStorage`
   immediately — no network required, works with wifi off.
2. `client.sync()` iterates `pending`; for each entry, calls GitHub's
   Contents API (`PUT /repos/<you>/notes-data/contents/notes/<ts>.md`)
   with the note body, using the stored personal access token. Successful
   entries are removed from `pending`; failures stay queued for retry.
3. First run only: `capture-entry.tsx` prompts once for the GitHub
   personal access token and hands it to `github-client`, which keeps it
   in the phone's browser storage. This token is the only access control
   on the phone side — there is no separate password system.
4. `client.listNotes()` / `checkForUpdates()` on the phone are v1 no-ops
   (phone is add-only, see Out of scope) — `NotesView` still renders
   correctly with an empty/unknown list, it just never shows history.

## Error handling

- **Local clone missing** (first run on desktop): auto-clone on startup,
  same spirit as the existing `migrate*` startup steps — if the clone
  fails (no network, bad SSH key), the Notes tab shows a clear inline
  error instead of crashing the server.
- **Fetch/pull/push failures** (desktop): surfaced inline in the tab;
  nothing is lost — the local clone's working tree still has any
  uncommitted/unpushed note.
- **Phone sync failures** (offline, bad/expired token, GitHub down): the
  note stays in `pending` with a visible "not yet synced" state; Sync is
  safe to retry any time. An expired/invalid token shows a clear message
  and re-prompts for a new one.
- **Same-millisecond filename collision** (theoretical, not realistically
  reachable by a single person's manual note-taking): surfaced as a raw
  git/API error rather than special-cased — not worth engineering around.
- **GitHub Actions deploy failure** (bad build, Pages misconfigured): the
  workflow fails visibly in the repo's Actions tab; the previously
  deployed phone page keeps serving the last good bundle until the next
  successful run — a broken build never takes the phone page offline.

## Testing

This codebase has no existing React component-test infrastructure — every
other tab's `.tsx` is verified by hand, not unit-tested; only the
`-db.ts`/`-api.ts` logic layers get `bun test` coverage. This feature
follows that same line, and doesn't introduce new test tooling to cross it:

- `notes-repo.test.ts`: clone/read/write/commit/pull behavior against a
  disposable local bare git repo (no real GitHub network calls).
- `notes-api.test.ts`: route-level tests in the same shape as
  `todo/api.test.ts`.
- `github-client.test.ts`: pending-queue behavior, retry-on-failure, and
  token-invalid handling. `github-client.ts` takes its `Storage` and
  `fetch` as constructor arguments (defaulting to the real
  `window.localStorage` / global `fetch` at the call site in
  `capture-entry.tsx`) specifically so tests can pass an in-memory fake
  storage and a canned fake fetch — no real network call, no dependence
  on a browser DOM inside `bun test`. `local-client.ts` gets its own
  small test file too (same real-local-git-repo fixture as
  `notes-api.test.ts`, with `fetch` scoped to the test server's origin)
  — every task's deliverable is independently testable, so this is
  slightly more than the bare minimum, not less.
- `NotesView.tsx` itself: verified manually (see below), same as every
  other tab's UI in this codebase.
- Manual verification (GitHub Pages deploy + real device behavior, not
  part of `bun test`):
  1. Push a Notes change, confirm the Actions workflow deploys
     successfully and the phone URL serves the update.
  2. Type and dictate a note on the phone with wifi off — confirm it
     persists across a browser restart.
  3. Turn wifi on, tap Sync — confirm the note appears in `notes-data` on
     GitHub, then appears in the desktop tab after Pull.
  4. Add a note on desktop, Save & Sync — confirm it's fetchable from
     GitHub (spot-check via the GitHub UI, since the phone page is
     add-only in v1).
  5. Confirm the phone page is unusable for writing without a valid
     token (private repo correctly rejects unauthenticated calls).

## Future (explicitly out of scope now)

- Phone page also lists/edits existing notes (would need read calls
  against the private repo, still via the stored token — `NotesView`
  already supports this once `github-client.listNotes()` is implemented).
- Background auto-sync instead of a manual button, if manual sync proves
  annoying in practice.
- Voice-note audio retention (currently: dictation only produces text,
  raw audio is never captured or stored).
