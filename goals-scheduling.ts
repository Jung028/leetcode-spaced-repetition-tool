import { addDays } from "./scheduling";

export function nextStepDueDate(
  project: { created_at: string },
  existingSteps: { due_date: string }[],
  today: string,
): string {
  if (existingSteps.length === 0) return project.created_at;
  const lastDue = existingSteps.reduce(
    (max, s) => (s.due_date > max ? s.due_date : max),
    existingSteps[0]!.due_date,
  );
  const candidate = addDays(lastDue, 1);
  return candidate < today ? today : candidate;
}

export function projectProgress(steps: { weight: number; done: boolean }[]): number {
  return steps.filter((s) => s.done).reduce((sum, s) => sum + s.weight, 0);
}
