import type { Database } from "bun:sqlite";
import {
  createModuleItem,
  deleteModuleItem,
  getModuleItem,
  listModuleItems,
  normalizeDueAt,
  toggleModuleItem,
  updateModuleItem,
  MODULE_ITEM_KINDS,
  type ModuleItemInput,
  type ModuleItemKind,
  type ModuleItemLink,
} from "./module-items-db";
import { deleteCalendarEvent, reconcile, syncModuleItem, type SyncDeps } from "./gcal/sync";
import { moduleExists } from "./modules-db";
import { localToday } from "./shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export interface ModuleItemsApiDeps {
  sync?: SyncDeps;
}

type ParseResult = { input: ModuleItemInput } | { error: string };

function parseLinks(raw: unknown): ModuleItemLink[] | { error: string } {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return { error: "links must be an array" };
  const out: ModuleItemLink[] = [];
  for (const entry of raw) {
    const url = typeof (entry as { url?: unknown })?.url === "string" ? (entry as { url: string }).url.trim() : "";
    const label = typeof (entry as { label?: unknown })?.label === "string" ? (entry as { label: string }).label.trim() : "";
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { error: "each link needs a valid http(s) url" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { error: "each link needs a valid http(s) url" };
    }
    out.push({ label, url });
  }
  return out;
}

function parseInput(db: Database, body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) return { error: "invalid body" };
  const b = body as Record<string, unknown>;

  const course = typeof b.course === "string" ? b.course : "";
  if (!moduleExists(db, course)) return { error: "unknown module" };

  const kind = typeof b.kind === "string" ? b.kind : "";
  if (!MODULE_ITEM_KINDS.includes(kind as ModuleItemKind)) {
    return { error: `kind must be one of ${MODULE_ITEM_KINDS.join(", ")}` };
  }

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return { error: "title is required" };

  const dueRaw = typeof b.due_at === "string" ? b.due_at.trim() : "";
  let due_at: string;
  try {
    due_at = normalizeDueAt(dueRaw);
  } catch {
    return { error: "due_at must be YYYY-MM-DD or YYYY-MM-DDTHH:MM" };
  }

  const description = typeof b.description === "string" ? b.description : "";

  const weightRaw = typeof b.weight === "string" ? b.weight.trim() : "";
  if (weightRaw.length > 12) return { error: "weight too long" };
  const weight = weightRaw || undefined;

  const links = parseLinks(b.links);
  if ("error" in links) return { error: links.error };

  return { input: { course, kind: kind as ModuleItemKind, title, description, due_at, links, weight } };
}

export function moduleItemsApiRoutes(db: Database, deps: ModuleItemsApiDeps = {}) {
  const sync = deps.sync;
  return {
    "/api/module-items": {
      GET: () => json(listModuleItems(db)),
      POST: async (req: Request) => {
        const parsed = parseInput(db, await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const created = createModuleItem(db, parsed.input, localToday());
        const synced = await syncModuleItem(db, created, sync);
        return json(synced ?? created, 201);
      },
    },
    "/api/module-items/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const parsed = parseInput(db, await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateModuleItem(db, Number(req.params.id), parsed.input, localToday());
        if (!updated) return json({ error: "not found" }, 404);
        const synced = await syncModuleItem(db, updated, sync);
        return json(synced ?? updated);
      },
      DELETE: async (req: { params: { id: string } }) => {
        const deleted = deleteModuleItem(db, Number(req.params.id));
        if (!deleted) return json({ error: "not found" }, 404);
        if (deleted.gcal_event_id) {
          await deleteCalendarEvent(deleted.gcal_event_id, sync).catch(() => {});
        }
        return json({ ok: true });
      },
    },
    "/api/module-items/:id/toggle": {
      POST: async (req: { params: { id: string } }) => {
        const toggled = toggleModuleItem(db, Number(req.params.id), localToday());
        if (!toggled) return json({ error: "not found" }, 404);
        const synced = await syncModuleItem(db, toggled, sync);
        return json(synced ?? toggled);
      },
    },
    "/api/module-items/sync": {
      POST: async () => json(await reconcile(db, sync)),
    },
  };
}
