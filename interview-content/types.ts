export interface SystemDesignQuestionSeed {
  prompt: string;
  modelAnswer: string;
  rubric: string[];
  // Optional Mermaid flowchart (https://mermaid.js.org) of the reference
  // architecture, shown under the model answer once revealed so the
  // candidate can study the shape and redraw it from memory.
  diagram?: string;
}

export interface CompanySystemDesignSeed {
  company: string;
  questions: SystemDesignQuestionSeed[];
}
