# Notes tab + phone capture, synced via GitHub — design

**Date:** 2026-09-30
**Goal:** add a **Notes** tab to the existing app (same pattern as Todo,
Exam, etc.) for capturing ideas at the desktop, plus a free, standalone
phone page for capturing notes on the go — with no server to run or pay
for. The two stay in sync through a private GitHub repo acting as shared
storage, matching the user's original "git push/pull" instinct, just
automated behind a single Sync/Pull action instead of the raw commands.

## Prerequisites (one-time, manual — not part of the implementation plan)

Before implementation starts, the user creates:
- `notes-data`: a new **private** GitHub repo, empty except for a
  `notes/` folder.
- `notes-capture`: a new **public** GitHub repo (must be public for free
  GitHub Pages) holding just `index.html`, with GitHub Pages enabled
  (Settings → Pages → deploy from the main branch, root).
- A **fine-grained** personal access token scoped to only the
  `notes-data` repo, with Contents read/write permission — classic
  tokens can't be scoped to one repo, so this must be fine-grained.

## Scope

**v1 (this spec):**
- A new private GitHub repo (`notes-data`) holding one markdown file per
  note, filename = ISO timestamp. One-file-per-note means concurrent notes
  from phone and desktop never collide — no merge-conflict handling needed.
- A new **Notes** tab in the existing Bun app: lists notes, lets you add
  one, shows a badge when new notes exist upstream, Pull to fetch them,
  Save & Sync to push new ones. Uses the desktop's existing GitHub SSH
  access — no new credentials needed there.
- A separate, tiny static page (its own public repo, `notes-capture`,
  deployed free via GitHub Pages) for phone use: one text box, a Save
  button, a Sync button. Typing or using the iPhone keyboard's built-in
  dictation mic writes straight into the text box — no custom audio
  recording or transcription pipeline. Saves to the phone's local browser
  storage immediately (works offline); Sync pushes anything unsynced to
  `notes-data` via GitHub's REST API using a personal access token entered
  once and kept in the phone's browser storage.

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

Follows `CLAUDE.md`'s code quality standards, applied to the desktop side:

- **Single Responsibility:** the local-git-clone mechanics
  (`notes-repo.ts`) are separate from the HTTP routes (`notes-api.ts`),
  separate from the UI (`Notes.tsx`) — same split as every other tab
  (`todo/db.ts` / `todo/api.ts` / `todo/App.tsx`).
- **Boundaries validate, internals trust:** `notes-api.ts` validates
  incoming note text at the route; `notes-repo.ts` trusts what it's given.
- **DRY only for real duplication:** the phone page is intentionally a
  separate, tiny, dependency-free static file — it does not share code
  with the Bun app, because sharing would mean bundling/build tooling for
  a page that must stay a plain file GitHub Pages can serve as-is.

## Architecture

```
notes/                        (new, inside the existing leetcode-srs app)
  notes-repo.ts     local clone lifecycle: ensure-cloned, fetch/pull,
                     write file + commit + push, read all notes from disk
  notes-api.ts       routes: GET notes, POST note, GET sync-status,
                     POST pull, POST push
  Notes.tsx          the new tab: note list, add box, "N new" badge,
                     Pull button, Save & Sync button
  notes-repo.test.ts   exercises git operations against a local temp
                        bare repo (no network, no real GitHub calls)
  notes-api.test.ts    route tests, same shape as todo/api.test.ts

notes-capture/ (separate repo — public, deployed via GitHub Pages)
  index.html         the entire phone page: text box, Save, Sync,
                      one-time token entry, plain JS, no build step
```

`index.ts` gains: `migrateNotesRepo`-equivalent startup step (ensure the
local `notes-data` clone exists) and `...notesApiRoutes()`, following the
existing per-module import pattern.

### Where the local git clone lives

The desktop app keeps its own local clone of `notes-data` on disk
(outside the `leetcode-srs` repo itself, e.g. a sibling directory such as
`../notes-data`, path configurable via an env var the same way
`SRS_DB_PATH` configures the SQLite path today). `notes-repo.ts` is the
only module that touches it, via `Bun.$` git commands (`git fetch`,
`git pull`, `git add`/`commit`/`push`).

### Data flow

**Desktop, viewing:**
1. On mount, `notes-api.ts`'s sync-status route runs `git fetch` against
   the local clone (no working-tree change) and compares local vs. origin
   `HEAD`. A mismatch surfaces as the "N new" badge.
2. Reading the note list is a plain directory read of the local clone's
   `notes/*.md`, sorted by filename (timestamp) descending — no GitHub
   API calls needed for this, since the local clone already has the data
   once fetched.

**Desktop, adding a note:**
1. Write a new `notes/{timestamp}.md` file into the local clone.
2. "Save & Sync" runs `git add` + `git commit` + `git push` in one step.

**Desktop, pulling:**
1. "Pull" runs `git pull` on the local clone, then re-reads the directory.

**Phone, capturing:**
1. Typing or dictating into the text box appends an entry to a `pending`
   array in `localStorage` immediately — no network required.
2. "Sync" iterates the `pending` array; for each entry, calls GitHub's
   Contents API (`PUT /repos/<you>/notes-data/contents/notes/<ts>.md`)
   with the note body, using the stored personal access token. Successful
   entries are removed from `pending`; failures stay queued for the next
   attempt.
3. First run only: the page prompts once for a GitHub personal access
   token (scoped to just the `notes-data` repo, contents read/write) and
   keeps it in the phone's browser storage. This token is the only access
   control on the phone side — there is no separate password system.

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

## Testing

- `notes-repo.test.ts`: clone/read/write/commit/pull behavior against a
  disposable local bare git repo (matches how other modules test against
  a temp SQLite file — no real GitHub network calls in tests).
- `notes-api.test.ts`: route-level tests in the same shape as
  `todo/api.test.ts`.
- Manual verification (the phone page is plain static JS, not part of
  the `bun test` suite):
  1. Type and dictate a note on the phone with wifi off — confirm it
     persists across a browser restart.
  2. Turn wifi on, tap Sync — confirm the note appears in `notes-data` on
     GitHub, then appears in the desktop tab after Pull.
  3. Add a note on desktop, Save & Sync — confirm it's fetchable from the
     phone page's underlying repo (spot-check via GitHub, since the phone
     page is add-only in v1).
  4. Confirm the phone page is unusable for reading/writing without a
     valid token (private repo correctly rejects unauthenticated calls).

## Future (explicitly out of scope now)

- Phone page also lists/edits existing notes (would need read calls
  against the private repo, still via the stored token).
- Background auto-sync instead of a manual button, if manual sync proves
  annoying in practice.
- Voice-note audio retention (currently: dictation only produces text,
  raw audio is never captured or stored).
