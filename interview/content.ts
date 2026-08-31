import type { SystemDesignQuestionSeed, CompanySystemDesignSeed } from "../interview-content/types";
import { META } from "../interview-content/meta";
import { AMAZON } from "../interview-content/amazon";
import { ATLASSIAN } from "../interview-content/atlassian";

export interface SystemDesignQuestion extends SystemDesignQuestionSeed {
  id: string;
  company: string;
}

const ALL_COMPANIES: CompanySystemDesignSeed[] = [META, AMAZON, ATLASSIAN];

export function allSystemDesignQuestions(): SystemDesignQuestion[] {
  return ALL_COMPANIES.flatMap((company) =>
    company.questions.map((q, index) => ({
      ...q,
      id: `${company.company}:${index}`,
      company: company.company,
    })),
  );
}
