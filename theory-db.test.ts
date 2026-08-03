import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateTheory,
  listDueTheory,
  getTheoryConcept,
  saveTheoryAnswer,
  saveTheoryContent,
  getNextBlankConcept,
  reviewTheoryConcept,
  countTheoryReviewsToday,
  countOverdueTheory,
  listTheoryCompletedToday,
} from "./theory-db";
import { addDays } from "./scheduling";

const TODAY = "2026-07-20";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTheory(db, TODAY);
});

test("seeds 150 concepts with real categories and blank content, releasing the first 5 immediately under the backlog cap", () => {
  const first = getTheoryConcept(db, 1)!;
  expect(first.concept_day).toBe(1);
  expect(first.rung).toBe(-1);
  expect(first.next_review).toBe(TODAY);
  expect(first.your_answer).toBe("");
  expect(first.question).toBe("");
  expect(first.answer).toBe("");
  expect(first.answer_format).toBe("text");
  expect(first.category.length).toBeGreaterThan(0);

  expect(getTheoryConcept(db, 5)!.next_review).toBe(TODAY);
  // Not yet released — keeps its original calendar placeholder, unused until release.
  expect(getTheoryConcept(db, 6)!.next_review).toBe(addDays(TODAY, 5));
  expect(getTheoryConcept(db, 150)!.next_review).toBe(addDays(TODAY, 149));
  expect(getTheoryConcept(db, 150)!.category.length).toBeGreaterThan(0);
});

test("migrateTheory does not reseed (and doesn't reset progress) on a second call", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  migrateTheory(db, TODAY);
  expect(getTheoryConcept(db, 1)!.rung).toBe(0);
});

test("listDueTheory excludes released concepts that still have blank content", () => {
  expect(listDueTheory(db, TODAY)).toEqual([]);
});

test("listDueTheory shows released concepts once they have content, still capped at 5", () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("listDueTheory a week later still caps at 5 if nothing has been reviewed", () => {
  // Time passing alone doesn't grow the pile — only clearing backlog does.
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const due = listDueTheory(db, addDays(TODAY, 7));
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("reviewing a released concept lets the next one in, keeping the pile at the cap", () => {
  for (let day = 1; day <= 6; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  reviewTheoryConcept(db, 1, "correct", TODAY); // concept 1 now due in 3 days, drops off
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([2, 3, 4, 5, 6]);
});

test("a released-but-blank concept still counts toward the backlog gate, so missing content doesn't over-release", () => {
  // Nothing has content yet. If the gate ignored blanks when computing
  // backlog, it would see backlog=0 forever and release all 150 at once.
  expect(listDueTheory(db, TODAY)).toEqual([]);
  const { released_up_to } = db.query(`SELECT released_up_to FROM theory_state`).get() as { released_up_to: number };
  expect(released_up_to).toBe(5);
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]); // not 1..150
});

test("saveTheoryAnswer stores a draft without affecting scheduling or content", () => {
  const updated = saveTheoryAnswer(db, 1, "my draft")!;
  expect(updated.your_answer).toBe("my draft");
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(TODAY);
  expect(updated.question).toBe("");
});

test("saveTheoryContent sets question and answer, leaving scheduling untouched", () => {
  const updated = saveTheoryContent(db, 1, "What is a load balancer?", "Distributes traffic.")!;
  expect(updated.question).toBe("What is a load balancer?");
  expect(updated.answer).toBe("Distributes traffic.");
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(TODAY);
});

test("saveTheoryContent defaults answer_format to 'text' when omitted", () => {
  const updated = saveTheoryContent(db, 1, "Q", "A")!;
  expect(updated.answer_format).toBe("text");
});

test("saveTheoryContent stores 'image' and 'link' formats when passed", () => {
  const image = saveTheoryContent(db, 1, "Q", "https://example.com/pic.png", "image")!;
  expect(image.answer_format).toBe("image");
  const link = saveTheoryContent(db, 2, "Q2", "https://example.com/article", "link")!;
  expect(link.answer_format).toBe("link");
});

test("saveTheoryContent can overwrite existing content", () => {
  saveTheoryContent(db, 1, "Old question", "Old answer");
  const updated = saveTheoryContent(db, 1, "New question", "New answer")!;
  expect(updated.question).toBe("New question");
  expect(updated.answer).toBe("New answer");
});

test("saveTheoryContent can overwrite a format back to 'text'", () => {
  saveTheoryContent(db, 1, "Q", "https://example.com/pic.png", "image");
  const updated = saveTheoryContent(db, 1, "Q", "Plain answer", "text")!;
  expect(updated.answer_format).toBe("text");
  expect(updated.answer).toBe("Plain answer");
});

test("saveTheoryContent on an unknown concept_day returns null", () => {
  expect(saveTheoryContent(db, 9999, "Q", "A")).toBeNull();
});

test("getNextBlankConcept returns the lowest-numbered concept still missing content", () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  saveTheoryContent(db, 2, "Q2", "A2");
  const next = getNextBlankConcept(db)!;
  expect(next.conceptDay).toBe(3);
  expect(next.category.length).toBeGreaterThan(0);
});

test("getNextBlankConcept returns null once every concept has content", () => {
  for (let day = 1; day <= 150; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  expect(getNextBlankConcept(db)).toBeNull();
});

test("getNextBlankConcept is unaffected by mixed answer formats — 'blank' is about question, not format", () => {
  saveTheoryContent(db, 1, "Q1", "https://example.com/pic.png", "image");
  saveTheoryContent(db, 2, "Q2", "https://example.com/article", "link");
  const next = getNextBlankConcept(db)!;
  expect(next.conceptDay).toBe(3);
});

test("reviewTheoryConcept 'correct' advances the rung and reschedules 3 days out the first time", () => {
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated.concept_day).toBe(1);
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe("2026-07-23");
  expect(updated.your_answer).toBe("");
});

test("reviewTheoryConcept 'correct' twice climbs to 5 days on the second success", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated.rung).toBe(1);
  expect(updated.next_review).toBe("2026-07-25");
});

