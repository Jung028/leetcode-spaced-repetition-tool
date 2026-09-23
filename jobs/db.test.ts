import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  FOLLOW_UP_STALE_DAYS,
  migrateJobs,
  seedJobsOnce,
  createJob,
  updateJob,
  deleteJob,
  listJobs,
  nextJobAction,
  listJobActions,
  listJobsStartedToday,
  APPLY_LEAD_DAYS,
} from "./db";
import { JOB_SEED } from "./seed";
import { addDays } from "../shared/scheduling";

const TODAY = "2026-09-24";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateJobs(db);
});

test("createJob defaults status by kind", () => {
  expect(createJob(db, { company: "Canva" }, TODAY).status).toBe("To apply");
  expect(createJob(db, { company: "Lorikeet", kind: "startup" }, TODAY).status).toBe("Not started");
});

test("seedJobsOnce imports once and never again, even after rows are deleted", () => {
  expect(seedJobsOnce(db, JOB_SEED, TODAY)).toBe(JOB_SEED.length);
  expect(listJobs(db)).toHaveLength(JOB_SEED.length);
  for (const j of listJobs(db)) deleteJob(db, j.id);
  expect(seedJobsOnce(db, JOB_SEED, TODAY)).toBe(0);
  expect(listJobs(db)).toHaveLength(0);
});

test("every seed row uses a valid status for its kind", () => {
  seedJobsOnce(db, JOB_SEED, TODAY);
  const roleStatuses = new Set(["To apply", "Applied", "OA", "Interview", "Offer", "Rejected", "Skipped", "Not submitted", "Withdrawn"]);
  const startupStatuses = new Set(["Not started", "Contacted", "Replied", "Interview", "Offer", "No reply", "Rejected"]);
  for (const j of listJobs(db)) {
    expect((j.kind === "startup" ? startupStatuses : roleStatuses).has(j.status)).toBe(true);
  }
});

test("moving out of To apply stamps applied_on and last_update", () => {
  const job = createJob(db, { company: "Citadel" }, TODAY);
  const updated = updateJob(db, job.id, { status: "Applied" }, TODAY)!;
  expect(updated.applied_on).toBe(TODAY);
  expect(updated.last_update).toBe(TODAY);
  expect(listJobsStartedToday(db, TODAY).map((j) => j.company)).toEqual(["Citadel"]);
});

test("skipping a role does not count as applying", () => {
  const job = createJob(db, { company: "EY" }, TODAY);
  expect(updateJob(db, job.id, { status: "Skipped" }, TODAY)!.applied_on).toBeNull();
});

test("a status change clears a stale explicit next action date", () => {
  const job = createJob(db, { company: "Open", status: "Interview", next_action: "Email Denise", next_action_due: TODAY }, TODAY);
  expect(updateJob(db, job.id, { status: "Offer" }, TODAY)!.next_action_due).toBeNull();
});

test("nextJobAction: To apply with a closing date is due a few days early", () => {
  const job = createJob(db, { company: "Citadel", closes_on: "2026-09-28" }, TODAY);
  expect(nextJobAction(job, TODAY)).toMatchObject({ action: "Apply — closes 2026-09-28", dueDate: addDays("2026-09-28", -APPLY_LEAD_DAYS) });
});

test("nextJobAction: high priority with no date is due from creation; others wait", () => {
  expect(nextJobAction(createJob(db, { company: "Apple", priority: "High" }, TODAY), TODAY)?.dueDate).toBe(TODAY);
  expect(nextJobAction(createJob(db, { company: "Other", priority: "Low" }, TODAY), TODAY)).toBeNull();
});

test("nextJobAction: follow-up timing by stage, none for finished rows", () => {
  const applied = createJob(db, { company: "A", status: "Applied", last_update: TODAY }, TODAY);
  const interview = createJob(db, { company: "B", status: "Interview", last_update: TODAY }, TODAY);
  const contacted = createJob(db, { company: "C", kind: "startup", status: "Contacted", last_update: TODAY }, TODAY);
  const rejected = createJob(db, { company: "D", status: "Rejected", last_update: TODAY }, TODAY);
  const untouched = createJob(db, { company: "E", kind: "startup" }, TODAY);
  expect(nextJobAction(applied, TODAY)?.dueDate).toBe(addDays(TODAY, 21));
  expect(nextJobAction(interview, TODAY)?.dueDate).toBe(addDays(TODAY, 7));
  expect(nextJobAction(contacted, TODAY)).toMatchObject({ action: "Follow up on your message", dueDate: addDays(TODAY, 7) });
  expect(nextJobAction(rejected, TODAY)).toBeNull();
  expect(nextJobAction(untouched, TODAY)).toBeNull();
});

test("an explicit next action wins over the computed one", () => {
  const job = createJob(db, { company: "Open", status: "Interview", last_update: "2026-06-07", next_action: "Email Denise", next_action_due: TODAY }, TODAY);
  expect(nextJobAction(job, TODAY)).toMatchObject({ action: "Email Denise", dueDate: TODAY });
});

test("listJobActions is sorted by due date", () => {
  createJob(db, { company: "Later", closes_on: "2026-10-30" }, TODAY);
  createJob(db, { company: "Sooner", closes_on: "2026-09-28" }, TODAY);
  expect(listJobActions(db, TODAY).map((a) => a.job.company)).toEqual(["Sooner", "Later"]);
});

test("closed roles and stale follow-ups stop producing actions; explicit ones stay", () => {
  const closed = createJob(db, { company: "IMC", closes_on: "2026-06-30" }, TODAY);
  const stale = createJob(db, { company: "Ghost", status: "Applied", last_update: addDays(TODAY, -(21 + FOLLOW_UP_STALE_DAYS + 1)) }, TODAY);
  const fresh = createJob(db, { company: "Recent", status: "Applied", last_update: addDays(TODAY, -(21 + FOLLOW_UP_STALE_DAYS)) }, TODAY);
  const explicit = createJob(db, { company: "Open", status: "Interview", last_update: "2026-01-01", next_action_due: "2026-02-01" }, TODAY);
  expect(nextJobAction(closed, TODAY)).toBeNull();
  expect(nextJobAction(stale, TODAY)).toBeNull();
  expect(nextJobAction(fresh, TODAY)).not.toBeNull();
  expect(nextJobAction(explicit, TODAY)?.dueDate).toBe("2026-02-01");
});
