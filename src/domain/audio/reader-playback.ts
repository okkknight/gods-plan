export const PLAYBACK_RATES = [0.75, 1, 1.25] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];
export type ReaderPlayMode = "once" | "loop" | "segment";
export type ReaderPlayModeIcon = "repeat-off" | "repeat-one" | "repeat-segment";

export function getNextPlaybackRate(currentRate: number): PlaybackRate {
  const currentIndex = PLAYBACK_RATES.indexOf(currentRate as PlaybackRate);
  return PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
}

export function getNextReaderPlayMode(mode: ReaderPlayMode, hasActiveSegment: boolean): ReaderPlayMode {
  if (mode === "once") return "loop";
  if (mode === "loop") return hasActiveSegment ? "segment" : "once";
  return "once";
}

export function getReaderPlayModeIcon(mode: ReaderPlayMode): ReaderPlayModeIcon {
  if (mode === "once") return "repeat-off";
  if (mode === "loop") return "repeat-one";
  return "repeat-segment";
}

export function getSegmentLoopTime(currentTime: number, segment: { start: number; end: number }): number | null {
  return currentTime >= segment.end ? segment.start : null;
}
