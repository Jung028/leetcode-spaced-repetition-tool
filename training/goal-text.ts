export const GOAL_CATEGORIES = ["running", "cycling", "events", "recovery", "other"] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const GOAL_CATEGORY_LABEL: Record<GoalCategory, string> = {
  running: "Running",
  cycling: "Cycling",
  events: "Events",
  recovery: "Recovery",
  other: "Other",
};

// First match wins. Running is tested before cycling because a running goal
// can mention the bike ("10km off the bike"); recovery and events come first
// because those lines mention sports without being a sport target.
const CATEGORY_RULES: [RegExp, GoalCategory][] = [
  [/injury/i, "recovery"],
  [/games|worlds|zofingen/i, "events"],
  [/\b(run|5k|10k|marathon)/i, "running"],
  [/\b(bike|ftp|cycling)/i, "cycling"],
];

export function inferGoalCategory(text: string): GoalCategory {
  return CATEGORY_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? "other";
}

export function isGoalCategory(value: unknown): value is GoalCategory {
  return typeof value === "string" && (GOAL_CATEGORIES as readonly string[]).includes(value);
}

export interface GoalParts {
  title: string;
  current: string;
  target: string;
  note: string | null;
}

const TRAILING_PAREN_RE = /^(.*\S)\s*\(([^()]*)\)$/;

export function parseGoalText(text: string): GoalParts | null {
  const colon = text.indexOf(": ");
  if (colon <= 0) return null;
  const title = text.slice(0, colon).trim();
  const segments = text
    .slice(colon + 2)
    .split(" → ")
    .map((segment) => segment.trim());
  if (segments.length < 2 || segments.some((segment) => segment === "")) return null;

  const [current, rawTarget, ...later] = segments;
  const notes: string[] = [];
  let target = rawTarget!;
  const paren = TRAILING_PAREN_RE.exec(target);
  if (paren) {
    target = paren[1]!;
    notes.push(paren[2]!.trim());
  }
  if (later.length > 0) notes.push(`then ${later.join(" → ")}`);

  return { title, current: current!, target, note: notes.length > 0 ? notes.join(" · ") : null };
}
