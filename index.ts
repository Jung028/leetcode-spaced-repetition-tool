import index from "./index.html";
import { openDb } from "./leetcode/db";
import { apiRoutes } from "./leetcode/api";
import { migrateTodo } from "./todo/db";
import { todoApiRoutes } from "./todo/api";
import { migrateAnnouncements } from "./announcement-db";
import { announcementApiRoutes } from "./announcement-api";
import { migrateModules } from "./modules-db";
import { moduleApiRoutes } from "./modules-api";
import { migrateModuleItems } from "./module-items-db";
import { moduleItemsApiRoutes } from "./module-items-api";
import { reconcile as reconcileModuleCalendar } from "./gcal/sync";
import { migrateExam } from "./exam/db";
import { examApiRoutes } from "./exam/api";
import { homeApiRoutes } from "./home-api";
import { migrateLeetcode150 } from "./leetcode150/db";
import { leetcode150ApiRoutes } from "./leetcode150/api";
import { migrateInterview } from "./interview/db";
import { interviewApiRoutes } from "./interview/api";
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
migrateTodo(db);
migrateAnnouncements(db);
migrateModules(db, localToday());
migrateExam(db, localToday());
migrateLeetcode150(db);
migrateInterview(db);
migrateModuleItems(db, localToday());
const userscriptPath = new URL("./userscript/leetcode-sync.user.js", import.meta.url);

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
    ...apiRoutes(db),
    ...todoApiRoutes(db),
    ...announcementApiRoutes(db),
    ...moduleApiRoutes(db),
    ...examApiRoutes(db),
    ...homeApiRoutes(db),
    ...leetcode150ApiRoutes(db),
    ...interviewApiRoutes(db),
    ...moduleItemsApiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);

// Catch-up sync for any module item changed while the server was down.
reconcileModuleCalendar(db)
  .then((r) => console.log(`[module-planner] calendar reconcile:`, r))
  .catch((e) => console.error(`[module-planner] calendar reconcile failed:`, e));
