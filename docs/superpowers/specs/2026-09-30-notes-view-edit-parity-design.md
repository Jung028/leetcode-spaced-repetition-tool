# Notes: view + edit parity between desktop and phone — design

**Date:** 2026-09-30
**Goal:** extend the shipped Notes feature (spec:
`2026-09-30-notes-tab-phone-sync-design.md`) so both the desktop tab and
the phone capture page can **view, add, and edit** the same notes — today
the phone can only add (never see past notes, never edit), and neither
platform can edit an existing note at all.

## Prerequisites

None — this builds entirely on infrastructure that already exists and is
live: the private `notes-data` repo, the desktop's SSH access to it, the
phone's fine-grained GitHub token, and the deployed capture page.

## Scope

**v1.1 (this spec):**
- A new `updateNote(id, text)` method on the shared `NotesClient`
  interface, implemented by both adapters, overwriting an existing note's
  text in place (same id — editing is not the same as adding a new note).
- Inline edit mode in the one shared `NotesView` component: clicking a
  note switches it to an editable textarea with Save/Cancel, using the
  same manual "you press the button, it syncs" model the Add flow already
  uses — no auto-save-while-typing.
- The phone capture page starts actually reading notes back from GitHub
  (it never has before) — `listNotes()`/`pull()` fetch the real notes
  directory from `notes-data` and merge it with whatever's still
  locally queued/unsynced, so the phone shows full history like desktop
  already does.
- Conflict handling: **last sync wins, no warning or merge UI.** If the
  same note is edited on both devices before either syncs, whichever
  device's push/sync lands last is what survives. This is an explicit,
  accepted simplification for a single-person note-taking tool, not an
  oversight — see Error Handling below for exactly how each platform
  implements "last one wins" instead of just erroring on conflict.

**Out of scope (explicitly deferred):**
- Deleting notes from either platform.
- Any conflict UI, merge view, or edit history/versioning.
- Real-time/auto-save editing (deferred per the earlier design choice —
  editing stays manual-sync, matching Add).
- Pagination/caching for the phone's note list. Fetching works by making
  one GitHub API call per note on top of the directory listing — fine at
  personal note-taking scale (dozens to low hundreds of notes); revisit
  if the note count ever grows into the thousands.

## Design principles

Same principles as the original spec, applied to this extension:

- **Interface Segregation:** `NotesClient` gains exactly one new method.
  GitHub-specific concepts (a file's `sha`, needed to update it via the
  Contents API) stay internal to `github-client.ts` — never added to the
  shared `Note` type or exposed to `NotesView`.
- **Dependency Inversion unchanged:** `NotesView` still only calls
  `NotesClient` methods; adding edit support to the UI automatically
  gives both desktop and phone the same capability, since it's still one
  component behind two adapters.
- **Boundaries validate, internals trust:** the new `PUT /api/notes/:id`
  route validates text the same way `POST /api/notes` already does
  (non-empty after trim); `updateNote` in `notes-repo.ts` validates the
  target note actually exists before overwriting it.

## Architecture

```
notes/
  notes-client.ts    NotesClient interface gains:
                        updateNote(id: string, text: string): Promise<Note>
  notes-repo.ts       + updateNote(clonePath, id, text): overwrites
                        notes/{id}.md in place; throws a clear "note not
                        found" error if the file doesn't exist. Guarded
                        by the existing assertOwnRepo, same as writeNote.
                      pushLocalChanges's rebase step changes from
                        `git pull --rebase` to `git pull --rebase -X theirs`
                        — on a rebase conflict (both devices edited the
                        same note file before either pushed), automatically
                        resolve in favor of the commit currently being
                        pushed, implementing "last sync wins" instead of
                        surfacing a raw conflict error. Every other file
                        in the repo is untouched by this flag — it only
                        matters on the rare case two devices' commits
                        touch literally the same note file.
  notes-api.ts        + PUT /api/notes/:id — same validation shape as
                        POST /api/notes, calls notes-repo's updateNote,
                        404 if the note id doesn't exist.
  local-client.ts     + updateNote(id, text): PUT /api/notes/${id}
  github-client.ts     Reworked to do real remote reads:
                      + listNotes()/pull() now fetch the notes/ directory
                        from GitHub's Contents API, fetch each file's
                        content, and merge with the local pending queue
                        (unsynced notes still show even though GitHub
                        doesn't have them yet). Internally caches each
                        note's id -> sha (needed to update it later) —
                        never exposed outside this file.
                      + updateNote(id, text): PUT to the same Contents API
                        endpoint used for creating a note, but this time
                        with the cached sha (required by GitHub to update
                        an existing file rather than create a new one).
                        If the PUT fails specifically because the sha is
                        stale (someone else changed the file first — a
                        409/422 from GitHub), re-fetch the file's current
                        sha and retry the PUT once with the user's typed
                        text — this is what makes phone-side edits
                        genuinely "last sync wins" rather than erroring.
                        If that retry also fails, surface the error
                        normally.
                      checkForUpdates() stays a no-op (false) — not
                        requested here, and Pull already does a full live
                        fetch every time regardless of the badge.
  NotesView.tsx       + inline edit mode: clicking a note's text swaps it
                        for a textarea with Save/Cancel scoped to that
                        note (new local state: which note id is being
                        edited, and its draft text). Save calls
                        client.updateNote(id, text) then reloads the list,
                        matching the existing Save & Sync pattern for
                        adding. Cancel discards the draft, no network call.
  notes.css           + minor additions for the inline edit textarea and
                        its Save/Cancel buttons, consistent with the
                        existing add-box styling.
```

