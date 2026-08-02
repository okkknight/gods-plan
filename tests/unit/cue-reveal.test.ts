import { describe, expect, it } from "vitest";
import { alignCueBlanks } from "@/domain/courses/cue-reveal";

describe("alignCueBlanks", () => {
  it("maps each underline run to the matching English word in order", () => {
    const cue = "This is _____ _____.\n\nThey _____.";
    const english = "This is a small.\n\nThey arrive.";

    expect(alignCueBlanks(cue, english)).toEqual(["a", "small", "arrive"]);
  });

  it("does not guess when the visible Cue skeleton cannot match the source", () => {
    expect(alignCueBlanks("This _____ works.", "That source differs.")).toEqual([null]);
  });

  it("supports full-width underline runs used by Cue formatting", () => {
    expect(alignCueBlanks("这是＿＿＿＿。", "这是故事。")).toEqual(["故事"]);
  });
});
