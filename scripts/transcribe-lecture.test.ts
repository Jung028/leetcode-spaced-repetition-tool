import { test, expect } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { transcribeVideo } from "./transcribe-lecture";

const HAS_TOOLCHAIN = !!Bun.which("ffmpeg") && !!Bun.which("whisper-cli");
const MODEL = join(process.env.HOME ?? "", ".whisper-models", "ggml-base.en.bin");
const HAS_MODEL = await Bun.file(MODEL).exists();
// whisper-cpp ships a short JFK speech sample for its own tests — reused
// here as a real, tiny fixture so this test exercises the actual ffmpeg +
// whisper-cli pipeline instead of mocking it away.
const SAMPLE_WAV = Bun.which("whisper-cli")
  ? join(Bun.which("whisper-cli")!, "..", "..", "share", "whisper-cpp", "jfk.wav")
  : "";

test("transcribeVideo errors clearly when the input file doesn't exist", async () => {
  await expect(transcribeVideo("/nonexistent/lecture.mp4", MODEL, "/tmp/whatever.md")).rejects.toThrow(
    "Video not found",
  );
});

test("transcribeVideo errors clearly when the model file doesn't exist", async () => {
  const dir = mkdtempSync(join(tmpdir(), "transcribe-test-"));
  const input = join(dir, "lecture.mp4");
  writeFileSync(input, "x");

  await expect(transcribeVideo(input, "/nonexistent/model.bin", "/tmp/whatever.md")).rejects.toThrow(
    "Whisper model not found",
  );

  rmSync(dir, { recursive: true, force: true });
});

test.skipIf(!HAS_TOOLCHAIN || !HAS_MODEL)(
  "transcribeVideo produces a markdown transcript from real audio",
  async () => {
    const dir = mkdtempSync(join(tmpdir(), "transcribe-test-"));
    const outPath = join(dir, "lecture.transcript.md");

    await transcribeVideo(SAMPLE_WAV, MODEL, outPath);
    const text = await Bun.file(outPath).text();

    expect(text).toContain("# Transcript: jfk.wav");
    expect(text.toLowerCase()).toContain("ask not what your country");

    rmSync(dir, { recursive: true, force: true });
  },
);
