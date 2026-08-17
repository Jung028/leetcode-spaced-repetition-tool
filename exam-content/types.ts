export type ExamQuestionType = "mcq" | "truefalse" | "short" | "scenario";

export interface ExamQuestionSeed {
  type: ExamQuestionType;
  prompt: string;
  // mcq/truefalse only — truefalse conventionally uses options ["True", "False"].
  options?: string[];
  // mcq/truefalse only — index into options that grades as correct.
  correctIndex?: number;
  // short/scenario: the revealed model answer. mcq/truefalse: the revealed
  // explanation shown alongside the correct/incorrect highlighting.
  modelAnswer: string;
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
}
