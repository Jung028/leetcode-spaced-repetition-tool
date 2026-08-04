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
}

export interface ExamPaperSeed {
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
