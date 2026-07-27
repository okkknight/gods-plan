import { describe, expect, it } from "vitest";
import { inferSpeechPerformance } from "@/domain/audio/speech-performance";

describe("inferSpeechPerformance", () => {
  it("adds a warm cue to the opening and keeps the slower pace", () => {
    expect(inferSpeechPerformance("I would like to introduce the episode.", 0)).toEqual({ tags: ["[warm storytelling]"], speed: 0.95 });
  });

  it("uses transition cues sparingly", () => {
    expect(inferSpeechPerformance("Meanwhile, Mitchell and Cameron panic.", 9).tags).toEqual(["[conversational transition]"]);
  });
});
