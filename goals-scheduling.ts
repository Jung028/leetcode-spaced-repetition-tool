export function projectProgress(steps: { weight: number; done: boolean }[]): number {
  return steps.filter((s) => s.done).reduce((sum, s) => sum + s.weight, 0);
}
