import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Any exam-api grade/submit route hit during a test without an explicit
// EXAM_ATTEMPTS_LOG_PATH override (i.e. every test that isn't specifically
// about the attempt log) would otherwise append real rows to
// exam-attempts.jsonl at the repo root on every `bun test` run — redirect
// the default target to a throwaway temp file for the whole test process.
if (!process.env.EXAM_ATTEMPTS_LOG_PATH) {
  process.env.EXAM_ATTEMPTS_LOG_PATH = join(mkdtempSync(join(tmpdir(), "exam-attempts-test-")), "attempts.jsonl");
}
