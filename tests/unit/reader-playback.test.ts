import { describe, expect, it } from "vitest";
import {
  getNextPlaybackRate,
  getNextReaderPlayMode,
  getReaderPlayModeIcon,
  getSegmentLoopTime,
  PLAYBACK_RATES,
} from "@/domain/audio/reader-playback";

describe("reader playback controls", () => {
  it("cycles through the three supported playback rates", () => {
    expect(PLAYBACK_RATES).toEqual([0.75, 1, 1.25]);
    expect(getNextPlaybackRate(0.75)).toBe(1);
    expect(getNextPlaybackRate(1)).toBe(1.25);
    expect(getNextPlaybackRate(1.25)).toBe(0.75);
  });

  it("only enters segment loop mode when a segment is active", () => {
    expect(getNextReaderPlayMode("once", false)).toBe("loop");
    expect(getNextReaderPlayMode("loop", false)).toBe("once");
    expect(getNextReaderPlayMode("loop", true)).toBe("segment");
    expect(getNextReaderPlayMode("segment", true)).toBe("once");
  });

  it("maps each play mode to an icon with the same meaning", () => {
    expect(getReaderPlayModeIcon("once")).toBe("repeat-off");
    expect(getReaderPlayModeIcon("loop")).toBe("repeat-one");
    expect(getReaderPlayModeIcon("segment")).toBe("repeat-segment");
  });

  it("returns to the selected segment when it reaches the segment end", () => {
    const segment = { start: 10, end: 12.5 };
    expect(getSegmentLoopTime(12.5, segment)).toBe(10);
    expect(getSegmentLoopTime(13, segment)).toBe(10);
    expect(getSegmentLoopTime(12.49, segment)).toBeNull();
  });
});
