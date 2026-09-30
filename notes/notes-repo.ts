import { existsSync, mkdirSync, readdirSync, realpathSync } from "node:fs";
import type { Note } from "./notes-client";

function notesDir(clonePath: string): string {
  return `${clonePath}/notes`;
}

function noteIdFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

function timestampId(date: Date): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${stamp}-${suffix}`;
}

function shellErrorDetail(err: unknown): string {
  const stderr = (err as { stderr?: Uint8Array }).stderr;
  if (stderr && stderr.length > 0) return Buffer.from(stderr).toString().trim();
  return (err as Error).message;
}

// .quiet() swallows git's stderr into the ShellError, whose message is only
// "Failed with exit code N" — rethrow with the real reason so the user can act on it.
async function runReportingStderr<T>(command: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    throw new Error(`${command} failed: ${shellErrorDetail(err)}`);
  }
}

// Without this, git walks up from a missing or non-repo clonePath into any
// enclosing repository and would stage, commit and push that repo's files instead.
async function assertOwnRepo(clonePath: string): Promise<void> {
  let toplevel: string;
  try {
    toplevel = (await Bun.$`git rev-parse --show-toplevel`.cwd(clonePath).quiet().text()).trim();
  } catch {
    throw new Error(`${clonePath} is not a git repository — run ensureNotesRepoCloned first`);
  }
  if (realpathSync(toplevel) !== realpathSync(clonePath)) {
    throw new Error(
      `refusing to run git in ${clonePath}: it resolves inside another repository (found ${toplevel}) — the notes clone must not live inside another git repository`,
    );
  }
}

async function hasRemoteBranches(clonePath: string): Promise<boolean> {
  const remoteBranches = await runReportingStderr("git ls-remote", () =>
    Bun.$`git ls-remote --heads origin`.cwd(clonePath).quiet().text(),
  );
  return remoteBranches.trim().length > 0;
}

export async function ensureNotesRepoCloned(clonePath: string, remoteUrl: string): Promise<void> {
  if (existsSync(`${clonePath}/.git`)) return;
  await Bun.$`git clone ${remoteUrl} ${clonePath}`.quiet();
}

export async function readNotes(clonePath: string): Promise<Note[]> {
  const dir = notesDir(clonePath);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const notes = await Promise.all(
    files.map(async (filename) => {
      const id = noteIdFromFilename(filename);
      const text = await Bun.file(`${dir}/${filename}`).text();
      return { id, text, createdAt: id } satisfies Note;
    }),
  );
  return notes.sort((a, b) => b.id.localeCompare(a.id));
}

export async function writeNote(clonePath: string, text: string): Promise<Note> {
  await assertOwnRepo(clonePath);
  const dir = notesDir(clonePath);
  mkdirSync(dir, { recursive: true });
  const id = timestampId(new Date());
  await Bun.write(`${dir}/${id}.md`, text);
  return { id, text, createdAt: id };
}

export async function updateNote(clonePath: string, id: string, text: string): Promise<Note> {
  await assertOwnRepo(clonePath);
  const path = `${notesDir(clonePath)}/${id}.md`;
  if (!existsSync(path)) {
    throw new Error(`note not found: ${id}`);
  }
  await Bun.write(path, text);
  return { id, text, createdAt: id };
}

export async function fetchRemote(clonePath: string): Promise<void> {
  await assertOwnRepo(clonePath);
  await Bun.$`git fetch`.cwd(clonePath).quiet();
}

export async function hasUnpulledChanges(clonePath: string): Promise<boolean> {
  await assertOwnRepo(clonePath);
  try {
    const local = (await Bun.$`git rev-parse HEAD`.cwd(clonePath).quiet().text()).trim();
    const upstream = (await Bun.$`git rev-parse @{u}`.cwd(clonePath).quiet().text()).trim();
    return local !== upstream;
  } catch {
    // If HEAD doesn't exist yet, check if there are any commits on any remote branch
    try {
      const remoteRefs = (
        await Bun.$`git for-each-ref --format='%(refname)' refs/remotes/origin`.cwd(clonePath).quiet().text()
      ).trim();
      return remoteRefs.length > 0;
    } catch {
      // No remote refs, repo is empty and no unpulled changes
      return false;
    }
  }
}

export async function pullChanges(clonePath: string): Promise<void> {
  await assertOwnRepo(clonePath);
  if (!(await hasRemoteBranches(clonePath))) return; // nothing has ever been pushed — nothing to pull
  await runReportingStderr("git pull --rebase", () => Bun.$`git pull --rebase -X theirs`.cwd(clonePath).quiet());
}

export async function pushLocalChanges(clonePath: string): Promise<void> {
  await assertOwnRepo(clonePath);
  const status = (await Bun.$`git status --porcelain`.cwd(clonePath).quiet().text()).trim();
  if (status.length > 0) {
    await Bun.$`git add -A`.cwd(clonePath).quiet();
    await Bun.$`git commit -m "Add note"`.cwd(clonePath).quiet();
  }
  let hasCommits = false;
  try {
    await Bun.$`git rev-parse HEAD`.cwd(clonePath).quiet();
    hasCommits = true;
  } catch {
    // No commits yet, nothing to push
  }
  if (!hasCommits) return;
  // Rebasing onto the remote first means a push from elsewhere since our last sync
  // never rejects this push. -X theirs makes "last device to push wins" the actual
  // outcome if the same note was edited on both sides, instead of surfacing a raw
  // rebase conflict — in git rebase, "theirs" is the commit being replayed, i.e. ours.
  if (await hasRemoteBranches(clonePath)) {
    await runReportingStderr("git pull --rebase", () => Bun.$`git pull --rebase -X theirs`.cwd(clonePath).quiet());
  }
  await runReportingStderr("git push", () => Bun.$`git push -u origin HEAD`.cwd(clonePath).quiet());
}
