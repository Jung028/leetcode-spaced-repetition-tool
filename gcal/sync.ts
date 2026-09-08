import type { Database } from "bun:sqlite";
import type { ModuleItem, ModuleItemKind } from "../module-items-db";
import {
  getModuleItem,
  listModuleItems,
  listItemsNeedingSync,
  markItemSynced,
  markItemSyncError,
} from "../module-items-db";
import { getAccessToken, type TokenResult } from "./auth";

const CALENDAR_ID = "primary";
const EVENTS_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
const MARKER = "[module-planner]";
const TIME_ZONE = "Australia/Sydney";
const DEFAULT_BASE_URL = "http://localhost:3005";

const REMINDER_MINUTES = [10080, 4320, 1440] as const; // 1 week / 3 days / 1 day

const COLOR_BY_KIND: Record<ModuleItemKind, string> = {
  viva: "11", // Tomato
  presentation: "5", // Banana
  assignment: "9", // Blueberry
  other: "8", // Graphite
};

export interface SyncDeps {
  fetch?: typeof fetch;
  getToken?: () => Promise<TokenResult>;
  appBaseUrl?: string;
}

export interface GoogleEventBody {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  colorId: string;
  reminders: { useDefault: false; overrides: Array<{ method: "popup"; minutes: number }> };
  extendedProperties: { private: { modulePlannerId: string } };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function addMinutesToLocalStamp(stamp: string, minutes: number): string {
  const [date, time] = stamp.split("T");
  const [y, m, d] = date!.split("-").map(Number) as [number, number, number];
  const [hh, mm] = time!.split(":").map(Number) as [number, number];
  const dt = new Date(y, m - 1, d, hh, mm + minutes);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(
    dt.getMinutes(),
  )}:00`;
}

export function buildEvent(item: ModuleItem, appBaseUrl: string = DEFAULT_BASE_URL): GoogleEventBody {
  const linkLines = item.links.map((l) => `${l.label || "Link"}: ${l.url}`).join("\n");
  const description = [
    item.description.trim(),
    linkLines,
    `${MARKER} · ${appBaseUrl}/?tab=modules&item=${item.id}`,
  ]
    .filter((part) => part.length > 0)
    .join("\n\n");

  return {
    summary: `${item.completed ? "✓ " : ""}${item.course} ${item.kind}: ${item.title}`,
    description,
    start: { dateTime: `${item.due_at}:00`, timeZone: TIME_ZONE },
    end: { dateTime: addMinutesToLocalStamp(item.due_at, 30), timeZone: TIME_ZONE },
    colorId: COLOR_BY_KIND[item.kind],
    reminders: {
      useDefault: false,
      overrides: item.completed
        ? []
        : REMINDER_MINUTES.map((minutes) => ({ method: "popup" as const, minutes })),
    },
    extendedProperties: { private: { modulePlannerId: String(item.id) } },
  };
}

function nowStamp(): string {
  return new Date().toISOString().slice(0, 19);
}

async function resolveToken(deps: SyncDeps): Promise<TokenResult> {
  return (deps.getToken ?? getAccessToken)();
}

export async function syncModuleItem(
  db: Database,
  item: ModuleItem,
  deps: SyncDeps = {},
): Promise<ModuleItem | null> {
  const doFetch = deps.fetch ?? fetch;
  const tok = await resolveToken(deps);
  if (!tok.ok) {
    markItemSyncError(db, item.id, tok.reason);
    return getModuleItem(db, item.id);
  }
  const headers = {
    authorization: `Bearer ${tok.token}`,
    "content-type": "application/json",
  };
  const body = JSON.stringify(buildEvent(item, deps.appBaseUrl));

  try {
    if (item.gcal_event_id) {
      const res = await doFetch(`${EVENTS_URL}/${item.gcal_event_id}`, { method: "PATCH", headers, body });
      if (res.status !== 404 && res.status !== 410) {
        if (!res.ok) {
          markItemSyncError(db, item.id, `Calendar update failed (${res.status})`);
          return getModuleItem(db, item.id);
        }
        markItemSynced(db, item.id, item.gcal_event_id, nowStamp());
        return getModuleItem(db, item.id);
      }
      // fall through: event was deleted in Google — recreate it
    }

    const res = await doFetch(EVENTS_URL, { method: "POST", headers, body });
    if (!res.ok) {
      markItemSyncError(db, item.id, `Calendar create failed (${res.status})`);
      return getModuleItem(db, item.id);
    }
    const created = (await res.json()) as { id: string };
    markItemSynced(db, item.id, created.id, nowStamp());
    return getModuleItem(db, item.id);
  } catch (err) {
    markItemSyncError(db, item.id, err instanceof Error ? err.message : "Calendar sync error");
    return getModuleItem(db, item.id);
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  deps: SyncDeps = {},
): Promise<{ ok: boolean; error?: string }> {
  const doFetch = deps.fetch ?? fetch;
  const tok = await resolveToken(deps);
  if (!tok.ok) return { ok: false, error: tok.reason };
  try {
    const res = await doFetch(`${EVENTS_URL}/${eventId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${tok.token}` },
    });
    if (res.ok || res.status === 404 || res.status === 410) return { ok: true };
    return { ok: false, error: `Calendar delete failed (${res.status})` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Calendar delete error" };
  }
}

interface CalendarEvent {
  id: string;
  extendedProperties?: { private?: Record<string, string> };
}

async function listPlannerEvents(doFetch: typeof fetch, token: string): Promise<CalendarEvent[]> {
  const out: CalendarEvent[] = [];
  const year = new Date().getFullYear();
  const timeMin = new Date(year - 1, 0, 1).toISOString();
  const timeMax = new Date(year + 2, 0, 1).toISOString();
  let pageToken: string | undefined;
  do {
    const url = new URL(EVENTS_URL);
    url.searchParams.set("q", MARKER);
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("maxResults", "250");
    url.searchParams.set("showDeleted", "false");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await doFetch(url.toString(), { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) break;
    const page = (await res.json()) as { items?: CalendarEvent[]; nextPageToken?: string };
    out.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return out;
}

export async function reconcile(
  db: Database,
  deps: SyncDeps = {},
): Promise<{ synced: number; errors: number; orphansRemoved: number }> {
  let synced = 0;
  let errors = 0;
  let orphansRemoved = 0;

  for (const item of listItemsNeedingSync(db)) {
    const result = await syncModuleItem(db, item, deps);
    if (result?.sync_state === "synced") synced += 1;
    else errors += 1;
  }

  const doFetch = deps.fetch ?? fetch;
  const tok = await resolveToken(deps);
  if (tok.ok) {
    const knownIds = new Set(listModuleItems(db).map((i) => String(i.id)));
    const events = await listPlannerEvents(doFetch, tok.token);
    for (const ev of events) {
      const plannerId = ev.extendedProperties?.private?.modulePlannerId;
      if (!plannerId || knownIds.has(plannerId)) continue;
      const del = await deleteCalendarEvent(ev.id, deps);
      if (del.ok) orphansRemoved += 1;
    }
  }

  return { synced, errors, orphansRemoved };
}
