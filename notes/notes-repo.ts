import { existsSync, mkdirSync, readdirSync } from "node:fs";
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

export async function ensureNotesRepoCloned(clonePath: string, remoteUrl: string): Promise<void> {
  if (existsSync(clonePath)) return;
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
  const dir = notesDir(clonePath);
  mkdirSync(dir, { recursive: true });
  const id = timestampId(new Date());
  await Bun.write(`${dir}/${id}.md`, text);
  return { id, text, createdAt: id };
}

export async function fetchRemote(clonePath: string): Promise<void> {
  await Bun.$`git fetch`.cwd(clonePath).quiet();
}

export async function hasUnpulledChanges(clonePath: string): Promise<boolean> {
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
  await Bun.$`git pull`.cwd(clonePath).quiet();
}

export async function pushLocalChanges(clonePath: string): Promise<void> {
  const status = (await Bun.$`git status --porcelain`.cwd(clonePath).quiet().text()).trim();
  if (status.length > 0) {
    await Bun.$`git add -A`.cwd(clonePath).quiet();
    await Bun.$`git commit -m "Add note"`.cwd(clonePath).quiet();
  }
  // Only push if there's at least one commit
  let hasCommits = false;
  try {
    await Bun.$`git rev-parse HEAD`.cwd(clonePath).quiet();
    hasCommits = true;
  } catch {
    // No commits yet, nothing to push
  }
  if (hasCommits) {
    await Bun.$`git push -u origin HEAD`.cwd(clonePath).quiet();
  }
}
