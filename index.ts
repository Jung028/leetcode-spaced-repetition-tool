import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/": index,
    ...apiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
