import { describe, expect, it } from "vitest";
import { splitTextForSpeech } from "@/domain/audio/text-segmentation";

describe("splitTextForSpeech", () => {
  it("keeps paragraphs and sentence boundaries while respecting the limit", () => {
    const chunks = splitTextForSpeech("First sentence. Second sentence.\n\nThird sentence.", 40);
    expect(chunks).toEqual(["First sentence. Second sentence.", "Third sentence."]);
  });

  it("removes markdown emphasis before synthesis", () => {
    expect(splitTextForSpeech("It is called **Pilot**.")).toEqual(["It is called Pilot."]);
  });
});
