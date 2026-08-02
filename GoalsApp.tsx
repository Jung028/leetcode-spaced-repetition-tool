// GoalsApp.tsx
import React, { useEffect, useState } from "react";
import type { Project, ProjectStep, ProjectDetail } from "./goals-db";
import { localToday } from "./scheduling";

type View = { name: "board" } | { name: "add" } | { name: "detail"; projectId: number };

const api = {
  list: () => fetch("/api/goals").then((r) => r.json() as Promise<Project[]>),
  get: (id: number) => fetch(`/api/goals/${id}`).then((r) => r.json() as Promise<ProjectDetail>),
  create: (title: string, deadline: string) =>
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, deadline }),
    }).then((r) => r.json() as Promise<Project>),
  addStep: (projectId: number, label: string, weight: number) =>
    fetch(`/api/goals/${projectId}/steps`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, weight }),
    }).then((r) => r.json() as Promise<ProjectStep>),
  toggleStep: (stepId: number) =>
    fetch(`/api/goals/steps/${stepId}/toggle`, { method: "POST" }).then((r) => r.json() as Promise<ProjectStep>),
  setLink: (id: number, link: string) =>
    fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ link }),
    }).then((r) => r.json() as Promise<Project>),
};

const daysUntil = (deadline: string, today: string) =>
  Math.round((Date.parse(deadline) - Date.parse(today)) / 86_400_000);

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

function ProjectBoard({
  projects,
  today,
  onOpen,
  onAdd,
}: {
  projects: Project[];
  today: string;
  onOpen: (id: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="board" aria-label="Active projects">
      <div className="section-head">
        <h2>Active projects</h2>
        <button className="btn btn-primary" onClick={onAdd}>+ New project</button>
      </div>
      {projects.length === 0 ? (
        <p className="board-empty">No active projects. Start one with "+ New project".</p>
      ) : (
        <ul className="board-rows">
          {projects.map((p, i) => {
            const daysLeft = daysUntil(p.deadline, today);
            const color = daysLeft < 0 ? "red" : daysLeft <= 3 ? "gold" : "green";
            return (
              <li key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
                <div
                  className="board-row"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                >
                  <button className="board-row-main" onClick={() => onOpen(p.id)}>
                    <span className="tag">
                      {daysLeft < 0 ? `${-daysLeft}d late` : daysLeft === 0 ? "today" : `${daysLeft}d left`}
                    </span>
                    <span className="board-title">{p.title}</span>
                    <span className="goal-deadline">{p.deadline}</span>
                  </button>
                  {p.link && (
                    <button
                      className="board-row-review"
                      onClick={() => window.open(p.link!, "_blank", "noopener,noreferrer")}
                      title="Open link"
                      aria-label="Open link"
                    >
                      ↗
                    </button>
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

function NewProjectForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim() || !deadline) {
          setError("Title and deadline are both required.");
          return;
        }
        await api.create(title.trim(), deadline);
        onCreated();
      }}
    >
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Complete tracely onboarding" autoFocus />
      </label>
      <label>
        Deadline
        <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Create project</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function NewStepForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (label: string, weight: number) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const w = Number(weight);
        if (!label.trim() || !Number.isFinite(w) || w <= 0) {
          setError("Label and a positive weight are both required.");
          return;
        }
        await onCreated(label.trim(), w);
        setLabel("");
        setWeight("");
        setError("");
      }}
    >
      <label>
        Step
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Complete signup page" autoFocus />
      </label>
      <label>
        Weight (%)
        <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="20" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">+ Add step</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ProjectDetailView({
  projectId,
  today,
  onBack,
  onChanged,
}: {
  projectId: number;
  today: string;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");

  const load = () =>
    api.get(projectId).then((d) => {
      setDetail(d);
      setLinkDraft(d.link ?? "");
    });
  useEffect(() => { load(); }, [projectId]);

  if (!detail) return <p className="board-empty">Loading…</p>;

  const allocated = detail.steps.reduce((sum, s) => sum + s.weight, 0);

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <h2>{detail.title}</h2>
        <span className="tag">{detail.deadline}</span>
      </header>
      <p className="detail-meta">
        <span>{detail.progress}% complete</span>
        <span>
          {allocated}% allocated across {detail.steps.length} step{detail.steps.length === 1 ? "" : "s"}
        </span>
      </p>

      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          const updated = await api.setLink(projectId, linkDraft.trim());
          setDetail((d) => (d ? { ...d, link: updated.link } : d));
        }}
      >
        <label>
          Link
          <input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            type="url"
            placeholder="https://notion.so/..."
          />
        </label>
        <div className="btn-row">
          <button type="submit" className="btn">Save link</button>
          {detail.link && (
            <a className="btn" href={detail.link} target="_blank" rel="noreferrer">
              Open ↗
            </a>
          )}
        </div>
      </form>

      <ul className="board-rows">
        {detail.steps.map((s) => {
          const overdue = s.released && !s.done && s.due_date < today;
          const color = s.done ? "green" : !s.released ? "dim" : overdue ? "red" : "gold";
          const status = s.done
            ? "done"
            : !s.released
            ? "queued"
            : overdue
            ? `${daysBetween(s.due_date, today)}d late`
            : s.due_date === today
            ? "today"
            : "upcoming";
          return (
            <li key={s.id}>
              <label
                className="board-row board-row-main step-row"
                style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
              >
                <input
                  type="checkbox"
                  checked={s.done}
                  disabled={!s.released}
                  onChange={async () => {
                    await api.toggleStep(s.id);
                    await load();
                    onChanged();
                  }}
                />
                <span className="tag">{status}</span>
                <span className="board-title">{s.label}</span>
                <span className="goal-weight">{s.weight}%</span>
                <span className="goal-deadline">{s.released ? s.due_date : "—"}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {addingStep ? (
        <NewStepForm
          onCancel={() => setAddingStep(false)}
          onCreated={async (label, weight) => {
            await api.addStep(projectId, label, weight);
            await load();
          }}
        />
      ) : (
        <div className="btn-row">
          <button className="btn" onClick={() => setAddingStep(true)}>+ Add step</button>
          <span className="btn-spacer" />
          <button className="btn" onClick={onBack}>Back</button>
        </div>
      )}
    </article>
  );
}

export default function GoalsApp({
  openProjectId,
  onOpened,
}: {
  openProjectId?: number | null;
  onOpened?: () => void;
} = {}) {
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = () => api.list().then(setProjects);
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (openProjectId != null) {
      setView({ name: "detail", projectId: openProjectId });
      onOpened?.();
    }
  }, [openProjectId]);

  return (
    <div className="goals">
      {view.name === "board" && (
        <ProjectBoard
          projects={projects}
          today={today}
          onOpen={(projectId) => setView({ name: "detail", projectId })}
          onAdd={() => setView({ name: "add" })}
        />
      )}

      {view.name === "add" && (
        <NewProjectForm
          onCancel={() => setView({ name: "board" })}
          onCreated={async () => {
            await refresh();
            setView({ name: "board" });
          }}
        />
      )}

      {view.name === "detail" && (
        <ProjectDetailView
          projectId={view.projectId}
          today={today}
          onBack={() => setView({ name: "board" })}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
