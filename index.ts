import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { migrateTodo } from "./todo-db";
import { todoApiRoutes } from "./todo-api";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { homeApiRoutes } from "./home-api";
import { migrateLeetcode150 } from "./leetcode150-db";
import { leetcode150ApiRoutes } from "./leetcode150-api";
import { localToday } from "./scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
// One-time cleanup: the Goals feature (projects/steps) was removed along
// with its data — see docs/superpowers/plans/2026-08-16-theory-to-todo-and-goals-removal.md.
// IF EXISTS makes this a no-op on every subsequent startup.
db.exec(`DROP TABLE IF EXISTS project_steps; DROP TABLE IF EXISTS projects;`);
migrateTodo(db);
migrateExam(db, localToday());
migrateLeetcode150(db);
const userscriptPath = new URL("./userscript/leetcode-sync.user.js", import.meta.url);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
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
    ...examApiRoutes(db),
    ...homeApiRoutes(db),
    ...leetcode150ApiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
