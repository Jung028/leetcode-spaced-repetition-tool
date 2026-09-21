export type ExamQuestionType =
  | "mcq" | "truefalse" | "short" | "scenario" | "multi"
  | "fillblank" | "match" | "order" | "sort";

export interface ExamQuestionSeed {
  type: ExamQuestionType;
  prompt: string;
  // mcq/truefalse/multi — the choices. truefalse conventionally uses
  // options ["True", "False"].
  options?: string[];
  // mcq/truefalse only — index into options that grades as correct.
  correctIndex?: number;
  // multi only — the set of option indices that together form the correct
  // answer (select-all-that-apply). Grades right only when the student
  // ticks exactly this set: every one of these and none of the others.
  // Convention: sorted ascending, at least two entries.
  correctIndices?: number[];
  // short/scenario: the revealed model answer. mcq/truefalse/multi: the
  // revealed explanation shown alongside the correct/incorrect highlighting.
  modelAnswer: string;
  // Optional image (data URI or URL) shown with the prompt — for a question
  // that asks the student to work from a real document page (e.g. a report
  // screenshot) rather than from Mermaid syntax.
  promptImage?: string;
  // Optional Mermaid diagram syntax (flowchart/sequence/etc.) shown with the
  // prompt — for a question that references an existing architecture or
  // sequence diagram from the material.
  promptDiagram?: string;
  // Optional Mermaid diagram syntax shown with modelAnswer — the actual
  // diagram that answers a "draw/sketch the X" question.
  answerDiagram?: string;
  // True when the question expects the student to sketch something by
  // hand; the UI links out to excalidraw.com as a scratchpad.
  requiresDrawing?: boolean;
  // fillblank — accepted answers per blank. `prompt` holds one "___" per blank,
  // in order. Case, spacing and punctuation are ignored when marking.
  blanks?: string[][];
  // match — 3-6 rows; `left` order is the display order, `right` is its partner. Left texts must be unique.
  pairs?: { left: string; right: string }[];
  // match — up to 2 extra wrong right-hand choices, so it can't be finished by elimination.
  decoys?: string[];
  // order — authored in the CORRECT order (3-7 steps); the UI shuffles them.
  steps?: string[];
  // sort — 2-3 labelled boxes and 4-8 items, each pointing at its box by index.
  groups?: string[];
  items?: { text: string; group: number }[];
}

// A short "read this first" card shown before a round of questions. Attached by
// POSITION (index of the round's first question), never numbered like a question,
// so a student's stored answers (keyed by question index) never shift.
export interface ExamReadingSeed {
  beforeQuestion: number;
  title: string;
  body: string; // PromptText style, 100-150 words, hard cap 200
  diagram?: string; // optional Mermaid
}

export interface ExamPaperSeed {
  course: string;
  week: number;
  paperNumber: number; // 1-based within the week
  title: string;
  topics: string;
  // Paths (relative to that week's course folder) to the material this
  // paper's questions were written from — carried along so content can be
  // regenerated/expanded later without losing track of its sources.
  sourceFiles: string[];
  questions: ExamQuestionSeed[];
  readings?: ExamReadingSeed[];
}
