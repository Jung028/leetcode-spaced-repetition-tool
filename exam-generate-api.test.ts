import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import type { RunClaude, StartJobDeps } from "./exam-generate";
import { localToday } from "./scheduling";

// INFO5990 is a real, known course (per exam-content/COURSES) with no
// week-2 content authored yet — its *content* is real, but its folder
// resolution is faked via generateDeps.courseDirs below, so these tests
// never touch the real Desktop folder.
const COURSE = "INFO5990";

function harness(runClaude: RunClaude) {
  const root = mkdtempSync(join(tmpdir(), "exam-generate-api-root-"));
  const desktopFixture = mkdtempSync(join(tmpdir(), "exam-generate-api-desktop-"));
  const db = new Database(":memory:");
  migrateExam(db, localToday());
  const deps: StartJobDeps & { courseDirs: Record<string, string> } = {
    runClaude,
    root,
    courseDirs: { [COURSE]: desktopFixture },
  };
  const server = Bun.serve({ port: 0, routes: examApiRoutes(db, deps) });
  return {
    base: server.url.origin,
    desktopFixture,
    cleanup: () => {
      server.stop(true);
      rmSync(root, { recursive: true, force: true });
      rmSync(desktopFixture, { recursive: true, force: true });
    },
  };
}

test("POST generate kicks off a job and GET status reflects it finishing", async () => {
  const h = harness(async () => ({ stdout: "wrote it", stderr: "", exitCode: 0 }));
  mkdirSync(join(h.desktopFixture, "Week 2"));
  try {
    const kickoff = await fetch(`${h.base}/api/exam/${COURSE}/2/generate`, { method: "POST" });
    expect(kickoff.status).toBe(202);

    // The fake runClaude resolves on the next microtask; give it a tick.
    await new Promise((r) => setTimeout(r, 20));

    const statusRes = await fetch(`${h.base}/api/exam/${COURSE}/2/generate/status`);
    const status: any = await statusRes.json();
    expect(status.state).toBe("done");
    expect(status.logTail).toContain("wrote it");
  } finally {
    h.cleanup();
  }
});

test("POST generate returns 404 when no material folder exists for that week", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    // h.desktopFixture has no "Week 3" subfolder.
    const res = await fetch(`${h.base}/api/exam/${COURSE}/3/generate`, { method: "POST" });
    expect(res.status).toBe(404);
  } finally {
    h.cleanup();
  }
});

test("POST generate returns 409 when a job is already running for that week", async () => {
  let resolveClaude: (() => void) | undefined;
  const h = harness(
    () => new Promise((resolve) => { resolveClaude = () => resolve({ stdout: "", stderr: "", exitCode: 0 }); }),
  );
  mkdirSync(join(h.desktopFixture, "Week 2"));
  try {
    const first = await fetch(`${h.base}/api/exam/${COURSE}/2/generate`, { method: "POST" });
    expect(first.status).toBe(202);
    const second = await fetch(`${h.base}/api/exam/${COURSE}/2/generate`, { method: "POST" });
    expect(second.status).toBe(409);
  } finally {
    resolveClaude?.();
    h.cleanup();
  }
});

test("POST generate with an unknown course returns 400", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/UNKNOWN123/2/generate`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});

test("POST generate with an invalid week returns 400", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/${COURSE}/0/generate`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});

test("GET generate status defaults to idle for a week that was never generated", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/${COURSE}/2/generate/status`);
    const body: any = await res.json();
    expect(body).toEqual({ state: "idle" });
  } finally {
    h.cleanup();
  }
});

// INFO5990 Week 2 already has real authored content in exam-content.ts
// (unlike Week 3, which the existing 404 test above relies on being
// pending) — that's exactly the state an /update call requires.
test("POST update kicks off a job using the update prompt and GET status reflects it finishing", async () => {
  const calls: string[][] = [];
  const h = harness(async (args) => {
    calls.push(args);
    return { stdout: "enriched it", stderr: "", exitCode: 0 };
  });
  mkdirSync(join(h.desktopFixture, "Week 2"));
  try {
    const kickoff = await fetch(`${h.base}/api/exam/${COURSE}/2/update`, { method: "POST" });
    expect(kickoff.status).toBe(202);

    // The fake runClaude resolves on the next microtask; give it a tick.
    await new Promise((r) => setTimeout(r, 20));

    const statusRes = await fetch(`${h.base}/api/exam/${COURSE}/2/generate/status`);
    const status: any = await statusRes.json();
    expect(status.state).toBe("done");
    expect(status.logTail).toContain("enriched it");
    expect(calls[0]!.at(-1)).toContain("ALREADY-AUTHORED");
  } finally {
    h.cleanup();
  }
});

test("POST update returns 400 for a week that has never been generated", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/${COURSE}/99/update`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});

test("POST update returns 404 when no material folder exists for that week", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    // h.desktopFixture has no "Week 2" subfolder, even though INFO5990
    // Week 2 content exists in the real exam-content.ts.
    const res = await fetch(`${h.base}/api/exam/${COURSE}/2/update`, { method: "POST" });
    expect(res.status).toBe(404);
  } finally {
    h.cleanup();
  }
});

test("POST update with an unknown course returns 400", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/UNKNOWN123/2/update`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});