### Data flow

**Editing, either platform:**
1. User clicks a note in the list → `NotesView` swaps that item into an
   editable textarea, seeded with the note's current text.
2. User edits, clicks Save → `client.updateNote(id, text)` → on success,
   reload the list (same as the existing Add flow's `load()` call) and
   exit edit mode. Click Cancel → discard the draft, exit edit mode, no
   call made.

**Desktop viewing/pulling:** unchanged from the original spec — `readNotes`
already returns every file in `notes/`, so once `updateNote` lands, a
pulled/refreshed list already reflects edits with zero other desktop-side
changes needed.

**Phone viewing/pulling (new):**
1. `listNotes()`/`pull()` call `GET /repos/{owner}/{repo}/contents/notes`
   to list every file, then fetch each file's content (one API call per
   file — see Out of scope on why this is an accepted v1 tradeoff).
2. Merge that remote list with the local pending queue (notes added but
   not yet successfully synced) so nothing the user just typed
   momentarily disappears before its first successful sync.
3. Cache each remote note's `sha` internally, keyed by id, for `updateNote`
   to use later.

## Error handling

- **Desktop edit, note not found:** `updateNote` in `notes-repo.ts` checks
  the file exists before overwriting; `notes-api.ts`'s `PUT /api/notes/:id`
  returns 404 with a clear message if not. Surfaces through the existing
  `local-client.ts` error-message plumbing (the `readErrorMessage` helper
  from the original fix round) straight into `NotesView`'s status line —
  no new error-surfacing code needed, it's already generic.
- **Desktop edit conflict** (same note edited on both devices before
  either pushed): `git pull --rebase -X theirs` auto-resolves in favor of
  whichever device is currently pushing — implements "last sync wins"
  mechanically rather than erroring. This only ever engages on a genuine
  same-file conflict; every other push behaves exactly as it does today.
- **Phone edit conflict:** the GitHub Contents API rejects a PUT with a
  stale `sha` (409/422). `github-client.ts`'s `updateNote` catches
  specifically that case, re-fetches the current `sha`, and retries once
  with the user's text — same "last sync wins" outcome as the desktop
  side, via a different mechanism (GitHub enforces this natively; git
  needs the rebase-strategy flag to get the same behavior).
- **Phone fetch failures** (listing or fetching a note's content fails):
  surfaced the same way `sync()` failures already are today — a clear
  inline status message, nothing crashes, the local pending queue is
  unaffected either way.

## Testing

Same shape as the original feature — logic layers get `bun test` coverage,
`NotesView.tsx` stays manually verified (no component-test infra, per the
original spec's Testing section, unchanged here):

- `notes-repo.test.ts`: `updateNote` overwrites the right file, throws on
  a missing note id, and a new test reproducing an actual same-file
  rebase conflict between two clones — assert `-X theirs` resolves it
  automatically (the same "revert the fix, confirm the new test fails"
  pattern used for the original C1/C2 tests).
- `notes-api.test.ts`: `PUT /api/notes/:id` route tests — success, 404 on
  unknown id, 400 on empty text.
- `local-client.test.ts`: `updateNote` round-trips against a real local
  clone fixture, same pattern as the existing `addNote` test.
- `github-client.test.ts`: `listNotes()`/`pull()` against a fake `fetchFn`
  that returns a directory listing + per-file content, confirming the
  merge with a locally-queued note; `updateNote` success case and the
  stale-sha-retry-once case (fake `fetchFn` returns 409 once, then 200).

## Future (explicitly out of scope now)

- Deleting notes.
- Any real conflict detection/merge UI, if "last sync wins" ever proves
  too lossy in practice.
- Pagination or a lighter fetch strategy for the phone's note list, if
  note count grows large enough for the one-call-per-note pattern to feel
  slow.
