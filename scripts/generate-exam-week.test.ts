import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanWeekFolder, buildScaffold, renderScaffoldModule, generateWeekFile } from "./generate-exam-week";

function makeWeekDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "exam-week-"));
  mkdirSync(join(dir, "lecture"), { recursive: true });
  writeFileSync(join(dir, "lecture", "slides.pdf"), "x");
  writeFileSync(join(dir, "lecture", "clip.mp4"), "x");
  writeFileSync(join(dir, "notes.md"), "x");
  writeFileSync(join(dir, ".DS_Store"), "x");
  return dir;
}

test("scanWeekFolder finds material files and video files separately, skipping dotfiles", () => {
  const dir = makeWeekDir();
  const { materials, videos } = scanWeekFolder(dir);
  expect(materials).toEqual(["lecture/slides.pdf", "notes.md"]);
  expect(videos).toEqual(["lecture/clip.mp4"]);
  rmSync(dir, { recursive: true, force: true });
});

test("buildScaffold produces the requested number of blank papers, each with an 8/4/2 question mix", () => {
  const papers = buildScaffold(1, 2, ["notes.md"]);
  expect(papers.length).toBe(2);
  expect(papers[0]!.paperNumber).toBe(1);
  expect(papers[1]!.paperNumber).toBe(2);
  expect(papers[0]!.questions.filter((q) => q.type === "mcq").length).toBe(8);
  expect(papers[0]!.questions.filter((q) => q.type === "short").length).toBe(4);
  expect(papers[0]!.questions.filter((q) => q.type === "scenario").length).toBe(2);
  expect(papers[0]!.sourceFiles).toEqual(["notes.md"]);
});

test("renderScaffoldModule emits a module exporting WEEK_<n>_PAPERS", () => {
  const papers = buildScaffold(3, 1, ["notes.md"]);
  const source = renderScaffoldModule(3, papers, []);
  expect(source).toContain("export const WEEK_3_PAPERS: ExamPaperSeed[] =");
  expect(source).not.toContain("Video lectures found");
});

test("renderScaffoldModule notes video files that won't be transcribed", () => {
  const source = renderScaffoldModule(1, [], ["lecture/clip.mp4"]);
  expect(source).toContain("Video lectures found but not readable as text");
  expect(source).toContain("lecture/clip.mp4");
});

test("generateWeekFile refuses to overwrite an existing scaffold without force", async () => {
  const dir = makeWeekDir();
  const outDir = mkdtempSync(join(tmpdir(), "exam-out-"));
  const outPath = join(outDir, "week-1.ts");
  writeFileSync(outPath, "existing content");

  const result = await generateWeekFile({ week: 1, weekDir: dir, outPath });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("already exists");
  expect(await Bun.file(outPath).text()).toBe("existing content");

  rmSync(dir, { recursive: true, force: true });
  rmSync(outDir, { recursive: true, force: true });
});

test("generateWeekFile overwrites when force is true", async () => {
  const dir = makeWeekDir();
  const outDir = mkdtempSync(join(tmpdir(), "exam-out-"));
  const outPath = join(outDir, "week-1.ts");
  writeFileSync(outPath, "existing content");

  const result = await generateWeekFile({ week: 1, weekDir: dir, outPath, force: true });
  expect(result.written).toBe(true);
  const text = await Bun.file(outPath).text();
  expect(text).toContain("WEEK_1_PAPERS");

  rmSync(dir, { recursive: true, force: true });
  rmSync(outDir, { recursive: true, force: true });
});

test("generateWeekFile errors clearly when the week folder doesn't exist", async () => {
  const result = await generateWeekFile({ week: 99, weekDir: "/nonexistent/week-99", outPath: "/tmp/whatever-99.ts" });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("not found");
});
