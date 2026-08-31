import type { Database } from "bun:sqlite";
import { getCurrentLeetcode150 } from "./db";
import { leetcode150Url } from "./content";
import { localToday, overdueDays } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function leetcode150ApiRoutes(db: Database) {
  return {
    "/api/leetcode150/current": {
      GET: () => {
        const today = localToday();
        const { item } = getCurrentLeetcode150(db, today);
        if (!item) return json({ done: true });
        return json({
          ...item,
          url: leetcode150Url(item),
          overdueDays: overdueDays(item.dueSince, today),
        });
      },
    },
  };
}
