import { describe, expect, it } from "vitest";
import { inferSpeechPerformance } from "@/domain/audio/speech-performance";

describe("inferSpeechPerformance", () => {
  it("adds a warm cue to the opening and keeps the slower pace", () => {
    expect(inferSpeechPerformance("I would like to introduce the episode.", 0)).toEqual({ tags: ["[a warm storyteller inviting the listener into the story]"], speed: 0.90 });
  });

  it("keeps tension inside the storytelling voice", () => {
    expect(inferSpeechPerformance("Meanwhile, Mitchell and Cameron panic.", 9).tags).toEqual(["[a storyteller building gentle suspense]"]);
  });

  it("gives every pilot segment a continuous but varied storytelling direction", () => {
    const tags = Array.from({ length: 12 }, (_, index) => inferSpeechPerformance("A story segment.", index).tags[0]);
    expect(tags.every(Boolean)).toBe(true);
    expect(new Set(tags).size).toBeGreaterThanOrEqual(10);
  });
});