test("reviewTheoryConcept 'wrong' resets rung and schedules tomorrow", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const updated = reviewTheoryConcept(db, 1, "wrong", TODAY)!;
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe("2026-07-21");
});

test("reviewTheoryConcept on an unknown concept_day returns null", () => {
  expect(reviewTheoryConcept(db, 9999, "correct", TODAY)).toBeNull();
});

test("countTheoryReviewsToday only counts today's reviews", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  reviewTheoryConcept(db, 2, "wrong", TODAY);
  reviewTheoryConcept(db, 3, "correct", "2026-07-10");
  expect(countTheoryReviewsToday(db, TODAY)).toBe(2);
});

test("countOverdueTheory counts strictly-past next_review dates among released, content-filled concepts only", () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  expect(countOverdueTheory(db, TODAY)).toBe(0);
  // Nothing reviewed, so the pile stays at the 5 released on day one — all overdue two days later.
  expect(countOverdueTheory(db, addDays(TODAY, 2))).toBe(5);
});

test("countOverdueTheory excludes blank-content concepts even though they're released and overdue", () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  // concepts 2-5 are released but left blank
  expect(countOverdueTheory(db, addDays(TODAY, 2))).toBe(1);
});

test("listTheoryCompletedToday returns concepts reviewed today, deduped, ordered by concept_day", () => {
  reviewTheoryConcept(db, 1, "wrong", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY); // second review same day, shouldn't duplicate
  reviewTheoryConcept(db, 2, "correct", "2026-07-19"); // different day, shouldn't show up

  const completed = listTheoryCompletedToday(db, TODAY);
  expect(completed.map((c) => c.concept_day)).toEqual([1]);
});

test("listTheoryCompletedToday is empty when nothing was reviewed today", () => {
  expect(listTheoryCompletedToday(db, TODAY)).toEqual([]);
});

test("migrating a pre-existing db (old schema, no content columns) backfills categories and the watermark", () => {
  // Simulate an old-format db exactly as pre-migration code would have left
  // it: 150 concepts seeded with calendar-offset next_review dates, no
  // category/question/answer columns at all, only concept 1 ever actually
  // passed.
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);
  const insert = legacy.query(
    `INSERT INTO theory_schedule (concept_day, rung, next_review, your_answer) VALUES (?, ?, ?, '')`,
  );
  for (let day = 1; day <= 150; day++) insert.run(day, -1, addDays(TODAY, day - 1));
  legacy
    .query(`UPDATE theory_schedule SET rung = 0, next_review = ? WHERE concept_day = 1`)
    .run(addDays(TODAY, 3));
  legacy
    .query(`INSERT INTO theory_reviews (concept_day, reviewed_at, result) VALUES (1, ?, 'correct')`)
    .run(TODAY);

  const laterToday = addDays(TODAY, 10);
  migrateTheory(legacy, laterToday);

  const { released_up_to } = legacy
    .query(`SELECT released_up_to FROM theory_state`)
    .get() as { released_up_to: number };
  expect(released_up_to).toBe(5);

  // Categories were backfilled for every row, even ones far past the watermark.
  for (const day of [1, 5, 75, 150]) {
    const row = legacy.query(`SELECT category FROM theory_schedule WHERE concept_day = ?`).get(day) as {
      category: string;
    };
    expect(row.category.length).toBeGreaterThan(0);
  }

  // Content stays blank on an upgrade — nothing shows up in the due list
  // until content is added, even though the watermark is correctly 5.
  expect(listDueTheory(legacy, laterToday)).toEqual([]);
});

test("migrating a db that already has category/question/answer but predates answer_format backfills it to 'text' on every row", () => {
  // Simulate a db that already went through the content-column migration
  // (has category/question/answer, some rows with real content) but
  // predates the answer_format column.
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      category TEXT NOT NULL DEFAULT '',
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      question TEXT NOT NULL DEFAULT '',
      answer TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE theory_state (released_up_to INTEGER NOT NULL DEFAULT 0);
  `);
  const insert = legacy.query(
    `INSERT INTO theory_schedule (concept_day, category, rung, next_review, your_answer, question, answer) VALUES (?, 'System Design', -1, ?, '', ?, ?)`,
  );
  for (let day = 1; day <= 150; day++) insert.run(day, addDays(TODAY, day - 1), "", "");
  legacy.query(`UPDATE theory_schedule SET question = ?, answer = ? WHERE concept_day = 1`).run(
    "Real question",
    "Real answer",
  );
  legacy.query(`INSERT INTO theory_state (released_up_to) VALUES (5)`).run();

  migrateTheory(legacy, TODAY);

  for (const day of [1, 2, 150]) {
    const row = legacy.query(`SELECT answer_format FROM theory_schedule WHERE concept_day = ?`).get(day) as {
      answer_format: string;
    };
    expect(row.answer_format).toBe("text");
  }
});
