import React, { useEffect, useMemo, useState } from "react";
import type { Job, JobAction, JobKind } from "./db";
import { ROLE_STATUSES as ROLE_STATUSES_RO, STARTUP_STATUSES as STARTUP_STATUSES_RO, PRIORITIES as PRIORITIES_RO } from "./db";
import { localToday, addDays } from "../shared/scheduling";
import "./jobs.css";

// db.ts only imports *types* from bun:sqlite, so its constants are safe to
// share with the browser bundle.
const ROLE_STATUSES: string[] = [...ROLE_STATUSES_RO];
const STARTUP_STATUSES: string[] = [...STARTUP_STATUSES_RO];
const PRIORITIES: string[] = [...PRIORITIES_RO];
const ACTIVE = new Set(["Applied", "OA", "Interview", "Contacted", "Replied"]);
const statusesFor = (kind: JobKind) => (kind === "startup" ? STARTUP_STATUSES : ROLE_STATUSES);

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}
const errorMessage = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong.");
const send = (url: string, method: string, body?: unknown) =>
  fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const api = {
  list: () => fetch("/api/jobs").then((r) => json<Job[]>(r)),
  actions: () => fetch("/api/jobs/actions").then((r) => json<JobAction[]>(r)),
  create: (body: Partial<Job>) => send("/api/jobs", "POST", body).then((r) => json<Job>(r)),
  update: (id: number, body: Partial<Job>) => send(`/api/jobs/${id}`, "PUT", body).then((r) => json<Job>(r)),
  applied: (id: number) => send(`/api/jobs/${id}/applied`, "POST").then((r) => json<Job>(r)),
  remove: (id: number) => send(`/api/jobs/${id}`, "DELETE").then((r) => json<{ ok: true }>(r)),
};

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

function statusTone(status: string): string {
  if (status === "Offer") return "green";
  if (status === "Interview" || status === "OA" || status === "Replied") return "accent";
  if (status === "Applied" || status === "Contacted") return "gold";
  if (status === "Rejected" || status === "No reply") return "red";
  if (status === "To apply") return "text";
  return "dim";
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="jobs-pill" style={{ "--tone": `var(--${statusTone(status)})` } as React.CSSProperties}>
      {status}
    </span>
  );
}

type View = "pipeline" | "toapply" | "startups" | "email";

// ---------- editor ----------
type Field = {
  key: keyof Job;
  label: string;
  type?: "text" | "date" | "url" | "textarea" | "select";
  options?: string[];
  wide?: boolean;
};

