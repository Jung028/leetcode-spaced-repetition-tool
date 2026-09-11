import React, { useEffect, useMemo, useState } from "react";
import {
  MODULE_ITEM_KINDS,
  type ModuleItem,
  type ModuleItemKind,
  type ModuleItemLink,
} from "./module-items-db";
import type { Module } from "./modules-db";
import { localToday } from "./shared/scheduling";
import { deadlineLabel } from "./time-left";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

interface ItemDraft {
  course: string;
  kind: ModuleItemKind;
  title: string;
  description: string;
  weight: string; // e.g. "20%" or ""
  dueDate: string; // 'YYYY-MM-DD'
  dueTime: string; // 'HH:MM' or ''
  links: ModuleItemLink[];
}

const api = {
  list: () => fetch("/api/module-items").then((r) => json<ModuleItem[]>(r)),
  create: (d: ItemDraft) =>
    fetch("/api/module-items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(d)),
    }).then((r) => json<ModuleItem>(r)),
  update: (id: number, d: ItemDraft) =>
    fetch(`/api/module-items/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(d)),
    }).then((r) => json<ModuleItem>(r)),
  toggle: (id: number) =>
    fetch(`/api/module-items/${id}/toggle`, { method: "POST" }).then((r) => json<ModuleItem>(r)),
  remove: (id: number) =>
    fetch(`/api/module-items/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
  modules: () => fetch("/api/modules").then((r) => json<Module[]>(r)),
  createModule: (code: string, name: string) =>
    fetch("/api/modules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, name }),
    }).then((r) => json<Module>(r)),
  renameModule: (code: string, name: string) =>
    fetch(`/api/modules/${code}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => json<Module>(r)),
  setModuleHidden: (code: string, hidden: boolean) =>
    fetch(`/api/modules/${code}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hidden }),
    }).then((r) => json<Module>(r)),
  deleteModule: (code: string, cascade: boolean) =>
    fetch(`/api/modules/${code}${cascade ? "?cascade=1" : ""}`, { method: "DELETE" }).then((r) =>
      json<{ ok: true }>(r),
    ),
};

function toPayload(d: ItemDraft) {
  return {
    course: d.course,
    kind: d.kind,
    title: d.title.trim(),
    description: d.description,
    weight: d.weight.trim() || undefined,
    due_at: d.dueTime ? `${d.dueDate}T${d.dueTime}` : d.dueDate,
    links: d.links.filter((l) => l.url.trim().length > 0).map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
  };
}

function draftFrom(item: ModuleItem): ItemDraft {
  const [dueDate, dueTime] = item.due_at.split("T");
  return {
    course: item.course,
    kind: item.kind,
    title: item.title,
    description: item.description,
    weight: item.weight ?? "",
    dueDate: dueDate!,
    dueTime: dueTime === "23:59" ? "" : dueTime ?? "",
    links: item.links.length ? item.links : [],
  };
}

function emptyDraft(course: string): ItemDraft {
  return { course, kind: "assignment", title: "", description: "", weight: "", dueDate: "", dueTime: "", links: [] };
}

const KIND_LABEL: Record<ModuleItemKind, string> = {
  assignment: "Assignment",
  presentation: "Presentation",
  viva: "Viva",
  quiz: "Quiz",
  exam: "Exam",
  other: "Other",
};

type ViewMode = "grouped" | "flat";
type SortKey = "due-asc" | "due-desc" | "module" | "kind";
type KindFilter = ModuleItemKind | "all";

// How many whole days until an item is due (negative = overdue). "Today" is the
// local calendar date — `toISOString()` would be UTC, which reads as yesterday
// all morning in UTC+ zones and slips every colour threshold a rung.
function daysUntilDue(item: ModuleItem): number {
  const day = 86_400_000;
  const due = Date.parse(item.due_at.slice(0, 10));
  const today = Date.parse(localToday());
  return Math.round((due - today) / day);
}

