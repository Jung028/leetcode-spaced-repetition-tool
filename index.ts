import { fileURLToPath } from "node:url";
import index from "./index.html";
import { openDb } from "./leetcode/db";
import { apiRoutes } from "./leetcode/api";
import { migrateTodo } from "./todo/db";
import { todoApiRoutes } from "./todo/api";
import { ensureNotesRepoCloned } from "./notes/notes-repo";
import { notesApiRoutes } from "./notes/notes-api";
import { migrateAnnouncements } from "./announcement-db";
import { announcementApiRoutes } from "./announcement-api";
import { migrateModules } from "./modules-db";
import { moduleApiRoutes } from "./modules-api";
import { migrateModuleItems } from "./module-items-db";
import { moduleItemsApiRoutes } from "./module-items-api";
import { migrateExam } from "./exam/db";
import { examApiRoutes } from "./exam/api";
import { homeApiRoutes } from "./home-api";
import { migrateLeetcode150 } from "./leetcode150/db";
import { leetcode150ApiRoutes } from "./leetcode150/api";
import { migrateInterview } from "./interview/db";
import { interviewApiRoutes } from "./interview/api";
import { migrateJobs, seedJobsOnce } from "./jobs/db";
import { jobsApiRoutes } from "./jobs/api";
import { JOB_SEED } from "./jobs/seed";
import { migrateGoals, seedGoalsOnce } from "./training/goals-db";
import { goalsApiRoutes } from "./training/goals-api";
import { GOAL_SEED } from "./training/goals-seed";
import { roadmapApiRoutes } from "./training/roadmap-api";
import { localToday } from "./shared/scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
// One-time cleanup: the Theory and Goals features were removed along with
// their data — see docs/superpowers/plans/2026-08-16-theory-to-todo-and-goals-removal.md.
// IF EXISTS makes this a no-op on every subsequent startup.
db.exec(`
  DROP TABLE IF EXISTS project_steps; DROP TABLE IF EXISTS projects;
  DROP TABLE IF EXISTS theory_reviews; DROP TABLE IF EXISTS theory_progress;
  DROP TABLE IF EXISTS theory_schedule; DROP TABLE IF EXISTS theory_state;
`);
// One-time cleanup: the hand-typed Races Calendar was replaced by direct
// links to the user's real spreadsheets (see training/RoadmapLinks.tsx) —
// maintaining a second, hand-copied race list drifted from the source.
db.exec(`DROP TABLE IF EXISTS races; DROP TABLE IF EXISTS races_meta;`);
migrateTodo(db);
migrateAnnouncements(db);
migrateModules(db, localToday());
migrateExam(db, localToday());
migrateLeetcode150(db);
migrateInterview(db);
migrateModuleItems(db, localToday());
migrateJobs(db);
// Imports the 2026-09-23 internship tracker once; guarded by a flag in jobs_meta.
seedJobsOnce(db, JOB_SEED, localToday());
migrateGoals(db);
seedGoalsOnce(db, GOAL_SEED, localToday());
const userscriptPath = new URL("./userscript/leetcode-sync.user.js", import.meta.url);
const wallCalendarPath = new URL("./assets/student-wall-calendar.pdf", import.meta.url);

const NOTES_CLONE_PATH =
  process.env.NOTES_DATA_CLONE_PATH ?? fileURLToPath(new URL("../notes-data", import.meta.url));
const NOTES_REMOTE_URL = process.env.NOTES_DATA_REMOTE;
if (NOTES_REMOTE_URL) {
  try {
    await ensureNotesRepoCloned(NOTES_CLONE_PATH, NOTES_REMOTE_URL);
  } catch (err) {
    console.warn(`Notes repo not available yet: ${(err as Error).message}`);
  }
} else {
  console.warn("NOTES_DATA_REMOTE is not set — the Notes tab will show errors until it is.");
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3005),
  routes: {
    "/": index,
    // Served over http (not file://) so Tampermonkey's browser extension can
    // detect the .user.js URL and show its install prompt — file:// URLs are
    // blocked by default unless "Allow access to file URLs" is enabled.
    "/leetcode-sync.user.js": () =>
      new Response(Bun.file(userscriptPath), {
        headers: { "content-type": "text/javascript; charset=utf-8" },
      }),
    "/assets/student-wall-calendar.pdf": () =>
      new Response(Bun.file(wallCalendarPath), {
        headers: { "content-type": "application/pdf" },
      }),
    ...apiRoutes(db),
    ...todoApiRoutes(db),
    ...announcementApiRoutes(db),
    ...moduleApiRoutes(db),
    ...examApiRoutes(db),
    ...homeApiRoutes(db),
    ...leetcode150ApiRoutes(db),
    ...interviewApiRoutes(db),
    ...moduleItemsApiRoutes(db),
    ...jobsApiRoutes(db),
    ...goalsApiRoutes(db),
    ...roadmapApiRoutes(),
    ...notesApiRoutes(NOTES_CLONE_PATH),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
