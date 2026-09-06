import type { Database } from "bun:sqlite";
import { localToday } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";
import {
  getOrCreateTodaySession,
  startOrResumeCoding,
  pauseCoding,
  startOrResumeDesign,
  pauseDesign,
  saveDesignAnswer,
  revealModelAnswer,
  saveRubricChecked,
  advanceToNextQuestion,
  type InterviewSessionRow,
} from "./db";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export interface InterviewSessionView {
  date: string;
  codingElapsedSeconds: number;
  codingRunningSince: string | null;
  designElapsedSeconds: number;
  designRunningSince: string | null;
  completedAt: string | null;
  leetcodeProblemId: number | null;
  sdQuestion: { id: string; company: string; prompt: string; modelAnswer: string; rubric: string[]; diagram: string | null };
  sdAnswer: string;
  sdExcalidrawScene: string | null;
  sdRubricChecked: boolean[];
  sdRevealedAt: string | null;
}

function parseRubricChecked(raw: string): boolean[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((v) => typeof v === "boolean") ? parsed : [];
  } catch {
    return [];
  }
}

function sessionView(row: InterviewSessionRow): InterviewSessionView {
  const question = allSystemDesignQuestions().find((q) => q.id === row.sd_question_id)!;
  return {
    date: row.date,
    codingElapsedSeconds: row.coding_elapsed_seconds,
    codingRunningSince: row.coding_running_since,
    designElapsedSeconds: row.design_elapsed_seconds,
    designRunningSince: row.design_running_since,
    completedAt: row.completed_at,
    leetcodeProblemId: row.leetcode_problem_id,
    sdQuestion: {
      id: question.id,
      company: question.company,
      prompt: question.prompt,
      modelAnswer: question.modelAnswer,
      rubric: question.rubric,
      diagram: question.diagram ?? null,
    },
    sdAnswer: row.sd_answer,
    sdExcalidrawScene: row.sd_excalidraw_scene,
    sdRubricChecked: parseRubricChecked(row.sd_rubric_checked),
    sdRevealedAt: row.sd_revealed_at,
  };
}

export function interviewApiRoutes(db: Database) {
  return {
    "/api/interview/today": {
      GET: () => json(sessionView(getOrCreateTodaySession(db, localToday()))),
    },
    "/api/interview/today/start-coding": {
      POST: (req: Request) => {
        const today = localToday();
        const date = new URL(req.url).searchParams.get("date");
        if (date !== today) return json({ error: "stale-date", today }, 409);
        return json(sessionView(startOrResumeCoding(db, today)));
      },
    },
    "/api/interview/today/pause-coding": {
      POST: (req: Request) => {
        const today = localToday();
        const date = new URL(req.url).searchParams.get("date");
        if (date !== today) return json({ error: "stale-date", today }, 409);
        return json(sessionView(pauseCoding(db, today)));
      },
    },
    "/api/interview/today/start-design": {
      POST: (req: Request) => {
        const today = localToday();
        const date = new URL(req.url).searchParams.get("date");
        if (date !== today) return json({ error: "stale-date", today }, 409);
        return json(sessionView(startOrResumeDesign(db, today)));
      },
    },
    "/api/interview/today/pause-design": {
      POST: (req: Request) => {
        const today = localToday();
        const date = new URL(req.url).searchParams.get("date");
        if (date !== today) return json({ error: "stale-date", today }, 409);
        return json(sessionView(pauseDesign(db, today)));
      },
    },
    "/api/interview/today/design-answer": {
      POST: async (req: Request) => {
        const today = localToday();
        const body = (await req.json().catch(() => null)) as { answer?: unknown; scene?: unknown; date?: unknown } | null;
        if (body?.date !== today) return json({ error: "stale-date", today }, 409);
        const answer = typeof body?.answer === "string" ? body.answer : "";
        const scene = typeof body?.scene === "string" ? body.scene : null;
        return json(sessionView(saveDesignAnswer(db, today, answer, scene)));
      },
    },
    "/api/interview/today/reveal": {
      POST: (req: Request) => {
        const today = localToday();
        const date = new URL(req.url).searchParams.get("date");
        if (date !== today) return json({ error: "stale-date", today }, 409);
        return json(sessionView(revealModelAnswer(db, today)));
      },
    },
    "/api/interview/today/rubric": {
      POST: async (req: Request) => {
        const today = localToday();
        const body = (await req.json().catch(() => null)) as { checked?: unknown; date?: unknown } | null;
        if (body?.date !== today) return json({ error: "stale-date", today }, 409);
        if (!Array.isArray(body.checked) || !body.checked.every((v) => typeof v === "boolean")) {
          return json({ error: "checked must be an array of booleans" }, 400);
        }
        return json(sessionView(saveRubricChecked(db, today, body.checked as boolean[])));
      },
    },
    "/api/interview/today/next": {
      POST: (req: Request) => {
        const today = localToday();
        const date = new URL(req.url).searchParams.get("date");
        if (date !== today) return json({ error: "stale-date", today }, 409);
        return json(sessionView(advanceToNextQuestion(db, today)));
      },
    },
  };
}
