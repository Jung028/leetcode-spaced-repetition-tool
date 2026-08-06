import type { Database } from "bun:sqlite";
import { getCurrentLeetcode150 } from "./leetcode150-db";
import { leetcode150Url } from "./leetcode150-content";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function leetcode150ApiRoutes(db: Database) {
  return {
    "/api/leetcode150/current": {
      GET: () => {
        const item = getCurrentLeetcode150(db);
        if (!item) return json({ done: true });
        return json({ ...item, url: leetcode150Url(item) });
      },
    },
  };
}