// Colour a pending row by how close its due date is:
//  • within 1 day / due today / overdue -> bright red
//  • within 3 days                      -> dark red
//  • within a week                      -> orange
function dueClass(item: ModuleItem): string {
  if (item.completed) return "";
  const d = daysUntilDue(item);
  if (d <= 1) return "mp-due-dday";
  if (d <= 3) return "mp-due-3d";
  if (d <= 7) return "mp-due-week";
  return "";
}

// Centred modal shell over a dimmed backdrop. Esc, backdrop-click and the ×
// button all close it.
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-head">
          <h3>{title}</h3>
          <button type="button" className="btn mp-modal-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlannerRow({
  item,
  moduleName,
  showModuleTag,
  showDoneDate,
  onEdit,
  onToggle,
}: {
  item: ModuleItem;
  moduleName: string;
  showModuleTag: boolean;
  showDoneDate?: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <li
      id={`mp-item-${item.id}`}
      className={["mp-row", item.completed ? "mp-row-done" : "", dueClass(item)].filter(Boolean).join(" ")}
    >
      <div className="mp-row-main">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={onToggle}
          aria-label={item.completed ? "Mark not done" : "Mark done"}
        />
        <span className={`mp-kind mp-kind-${item.kind}`}>{KIND_LABEL[item.kind]}</span>
        {showModuleTag && <span className="mp-mod">{moduleName}</span>}
        <span className="mp-title">{item.title}</span>
        {item.weight && <span className="mp-weight">{item.weight}</span>}
        {showDoneDate ? (
          <span className="mp-done-date">done {item.updated_at}</span>
        ) : (
          <>
            <span className="mp-due">{item.due_at.replace("T", " ")}</span>
            {!item.completed && <span className="mp-timeleft">{deadlineLabel(item.due_at)}</span>}
          </>
        )}
        <span className="mp-actions">
          <button type="button" className="btn" onClick={onEdit}>Edit</button>
        </span>
      </div>
      {item.description && <p className="mp-desc">{item.description}</p>}
      {item.links.length > 0 && (
        <div className="mp-link-chips">
          {item.links.map((l, i) => (
            <a key={i} className="mp-chip" href={l.url} target="_blank" rel="noopener noreferrer">{l.label || l.url}</a>
          ))}
        </div>
      )}
    </li>
  );
}

// The row's Edit action opens this: the item form plus a Delete control,
// together in one modal. Nothing edit/delete-related shows on the row itself.
function EditItemModal({
  item,
  confirmingDelete,
  onClose,
  onSave,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  item: ModuleItem;
  confirmingDelete: boolean;
  onClose: () => void;
  onSave: (d: ItemDraft) => Promise<void>;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <Modal title={`Edit — ${item.title}`} onClose={onClose}>
      <ItemForm initial={draftFrom(item)} submitLabel="Save changes" onCancel={onClose} onSubmit={onSave} />
      <div className="mp-modal-danger">
        {confirmingDelete ? (
          <>
            <span className="mp-confirm">Delete this item?</span>
            <button type="button" className="btn btn-danger" onClick={onConfirmDelete}>Yes, delete</button>
            <button type="button" className="btn" onClick={onCancelDelete}>Cancel</button>
          </>
        ) : (
          <button type="button" className="btn btn-danger" onClick={onAskDelete}>Delete item</button>
        )}
      </div>
    </Modal>
  );
}

function ItemForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
  modules,
}: {
  initial: ItemDraft;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (d: ItemDraft) => Promise<void>;
  // When supplied, the form shows a Module picker (used by the top-level
  // "+ Add task" button, which has no per-module context to inherit).
  modules?: Module[];
}) {
  const [draft, setDraft] = useState<ItemDraft>(initial);
  const [error, setError] = useState("");
  const set = <K extends keyof ItemDraft>(k: K, v: ItemDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form
      className="form mp-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!draft.title.trim()) return setError("Title is required.");
        if (!draft.dueDate) return setError("Due date is required.");
        try {
          await onSubmit(draft);
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <div className="mp-form-row">
        {modules && modules.length > 0 && (
          <label>
            Module
            <select value={draft.course} onChange={(e) => set("course", e.target.value)}>
              {modules.map((m) => (
                <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Kind
          <select value={draft.kind} onChange={(e) => set("kind", e.target.value as ModuleItemKind)}>
            {MODULE_ITEM_KINDS.map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
        </label>
        <label>
          Weight (optional)
          <input type="text" value={draft.weight} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 20%" />
        </label>
        <label>
          Due date
          <input type="date" value={draft.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </label>
        <label>
          Time (optional)
          <input type="time" value={draft.dueTime} onChange={(e) => set("dueTime", e.target.value)} />
        </label>
      </div>
      <label>
        Title
        <input type="text" value={draft.title} onChange={(e) => set("title", e.target.value)} autoFocus placeholder="e.g. Group Project — Source Code & Report" />
      </label>
      <label>
        Description
        <textarea rows={3} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this task, task split, notes…" />
      </label>
      <div className="mp-links">
        <span className="mp-links-head">Links</span>
        {draft.links.map((lnk, i) => (
          <div className="mp-link-row" key={i}>
            <input
              type="text"
              placeholder="Label"
              value={lnk.label}
              onChange={(e) => set("links", draft.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))}
            />
            <input
              type="url"
              placeholder="https://…"
              value={lnk.url}
              onChange={(e) => set("links", draft.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))}
            />
            <button type="button" className="btn" onClick={() => set("links", draft.links.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => set("links", [...draft.links, { label: "", url: "" }])}>+ Add link</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function ModulePlanner({
  openItemId,
  onOpened,
}: {
  openItemId?: number | null;
  onOpened?: () => void;
}) {
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState<string | null>(null);
  const [addingGlobal, setAddingGlobal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [addingModule, setAddingModule] = useState(false);
  const [renamingModule, setRenamingModule] = useState<string | null>(null);
  const [confirmDeleteModule, setConfirmDeleteModule] = useState<string | null>(null);
  const [showHiddenModules, setShowHiddenModules] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("modulePlanner.collapsed") ?? "{}");
    } catch {
      return {};
    }
  });
  // Read a persisted enum, falling back if the stored value isn't a known one
  // (stale key, hand-edited storage) — an unrecognised sort/filter otherwise
  // wedges the view with every row hidden or an undefined comparator.
  const readEnum = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    try {
      const v = localStorage.getItem(key);
      return v != null && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    readEnum("modulePlanner.view", ["grouped", "flat"], "grouped"),
  );
  const [sortKey, setSortKey] = useState<SortKey>(() =>
    readEnum("modulePlanner.sort", ["due-asc", "due-desc", "module", "kind"], "due-asc"),
  );
  const [kindFilter, setKindFilter] = useState<KindFilter>(() =>
    readEnum("modulePlanner.kind", ["all", ...MODULE_ITEM_KINDS], "all"),
  );
  useEffect(() => { try { localStorage.setItem("modulePlanner.view", viewMode); } catch { /* ignore */ } }, [viewMode]);
  useEffect(() => { try { localStorage.setItem("modulePlanner.sort", sortKey); } catch { /* ignore */ } }, [sortKey]);
  useEffect(() => { try { localStorage.setItem("modulePlanner.kind", kindFilter); } catch { /* ignore */ } }, [kindFilter]);

  const refresh = () => {
    setError(null);
    return Promise.all([api.list(), api.modules()])
      .then(([list, mods]) => {
        setItems(list);
        setModules(mods);
      })
      .catch((err) => setError(errorMessage(err)));
  };
  // Item-only refresh for hot interactions (tick on/off) that can't change modules.
  const refreshItems = () => {
    setError(null);
    return api.list().then(setItems).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (openItemId == null) return;
    const target = items.find((it) => it.id === openItemId);
    if (!target) return; // items not loaded yet — a later `items` change re-runs this

    // The row has to be rendered before we can scroll to it: expand its group and
    // drop a flat-view kind filter that would hide it.
    if (collapsed[target.course]) setCollapsed((c) => ({ ...c, [target.course]: false }));
    if (viewMode === "flat" && kindFilter !== "all" && kindFilter !== target.kind) {
      setKindFilter("all");
    }

    const el = document.getElementById(`mp-item-${openItemId}`);
    if (el) {
      // A scroll handler elsewhere cancels in-progress smooth scrolls, so jump
      // straight to the item rather than asking for `behavior: "smooth"`.
      el.scrollIntoView({ block: "center" });
      el.classList.add("mp-flash");
      const t = setTimeout(() => el.classList.remove("mp-flash"), 1600);
      onOpened?.();
      return () => clearTimeout(t);
    }

    // Not in the DOM. A state change above will re-run this effect and hit the
    // branch above; but an item in a hidden module never surfaces, so clear the
    // pending link after a beat rather than letting it dangle.
    const t = setTimeout(() => onOpened?.(), 500);
    return () => clearTimeout(t);
  }, [openItemId, items, onOpened, collapsed, kindFilter, viewMode]);

  const toggleCollapse = (code: string) => {
    setCollapsed((c) => {
      const next = { ...c, [code]: !c[code] };
      try {
        localStorage.setItem("modulePlanner.collapsed", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const visibleModules = useMemo(
    () => modules.filter((m) => !m.hidden).sort((a, b) => a.sort_order - b.sort_order),
    [modules],
  );
  const hiddenModules = useMemo(() => modules.filter((m) => m.hidden), [modules]);
  const nameOf = (code: string) => modules.find((m) => m.code === code)?.name ?? code;

  // Ticked-off items leave the active lists entirely and collect in one
  // "Completed" history section at the bottom, newest first.
  const byCourse = useMemo(() => {
    const map: Record<string, ModuleItem[]> = {};
    for (const m of visibleModules) map[m.code] = [];
    for (const item of items) if (!item.completed) (map[item.course] ??= []).push(item);
    return map;
  }, [items, visibleModules]);

  const orderOf = (code: string) => {
    const i = visibleModules.findIndex((m) => m.code === code);
    return i === -1 ? 999 : i;
  };

  const flatItems = useMemo(() => {
    const byDue = (a: ModuleItem, b: ModuleItem) => a.due_at.localeCompare(b.due_at) || a.id - b.id;
    const visibleCodes = new Set(visibleModules.map((m) => m.code));
    return items
      .filter((it) => !it.completed && visibleCodes.has(it.course))
      .filter((it) => kindFilter === "all" || it.kind === kindFilter)
      .sort((a, b) => {
        switch (sortKey) {
          case "due-asc": return byDue(a, b);
          case "due-desc": return -byDue(a, b);
          case "module": return orderOf(a.course) - orderOf(b.course) || byDue(a, b);
          case "kind": return a.kind.localeCompare(b.kind) || byDue(a, b);
        }
      });
  }, [items, sortKey, kindFilter, visibleModules]);

  const completedItems = useMemo(() => {
    const visibleCodes = new Set(visibleModules.map((m) => m.code));
    return items
      .filter((it) => it.completed && visibleCodes.has(it.course))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id);
  }, [items, visibleModules]);

  const activeCount = useMemo(() => {
    const visibleCodes = new Set(visibleModules.map((m) => m.code));
    return items.filter((it) => !it.completed && visibleCodes.has(it.course)).length;
  }, [items, visibleModules]);

  const closeEdit = () => { setEditingId(null); setConfirmingDelete(null); };

  const rowProps = (item: ModuleItem) => ({
    onEdit: () => { setEditingId(item.id); setAddingCourse(null); setConfirmingDelete(null); },
    onToggle: () => api.toggle(item.id).then(refreshItems).catch((e) => setError(errorMessage(e))),
  });

  const editingItem = editingId == null ? null : items.find((it) => it.id === editingId) ?? null;

  return (
    <section className="board mp-board" aria-label="Module planner">
      <div className="section-head">
        <h2>Module planner</h2>
        <span className="board-count">{activeCount}</span>
      </div>
      <p className="rule-note">
        Assignments, presentations, vivas and quizzes per unit. Rows turn orange a week before an item is
        due, dark red at three days, and bright red on the final day.
      </p>
      {error && <p className="form-error">{error}</p>}

      <div className="mp-view-toggle" role="tablist" aria-label="Planner view">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "grouped"}
          className={viewMode === "grouped" ? "mp-tab mp-tab-active" : "mp-tab"}
          onClick={() => setViewMode("grouped")}
        >
          By module
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "flat"}
          className={viewMode === "flat" ? "mp-tab mp-tab-active" : "mp-tab"}
          onClick={() => setViewMode("flat")}
        >
          All tasks
        </button>
      </div>

      <div className="btn-row mp-add-task">
        <button
          type="button"
          className="btn btn-primary"
          disabled={visibleModules.length === 0}
          title={visibleModules.length === 0 ? "Add a module first" : "Add an assignment, presentation, viva or quiz"}
          onClick={() => { setAddingGlobal(true); setAddingCourse(null); closeEdit(); }}
        >
          + Add task
        </button>
      </div>

      {viewMode === "flat" && (
        <div className="mp-flat-controls">
          <label>
            Sort
            <select className="mp-select" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="due-asc">Deadline — earliest first</option>
              <option value="due-desc">Deadline — latest first</option>
              <option value="module">Module</option>
              <option value="kind">Type</option>
            </select>
          </label>
          <label>
            Type
            <select className="mp-select" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as KindFilter)}>
              <option value="all">All types</option>
              {MODULE_ITEM_KINDS.map((k) => (
                <option key={k} value={k}>{KIND_LABEL[k]}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {viewMode === "grouped" && (
        <div className="btn-row mp-module-tools">
          <button type="button" className="btn" onClick={() => setAddingModule(true)}>+ New module</button>
          {hiddenModules.length > 0 && (
            <button type="button" className="btn" onClick={() => setShowHiddenModules((v) => !v)}>
              {showHiddenModules ? "Hide" : "Show"} hidden modules ({hiddenModules.length})
            </button>
          )}
        </div>
      )}

      {viewMode === "grouped" &&
        visibleModules.map((m) => {
          const code = m.code;
          const list = byCourse[code] ?? [];
          const isCollapsed = collapsed[code];
          return (
            <div className="mp-course" key={code}>
              <div className="mp-course-head">
                <button type="button" className="mp-course-toggle" onClick={() => toggleCollapse(code)}>
                  {isCollapsed ? "▸" : "▾"} {nameOf(code)} <span className="mp-course-code">{code}</span>
                  <span className="mp-course-count">{list.length}</span>
                </button>
                {renamingModule === code ? (
                  <input
                    className="mp-module-rename"
                    defaultValue={nameOf(code)}
                    autoFocus
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      setRenamingModule(null);
                      if (v && v !== nameOf(code))
                        api.renameModule(code, v).then(refresh).catch((err) => setError(errorMessage(err)));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") setRenamingModule(null);
                    }}
                  />
                ) : (
                  <button type="button" className="btn" title="Rename module" onClick={() => setRenamingModule(code)}>✎</button>
                )}
                <button
                  type="button"
                  className="btn"
                  title="Hide module"
                  onClick={() => api.setModuleHidden(code, true).then(refresh).catch((err) => setError(errorMessage(err)))}
                >
                  Hide
                </button>
                <button type="button" className="btn" onClick={() => { setAddingCourse(code); closeEdit(); }}>+ Add</button>
              </div>

              {!isCollapsed &&
                (list.length === 0 ? (
                  <p className="board-empty">No items yet — add your first assignment, presentation, or viva.</p>
                ) : (
                  <ul className="board-rows">
                    {list.map((item) => (
                      <PlannerRow key={item.id} item={item} moduleName={nameOf(code)} showModuleTag={false} {...rowProps(item)} />
                    ))}
                  </ul>
                ))}
            </div>
          );
        })}

      {viewMode === "grouped" && showHiddenModules &&
        hiddenModules.map((m) => (
          <div className="mp-course mp-course-hidden" key={m.code}>
            <div className="mp-course-head">
              <span>{m.name} <span className="mp-course-code">{m.code}</span></span>
              <button
                type="button"
                className="btn"
                onClick={() => api.setModuleHidden(m.code, false).then(refresh).catch((err) => setError(errorMessage(err)))}
              >
                Unhide
              </button>
              {confirmDeleteModule === m.code ? (
                <>
                  <span className="mp-confirm">Delete module &amp; its items?</span>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() =>
                      api
                        .deleteModule(m.code, true)
                        .then(() => { setConfirmDeleteModule(null); return refresh(); })
                        .catch((err) => setError(errorMessage(err)))
                    }
                  >
                    Yes
                  </button>
                  <button type="button" className="btn" onClick={() => setConfirmDeleteModule(null)}>No</button>
                </>
              ) : (
                <button type="button" className="btn btn-danger" onClick={() => setConfirmDeleteModule(m.code)}>Delete</button>
              )}
            </div>
          </div>
        ))}

      {viewMode === "flat" &&
        (flatItems.length === 0 ? (
          <p className="board-empty">Nothing matches this filter.</p>
        ) : (
          <ul className="board-rows mp-flat-list">
            {flatItems.map((item) => (
              <PlannerRow key={item.id} item={item} moduleName={nameOf(item.course)} showModuleTag {...rowProps(item)} />
            ))}
          </ul>
        ))}

      {completedItems.length > 0 && (
        <details className="mp-completed" open>
          <summary>
            Completed <span className="mp-completed-count">{completedItems.length}</span>
          </summary>
          <ul className="board-rows">
            {completedItems.map((item) => (
              <PlannerRow
                key={item.id}
                item={item}
                moduleName={nameOf(item.course)}
                showModuleTag
                showDoneDate
                {...rowProps(item)}
              />
            ))}
          </ul>
        </details>
      )}

      {addingModule && (
        <Modal title="New module" onClose={() => setAddingModule(false)}>
          <form
            className="form mp-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const code = (f.elements.namedItem("code") as HTMLInputElement).value.trim();
              const name = (f.elements.namedItem("name") as HTMLInputElement).value.trim();
              api
                .createModule(code, name)
                .then(() => { setAddingModule(false); return refresh(); })
                .catch((err) => setError(errorMessage(err)));
            }}
          >
            <div className="mp-form-row">
              <label>Code<input name="code" placeholder="e.g. INFO5993" autoFocus /></label>
              <label>Name<input name="name" placeholder="Full module name" /></label>
            </div>
            <div className="btn-row">
              <button type="submit" className="btn btn-primary">Add module</button>
              <button type="button" className="btn" onClick={() => setAddingModule(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {addingGlobal && visibleModules.length > 0 && (
        <Modal title="New task" onClose={() => setAddingGlobal(false)}>
          <ItemForm
            initial={emptyDraft(visibleModules[0]!.code)}
            modules={visibleModules}
            submitLabel="Add task"
            onCancel={() => setAddingGlobal(false)}
            onSubmit={async (d) => {
              await api.create(d);
              setAddingGlobal(false);
              await refresh();
            }}
          />
        </Modal>
      )}

      {addingCourse && (
        <Modal title={`Add to ${nameOf(addingCourse)}`} onClose={() => setAddingCourse(null)}>
          <ItemForm
            initial={emptyDraft(addingCourse)}
            submitLabel="Add item"
            onCancel={() => setAddingCourse(null)}
            onSubmit={async (d) => {
              await api.create(d);
              setAddingCourse(null);
              await refresh();
            }}
          />
        </Modal>
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          confirmingDelete={confirmingDelete === editingItem.id}
          onClose={closeEdit}
          onSave={async (d) => {
            await api.update(editingItem.id, d);
            closeEdit();
            await refresh();
          }}
          onAskDelete={() => setConfirmingDelete(editingItem.id)}
          onCancelDelete={() => setConfirmingDelete(null)}
          onConfirmDelete={() =>
            api
              .remove(editingItem.id)
              .then(() => { closeEdit(); return refresh(); })
              .catch((e) => setError(errorMessage(e)))
          }
        />
      )}
    </section>
  );
}
