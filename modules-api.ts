import type { Database } from "bun:sqlite";
import {
  createModule,
  deleteModule,
  getModule,
  listModules,
  renameModule,
  setModuleHidden,
  setModuleSortOrder,
} from "./modules-db";
import { countItemsForModule, deleteItemsForModule } from "./module-items-db";
import { deleteCalendarEvent, type SyncDeps } from "./gcal/sync";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export interface ModuleApiDeps {
  sync?: SyncDeps;
}

export function moduleApiRoutes(db: Database, deps: ModuleApiDeps = {}) {
  const sync = deps.sync;
  return {
    "/api/modules": {
      GET: () => json(listModules(db)),
      POST: async (req: Request) => {
        const b = (await req.json().catch(() => null)) as
          | { code?: unknown; name?: unknown }
          | null;
        const code = typeof b?.code === "string" ? b.code : "";
        const name = typeof b?.name === "string" ? b.name : "";
        try {
          return json(createModule(db, code, name), 201);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "bad request";
          return json({ error: msg }, /exists/i.test(msg) ? 409 : 400);
        }
      },
    },
    "/api/modules/:code": {
      PUT: async (req: Request & { params: { code: string } }) => {
        const b = (await req.json().catch(() => null)) as { name?: unknown } | null;
        const name = typeof b?.name === "string" ? b.name : "";
        try {
          const m = renameModule(db, req.params.code, name);
          return m ? json(m) : json({ error: "not found" }, 404);
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "bad request" }, 400);
        }
      },
      PATCH: async (req: Request & { params: { code: string } }) => {
        const b = (await req.json().catch(() => null)) as
          | { hidden?: unknown; sort_order?: unknown }
          | null;
        let m = getModule(db, req.params.code);
        if (!m) return json({ error: "not found" }, 404);
        if (typeof b?.hidden === "boolean") m = setModuleHidden(db, req.params.code, b.hidden);
        if (typeof b?.sort_order === "number")
          m = setModuleSortOrder(db, req.params.code, b.sort_order);
        return json(m);
      },
      DELETE: async (req: Request & { params: { code: string } }) => {
        const code = req.params.code;
        if (!getModule(db, code)) return json({ error: "not found" }, 404);
        const count = countItemsForModule(db, code);
        const cascade = new URL(req.url).searchParams.get("cascade") === "1";
        if (count > 0 && !cascade) return json({ error: "module has items", count }, 409);
        if (count > 0) {
          for (const it of deleteItemsForModule(db, code)) {
            if (it.gcal_event_id) await deleteCalendarEvent(it.gcal_event_id, sync).catch(() => {});
          }
        }
        deleteModule(db, code);
        return json({ ok: true });
      },
    },
  };
}
