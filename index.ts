import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
import { homeApiRoutes } from "./home-api";
import { localToday } from "./scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
migrateTheory(db, localToday());
migrateGoals(db, localToday());
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
    ...theoryApiRoutes(db),
    ...goalsApiRoutes(db),
    ...homeApiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
