import type { Database } from "bun:sqlite";
import {
  countOverdueTheory,
  countTheoryReviewsToday,
  getNextBlankConcept,
  listDueTheory,
  listTheoryCompletedToday,
  reviewTheoryConcept,
  saveTheoryAnswer,
  saveTheoryContent,
  type TheoryAnswerFormat,
} from "./theory-db";
import { TOTAL_DAYS } from "./theory-content";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function parseConceptDay(raw: string): number | null {
  const day = Number(raw);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) return null;
  return day;
}

export function theoryApiRoutes(db: Database) {
  return {
    "/api/theory/due": {
      GET: () => {
        const today = localToday();
        const due = listDueTheory(db, today);
        return json({
          due,
          stats: {
            dueCount: due.length,
            overdueCount: countOverdueTheory(db, today),
            completedToday: countTheoryReviewsToday(db, today),
          },
        });
      },
    },
    "/api/theory/completed-today": {
      GET: () => json(listTheoryCompletedToday(db, localToday())),
    },
    "/api/theory/:day/answer": {
      POST: async (req: Request & { params: { day: string } }) => {
        const day = parseConceptDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_DAYS}` }, 400);
        const body = (await req.json().catch(() => null)) as { yourAnswer?: unknown } | null;
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : "";
        const updated = saveTheoryAnswer(db, day, yourAnswer);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
    "/api/theory/:day/review": {
      POST: async (req: Request & { params: { day: string } }) => {
        const day = parseConceptDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_DAYS}` }, 400);
        const body = (await req.json().catch(() => null)) as { result?: string } | null;
        if (body?.result !== "correct" && body?.result !== "wrong") {
          return json({ error: "result must be 'correct' or 'wrong'" }, 400);
        }
        const updated = reviewTheoryConcept(db, day, body.result, localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
    "/api/theory/next-blank": {
      GET: () => json(getNextBlankConcept(db)),
    },
    "/api/theory/:day/content": {
      PUT: async (req: Request & { params: { day: string } }) => {
        const day = parseConceptDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_DAYS}` }, 400);
        const body = (await req.json().catch(() => null)) as
          | { question?: unknown; answer?: unknown; answerFormat?: unknown }
          | null;
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
        const answerFormat: TheoryAnswerFormat =
          body?.answerFormat === "image" || body?.answerFormat === "link" ? body.answerFormat : "text";
        if (!question || !answer) {
          return json({ error: "question and answer are required" }, 400);
        }
        if (answerFormat !== "text") {
          let isHttpUrl = false;
          try {
            const url = new URL(answer);
            isHttpUrl = url.protocol === "http:" || url.protocol === "https:";
          } catch {
            isHttpUrl = false;
          }
          if (!isHttpUrl) {
            return json({ error: `answer must be a valid http(s) URL when format is '${answerFormat}'` }, 400);
          }
        }
        const updated = saveTheoryContent(db, day, question, answer, answerFormat);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
  };
}
