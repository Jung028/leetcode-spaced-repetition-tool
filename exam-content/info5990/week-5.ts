import type { ExamPaperSeed } from "../types";

const DISCUSSION_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 5,
  paperNumber: 1,
  title: "Week 5 Discussion Prep",
  topics:
    "Pre-lecture Ed Discussion prompt: estimation accuracy vs stakeholder pressure, evidence-based estimating, three-point/analogous estimating, the risk of anchoring an estimate to what a client wants to hear rather than what the data supports",
  sourceFiles: ["Ed Discussion — Week 5 pre-lecture prompt"],
  questions: [
    {
      type: "scenario",
      prompt:
        "A quick IT project dilemma: your company is bidding for a $2 million software project and the client wants delivery in 6 months. An experienced developer estimates 6 months; previous project data suggests 9 months; an AI estimation tool predicts 7 months; the sales manager says 'promise 6 months, or we may lose the client.' As the Project Manager: which estimate would you trust, and why? Would you promise 6 months to win the project? What evidence would you collect before making the final decision? Should a good estimate be what the stakeholder wants to hear, or what the evidence can justify?",
      modelAnswer:
        "Trust the historical data (9 months) and the AI tool (7 months) over the single developer's 6-month gut estimate, and treat the sales manager's 6-month figure as a negotiating position, not an estimate at all — it's the one number with zero supporting evidence behind it, driven purely by what the client wants to hear. The developer's estimate is a single unverified data point subject to optimism bias (planning fallacy): people who haven't yet hit a project's actual obstacles routinely underestimate. The 9-month historical figure is analogous estimating grounded in what actually happened on comparable past projects, and the AI tool's 7 months likely sits between the two because it's pattern-matching against a broader dataset than any one person's memory — the fact that two independent, evidence-based sources (data and AI) land closer to each other (7-9 months) than either lands to the developer's 6 is itself a signal about which number to trust. I would not promise 6 months: committing to a timeline the evidence doesn't support sets the project up to fail from day one, and a broken promise on a $2M contract costs far more in trust, penalty clauses, and rework than losing this particular bid up front. Before finalising a number I'd collect a bottom-up WBS-based estimate from the team actually doing the work (not just one developer's top-down gut check), compare it against the historical data for structurally similar past projects (same tech stack, team size, client complexity), get the AI tool's estimate re-run with the project's actual scope details rather than generic inputs, and identify the specific risks/unknowns that explain the gap between 6 and 9 months, then decide whether a phased delivery (e.g. an MVP at 6 months, full scope at 9) could reconcile the client's timeline with the evidence rather than just picking one number and hoping. A good estimate has to be what the evidence can justify, not what the stakeholder wants to hear — an estimate that's really a sales tactic isn't an estimate at all, and confusing the two is exactly how projects end up in the 'unrealistic timelines and budgets' failure category covered earlier this unit.",
    },
  ],
};

export const WEEK_5_PAPERS: ExamPaperSeed[] = [DISCUSSION_PAPER];
