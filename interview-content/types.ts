export interface SystemDesignQuestionSeed {
  prompt: string;
  modelAnswer: string;
  rubric: string[];
}

export interface CompanySystemDesignSeed {
  company: string;
  questions: SystemDesignQuestionSeed[];
}
