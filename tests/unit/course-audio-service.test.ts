import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveCourseAudioFile } from "@/services/course-audio-service";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createAudioDirectory(files: string[]) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "godsplan-audio-"));
  temporaryDirectories.push(directory);
  await Promise.all(files.map((file) => writeFile(path.join(directory, file), "audio")));
  return directory;
}

describe("resolveCourseAudioFile", () => {
  it("uses the MP3 delivery file when both MP3 and legacy WAV are present", async () => {
    const directory = await createAudioDirectory(["english.mp3", "english.wav"]);

    expect(resolveCourseAudioFile(directory)).toBe("english.mp3");
  });

  it("keeps legacy WAV playable until a course has been converted", async () => {
    const directory = await createAudioDirectory(["english.wav"]);

    expect(resolveCourseAudioFile(directory)).toBe("english.wav");
  });
});