function fieldsFor(kind: JobKind): Field[] {
  if (kind === "startup") {
    return [
      { key: "company", label: "Company" },
      { key: "status", label: "Status", type: "select", options: STARTUP_STATUSES },
      { key: "about", label: "What they do", wide: true },
      { key: "role", label: "Role / what to ask for", wide: true },
      { key: "link", label: "Link", type: "url", wide: true },
      { key: "applied_on", label: "First contacted", type: "date" },
      { key: "last_update", label: "Last update", type: "date" },
      { key: "next_action", label: "Next action" },
      { key: "next_action_due", label: "Next action date", type: "date" },
      { key: "notes", label: "Why / how / notes", type: "textarea", wide: true },
    ];
  }
  return [
    { key: "company", label: "Company" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", type: "select", options: ROLE_STATUSES },
    { key: "priority", label: "Priority", type: "select", options: ["", ...PRIORITIES] },
    { key: "job_type", label: "Full / part-time" },
    { key: "intl_ok", label: "International students OK?" },
    { key: "closes_on", label: "Applications close", type: "date" },
    { key: "applied_on", label: "Applied on", type: "date" },
    { key: "last_update", label: "Last update", type: "date" },
    { key: "cycle", label: "Cycle" },
    { key: "link", label: "Link", type: "url", wide: true },
    { key: "next_action", label: "Next action" },
    { key: "next_action_due", label: "Next action date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", wide: true },
  ];
}

function JobEditor({
  job,
  kind,
  onClose,
  onSaved,
}: {
  job: Job | null;
  kind: JobKind;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const fields = fieldsFor(kind);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = job ? String(job[f.key] ?? "") : "";
    if (!job) init.status = kind === "startup" ? "Not started" : "To apply";
    return init;
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.company?.trim()) return setError("Company is required.");
    try {
      if (job) await api.update(job.id, values as Partial<Job>);
      else await api.create({ ...(values as Partial<Job>), kind });
      await onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!job || !confirm(`Delete ${job.company}?`)) return;
    try {
      await api.remove(job.id);
      await onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel jobs-editor" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{job ? job.company : kind === "startup" ? "Add startup" : "Add role"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="form jobs-form" onSubmit={save}>
          {fields.map((f) => (
            <label key={f.key} className={f.wide ? "jobs-wide" : undefined}>
              {f.label}
              {f.type === "select" ? (
                <select value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}>
                  {f.options!.map((o) => (
                    <option key={o} value={o}>{o || "—"}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              ) : (
                <input
                  type={f.type ?? "text"}
                  value={values[f.key]}
                  autoFocus={f.key === "company" && !job}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
          {error && <p className="form-error jobs-wide">{error}</p>}
          <div className="btn-row jobs-wide">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <span className="btn-spacer" />
            {job && (
              <button type="button" className="btn btn-danger" onClick={remove}>Delete</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- next actions ----------
function ActionBoard({
  actions,
  today,
  onDone,
  onOpen,
}: {
  actions: JobAction[];
  today: string;
  onDone: (job: Job) => void;
  onOpen: (job: Job) => void;
}) {
  const horizon = addDays(today, 14);
  const soon = actions.filter((a) => a.dueDate <= horizon);
  return (
    <section className="board" aria-label="Job next actions">
      <div className="section-head">
        <h2>Next actions</h2>
        <span className="board-count">{soon.length}</span>
      </div>
      {soon.length === 0 ? (
        <p className="board-empty">Nothing due in the next two weeks.</p>
      ) : (
        <ul className="board-rows">
          {soon.map(({ job, action, dueDate }, i) => {
            const late = daysBetween(dueDate, today);
            const color = late > 0 ? "red" : late === 0 ? "gold" : "green";
            const canMarkSent = job.status === "To apply" || job.status === "Not started";
            return (
              <li key={job.id} style={{ animationDelay: `${i * 40}ms` }}>
                <div className="board-row board-row-main" style={{ "--urgency": `var(--${color})` } as React.CSSProperties}>
                  <span className="tag">{late > 0 ? `${late}d late` : late === 0 ? "today" : `in ${-late}d`}</span>
                  <button className="board-title jobs-link-btn" onClick={() => onOpen(job)} title="Edit">
                    <strong>{job.company}</strong> — {action}
                    {job.role && <span className="jobs-dim"> · {job.role}</span>}
                  </button>
                  {job.link && (
                    <a className="board-row-review" href={job.link} target="_blank" rel="noopener noreferrer" title="Open link">↗</a>
                  )}
                  {canMarkSent ? (
                    <button className="btn btn-primary" onClick={() => onDone(job)}>
                      {job.kind === "startup" ? "Messaged" : "Applied"}
                    </button>
                  ) : (
                    <button className="btn" onClick={() => onOpen(job)}>Update</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ---------- table ----------
function JobTable({
  jobs,
  kind,
  statuses,
  defaultFilter,
  columns,
  onOpen,
  onStatus,
  onAdd,
}: {
  jobs: Job[];
  kind: JobKind;
  statuses: string[];
  defaultFilter: string;
  columns: { label: string; render: (j: Job) => React.ReactNode; sort?: (j: Job) => string | number; className?: string }[];
  onOpen: (job: Job) => void;
  onStatus: (job: Job, status: string) => void;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(defaultFilter);
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [dir, setDir] = useState(1);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    let out = jobs.filter(
      (j) =>
        (!filter || j.status === filter) &&
        (!q || [j.company, j.role, j.notes, j.about, j.next_action].join(" ").toLowerCase().includes(q)),
    );
    const sorter = sortIdx != null ? columns[sortIdx]?.sort : undefined;
    if (sorter) {
      out = [...out].sort((a, b) => {
        const va = sorter(a), vb = sorter(b);
        if (va === "" || va == null) return 1;
        if (vb === "" || vb == null) return -1;
        return (va > vb ? 1 : va < vb ? -1 : 0) * dir;
      });
    }
    return out;
  }, [jobs, query, filter, sortIdx, dir, columns]);

  return (
    <section className="board">
      <div className="jobs-toolbar">
        <input type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={onAdd}>+ Add {kind === "startup" ? "startup" : "role"}</button>
        <span className="jobs-dim jobs-count">{rows.length} of {jobs.length}</span>
      </div>
      <div className="jobs-table-wrap">
        <table className="jobs-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.label}
                  className={c.sort ? "jobs-sortable" : undefined}
                  onClick={() => {
                    if (!c.sort) return;
                    if (sortIdx === i) setDir(-dir);
                    else { setSortIdx(i); setDir(1); }
                  }}
                >
                  {c.label} {sortIdx === i ? (dir > 0 ? "▲" : "▼") : ""}
                </th>
              ))}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="board-empty">No rows match.</td></tr>
            ) : (
              rows.map((j) => (
                <tr key={j.id} onClick={(e) => { if (!(e.target as HTMLElement).closest("a,select,button")) onOpen(j); }}>
                  {columns.map((c) => (
                    <td key={c.label} className={c.className}>{c.render(j)}</td>
                  ))}
                  <td>
                    <select
                      className="jobs-status-select"
                      style={{ "--tone": `var(--${statusTone(j.status)})` } as React.CSSProperties}
                      value={j.status}
                      onChange={(e) => onStatus(j, e.target.value)}
                    >
                      {statusesFor(j.kind).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const link = (j: Job, text = "↗") =>
  j.link ? <a href={j.link} target="_blank" rel="noopener noreferrer">{text}</a> : null;

// ---------- cold email ----------
const EMAIL_VARS = [
  ["Company", "Lorikeet"],
  ["Name", "first name"],
  ["Hook", "your recent raise / a launch"],
  ["Project", "1-line project + result, with link"],
  ["Stack", "Python / Java / TypeScript"],
  ["Links", "LinkedIn | GitHub"],
] as const;
const EMAIL_TEMPLATE = `Subject: USYD Master of CS student – summer intern for {Company}?

Hi {Name},

I'm Adam, a Master of Computer Science student at the University of Sydney. I've been following {Company} since {Hook}.

I'm free full-time from late Nov 2026 to Feb 2027 and would love to join as a summer engineering intern.

Recently I built {Project}. I work in {Stack} and can ship fast.

Could I have 15 minutes to show you what I'd build in 10 weeks at {Company}?

Thanks,
Adam Lim
{Links}`;

function ColdEmail() {
  const [vars, setVars] = useState<Record<string, string>>({});
  const text = EMAIL_VARS.reduce(
    (t, [k]) => t.replaceAll(`{${k}}`, vars[k]?.trim() || `<${k}>`),
    EMAIL_TEMPLATE,
  );
  const [copied, setCopied] = useState(false);
  return (
    <section className="board">
      <div className="section-head">
        <h2>Cold message for startups</h2>
        <button
          className="btn btn-primary"
          onClick={() =>
            navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            })
          }
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <div className="jobs-email-vars">
        {EMAIL_VARS.map(([k, ph]) => (
          <input key={k} placeholder={`${k}: ${ph}`} value={vars[k] ?? ""} onChange={(e) => setVars({ ...vars, [k]: e.target.value })} />
        ))}
      </div>
      <pre className="jobs-email">{text}</pre>
      <ul className="jobs-tips">
        <li>Message an engineer or founder, not a generic careers inbox.</li>
        <li>Mention one real detail about their product — it shows you did your homework.</li>
        <li>Follow up once after about a week (the Next actions list reminds you), then move on.</li>
        <li>Aim for 5 messages a day. Hit “Messaged” on the startup so the follow-up clock starts.</li>
        <li>On a student visa you can work unlimited hours in the official uni break — say so.</li>
      </ul>
    </section>
  );
}

// ---------- app ----------
export default function JobsApp({
  openJobId,
  onOpened,
}: {
  openJobId?: number | null;
  onOpened?: () => void;
} = {}) {
  const today = localToday();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [actions, setActions] = useState<JobAction[]>([]);
  const [view, setView] = useState<View>("pipeline");
  const [editing, setEditing] = useState<{ job: Job | null; kind: JobKind } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () =>
    Promise.all([api.list(), api.actions()])
      .then(([j, a]) => {
        setJobs(j);
        setActions(a);
      })
      .catch((err) => setError(errorMessage(err)));

  useEffect(() => {
    refresh();
  }, []);

  // Deep link from Home: open that row's editor once data has loaded.
  useEffect(() => {
    if (openJobId == null || jobs.length === 0) return;
    const job = jobs.find((j) => j.id === openJobId);
    if (job) {
      setView(job.kind === "startup" ? "startups" : job.status === "To apply" ? "toapply" : "pipeline");
      setEditing({ job, kind: job.kind });
    }
    onOpened?.();
  }, [openJobId, jobs.length]);

  const run = (p: Promise<unknown>) => {
    setError(null);
    p.then(refresh).catch((err) => setError(errorMessage(err)));
  };

  const roles = jobs.filter((j) => j.kind === "role");
  const pipeline = roles.filter((j) => j.status !== "To apply" && j.status !== "Skipped");
  const toApply = roles.filter((j) => j.status === "To apply" || j.status === "Skipped");
  const startups = jobs.filter((j) => j.kind === "startup");
  const count = (s: string) => roles.filter((j) => j.status === s).length;

  const stats = [
    { label: "Applications", value: pipeline.length, cls: "stat-total" },
    { label: "Still in play", value: roles.filter((j) => ACTIVE.has(j.status)).length, cls: "stat-due" },
    { label: "OA / interview", value: count("OA") + count("Interview"), cls: "stat-completed" },
    { label: "Offers", value: count("Offer"), cls: "stat-completed" },
    { label: "To apply", value: roles.filter((j) => j.status === "To apply").length, cls: "stat-overdue" },
    { label: "Startups contacted", value: `${startups.filter((j) => j.status !== "Not started").length}/${startups.length}`, cls: "stat-total" },
  ];

  const onStatus = (job: Job, status: string) => run(api.update(job.id, { status }));
  const open = (job: Job) => setEditing({ job, kind: job.kind });

  const dateCell = (d: string | null) => <span className="jobs-date">{d ?? "—"}</span>;

  return (
    <div className="jobs">
      <div className="stats jobs-stats">
        {stats.map((s) => (
          <div key={s.label} className={`stat ${s.cls}`}>
            <span className="stat-num">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}

      <ActionBoard actions={actions} today={today} onOpen={open} onDone={(j) => run(api.applied(j.id))} />

      <nav className="jobs-views" aria-label="Job views">
        {([
          ["pipeline", `Applications (${pipeline.length})`],
          ["toapply", `To apply (${toApply.filter((j) => j.status === "To apply").length})`],
          ["startups", `Startups (${startups.length})`],
          ["email", "Cold email"],
        ] as [View, string][]).map(([v, label]) => (
          <button key={v} className={view === v ? "jobs-view jobs-view-active" : "jobs-view"} onClick={() => setView(v)}>
            {label}
          </button>
        ))}
      </nav>

      {view === "pipeline" && (
        <JobTable
          key="pipeline"
          jobs={pipeline}
          kind="role"
          statuses={ROLE_STATUSES.filter((s) => s !== "To apply" && s !== "Skipped")}
          defaultFilter=""
          onOpen={open}
          onStatus={onStatus}
          onAdd={() => setEditing({ job: null, kind: "role" })}
          columns={[
            { label: "Company", render: (j) => <strong>{j.company}</strong>, sort: (j) => j.company.toLowerCase() },
            { label: "Role", render: (j) => j.role, className: "jobs-role" },
            { label: "Applied", render: (j) => dateCell(j.applied_on), sort: (j) => j.applied_on ?? "" },
            { label: "Last update", render: (j) => dateCell(j.last_update), sort: (j) => j.last_update ?? "" },
            { label: "Next action", render: (j) => <span className="jobs-dim">{j.next_action}</span>, className: "jobs-notes" },
            { label: "", render: (j) => link(j) },
          ]}
        />
      )}
      {view === "toapply" && (
        <JobTable
          key="toapply"
          jobs={toApply}
          kind="role"
          statuses={["To apply", "Skipped"]}
          defaultFilter="To apply"
          onOpen={open}
          onStatus={onStatus}
          onAdd={() => setEditing({ job: null, kind: "role" })}
          columns={[
            { label: "Company", render: (j) => <strong>{j.company}</strong>, sort: (j) => j.company.toLowerCase() },
            { label: "Role", render: (j) => j.role, className: "jobs-role" },
            { label: "Type", render: (j) => j.job_type },
            {
              label: "Closes",
              sort: (j) => j.closes_on ?? "",
              render: (j) => {
                if (!j.closes_on) return <span className="jobs-dim">—</span>;
                const left = daysBetween(today, j.closes_on);
                const tone = left < 0 ? "dim" : left <= 3 ? "red" : left <= 7 ? "gold" : "text";
                return (
                  <span className="jobs-date" style={{ color: `var(--${tone})` }}>
                    {j.closes_on} {left >= 0 ? `(${left}d)` : "(closed)"}
                  </span>
                );
              },
            },
            { label: "Intl?", render: (j) => j.intl_ok },
            { label: "Priority", render: (j) => j.priority, sort: (j) => PRIORITIES.indexOf(j.priority ?? "") + 1 || 9 },
            { label: "Apply", render: (j) => link(j, "Apply ↗") },
            { label: "Notes", render: (j) => <span className="jobs-dim">{j.notes}</span>, className: "jobs-notes" },
          ]}
        />
      )}
      {view === "startups" && (
        <JobTable
          key="startups"
          jobs={startups}
          kind="startup"
          statuses={STARTUP_STATUSES}
          defaultFilter=""
          onOpen={open}
          onStatus={onStatus}
          onAdd={() => setEditing({ job: null, kind: "startup" })}
          columns={[
            { label: "Company", render: (j) => <strong>{j.company}</strong>, sort: (j) => j.company.toLowerCase() },
            { label: "What they do", render: (j) => <span className="jobs-dim">{j.about}</span>, className: "jobs-notes" },
            { label: "Ask", render: (j) => j.role, className: "jobs-role" },
            { label: "Contacted", render: (j) => dateCell(j.applied_on), sort: (j) => j.applied_on ?? "" },
            { label: "", render: (j) => link(j) },
            { label: "Why / how", render: (j) => <span className="jobs-dim">{j.notes}</span>, className: "jobs-notes" },
          ]}
        />
      )}
      {view === "email" && <ColdEmail />}

      {editing && (
        <JobEditor
          job={editing.job}
          kind={editing.kind}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
