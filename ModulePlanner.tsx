import React, { useEffect, useMemo, useState } from "react";
import {
  MODULE_ITEM_KINDS,
  type ModuleItem,
  type ModuleItemKind,
  type ModuleItemLink,
} from "./module-items-db";
import { COURSE_NAMES, courseNameFor } from "./semester-deadlines";

const COURSE_CODES = Object.keys(COURSE_NAMES);

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
};

function toPayload(d: ItemDraft) {
  return {
    course: d.course,
    kind: d.kind,
    title: d.title.trim(),
    description: d.description,
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
    dueDate: dueDate!,
    dueTime: dueTime === "23:59" ? "" : dueTime ?? "",
    links: item.links.length ? item.links : [],
  };
}

function emptyDraft(course: string): ItemDraft {
  return { course, kind: "assignment", title: "", description: "", dueDate: "", dueTime: "", links: [] };
}

const KIND_LABEL: Record<ModuleItemKind, string> = {
  assignment: "Assignment",
  presentation: "Presentation",
  viva: "Viva",
  quiz: "Quiz",
  exam: "Exam",
  other: "Other",
};

function ItemForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial: ItemDraft;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (d: ItemDraft) => Promise<void>;
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
        <label>
          Kind
          <select value={draft.kind} onChange={(e) => set("kind", e.target.value as ModuleItemKind)}>
            {MODULE_ITEM_KINDS.map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
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
  const [error, setError] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("modulePlanner.collapsed") ?? "{}");
    } catch {
      return {};
    }
  });

  const refresh = () => {
    setError(null);
    return api.list().then(setItems).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (openItemId == null) return;
    const el = document.getElementById(`mp-item-${openItemId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("mp-flash");
      const t = setTimeout(() => el.classList.remove("mp-flash"), 1600);
      onOpened?.();
      return () => clearTimeout(t);
    }
  }, [openItemId, items, onOpened]);

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

  const byCourse = useMemo(() => {
    const map: Record<string, ModuleItem[]> = {};
    for (const code of COURSE_CODES) map[code] = [];
    for (const item of items) (map[item.course] ??= []).push(item);
    return map;
  }, [items]);

  return (
    <section className="board mp-board" aria-label="Module planner">
      <div className="section-head">
        <h2>Module planner</h2>
        <span className="board-count">{items.length}</span>
      </div>
      <p className="rule-note">Assignments, presentations, vivas and quizzes per unit.</p>
      {error && <p className="form-error">{error}</p>}

      {COURSE_CODES.map((code) => {
        const list = byCourse[code] ?? [];
        const isCollapsed = collapsed[code];
        return (
          <div className="mp-course" key={code}>
            <div className="mp-course-head">
              <button type="button" className="mp-course-toggle" onClick={() => toggleCollapse(code)}>
                {isCollapsed ? "▸" : "▾"} {courseNameFor(code)} <span className="mp-course-code">{code}</span>
                <span className="mp-course-count">{list.length}</span>
              </button>
              <button type="button" className="btn" onClick={() => { setAddingCourse(code); setEditingId(null); }}>+ Add</button>
            </div>

            {!isCollapsed && addingCourse === code && (
              <ItemForm
                initial={emptyDraft(code)}
                submitLabel="Add item"
                onCancel={() => setAddingCourse(null)}
                onSubmit={async (d) => {
                  await api.create(d);
                  setAddingCourse(null);
                  await refresh();
                }}
              />
            )}

            {!isCollapsed && (
              list.length === 0 ? (
                <p className="board-empty">No items yet — add your first assignment, presentation, or viva.</p>
              ) : (
                <ul className="board-rows">
                  {list.map((item) =>
                    editingId === item.id ? (
                      <li key={item.id} id={`mp-item-${item.id}`}>
                        <ItemForm
                          initial={draftFrom(item)}
                          submitLabel="Save changes"
                          onCancel={() => setEditingId(null)}
                          onSubmit={async (d) => {
                            await api.update(item.id, d);
                            setEditingId(null);
                            await refresh();
                          }}
                        />
                      </li>
                    ) : (
                      <li key={item.id} id={`mp-item-${item.id}`} className={item.completed ? "mp-row mp-row-done" : "mp-row"}>
                        <div className="mp-row-main">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => api.toggle(item.id).then(refresh).catch((e) => setError(errorMessage(e)))}
                            aria-label={item.completed ? "Mark not done" : "Mark done"}
                          />
                          <span className={`mp-kind mp-kind-${item.kind}`}>{KIND_LABEL[item.kind]}</span>
                          <span className="mp-title">{item.title}</span>
                          <span className="mp-due">{item.due_at.replace("T", " ")}</span>
                          <span className="mp-actions">
                            <button type="button" className="btn" onClick={() => { setEditingId(item.id); setAddingCourse(null); }}>Edit</button>
                            {confirmingDelete === item.id ? (
                              <>
                                <span className="mp-confirm">Delete?</span>
                                <button type="button" className="btn btn-danger" onClick={() => api.remove(item.id).then(() => { setConfirmingDelete(null); return refresh(); }).catch((e) => setError(errorMessage(e)))}>Yes</button>
                                <button type="button" className="btn" onClick={() => setConfirmingDelete(null)}>No</button>
                              </>
                            ) : (
                              <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(item.id)}>Delete</button>
                            )}
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
                    ),
                  )}
                </ul>
              )
            )}
          </div>
        );
      })}
    </section>
  );
}
