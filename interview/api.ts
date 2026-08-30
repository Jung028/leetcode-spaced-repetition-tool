import type { Database } from "bun:sqlite";
import { localToday } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";
import {
  getOrCreateTodaySession,
  startCodingTimer,
  startDesignTimer,
  saveDesignAnswer,
  revealModelAnswer,
  saveRubricChecked,
  type InterviewSessionRow,
} from "./db";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export interface InterviewSessionView {
  date: string;
  codingStartedAt: string | null;
  designStartedAt: string | null;
  completedAt: string | null;
  leetcodeProblemId: number | null;
  sdQuestion: { id: string; company: string; prompt: string; modelAnswer: string; rubric: string[] };
  sdAnswer: string;
  sdExcalidrawScene: string | null;
  sdRubricChecked: boolean[];
  sdRevealedAt: string | null;
}

function sessionView(row: InterviewSessionRow): InterviewSessionView {
  const question = allSystemDesignQuestions().find((q) => q.id === row.sd_question_id)!;
  return {
    date: row.date,
    codingStartedAt: row.coding_started_at,
    designStartedAt: row.design_started_at,
    completedAt: row.completed_at,
    leetcodeProblemId: row.leetcode_problem_id,
    sdQuestion: {
      id: question.id,
      company: question.company,
      prompt: question.prompt,
      modelAnswer: question.modelAnswer,
      rubric: question.rubric,
    },
    sdAnswer: row.sd_answer,
    sdExcalidrawScene: row.sd_excalidraw_scene,
    sdRubricChecked: JSON.parse(row.sd_rubric_checked) as boolean[],
    sdRevealedAt: row.sd_revealed_at,
  };
}

export function interviewApiRoutes(db: Database) {
  return {
    "/api/interview/today": {
      GET: () => json(sessionView(getOrCreateTodaySession(db, localToday()))),
    },
    "/api/interview/today/start-coding": {
      POST: () => json(sessionView(startCodingTimer(db, localToday()))),
    },
    "/api/interview/today/start-design": {
      POST: () => json(sessionView(startDesignTimer(db, localToday()))),
    },
    "/api/interview/today/design-answer": {
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { answer?: unknown; scene?: unknown } | null;
        const answer = typeof body?.answer === "string" ? body.answer : "";
        const scene = typeof body?.scene === "string" ? body.scene : null;
        return json(sessionView(saveDesignAnswer(db, localToday(), answer, scene)));
      },
    },
    "/api/interview/today/reveal": {
      POST: () => json(sessionView(revealModelAnswer(db, localToday()))),
    },
    "/api/interview/today/rubric": {
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { checked?: unknown } | null;
        if (!Array.isArray(body?.checked) || !body.checked.every((v) => typeof v === "boolean")) {
          return json({ error: "checked must be an array of booleans" }, 400);
        }
        return json(sessionView(saveRubricChecked(db, localToday(), body.checked as boolean[])));
      },
    },
  };
}
