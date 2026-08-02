"use client";

import type { RefObject } from "react";
import { Repeat, Repeat1 } from "lucide-react";
import type { CourseAudioSegment } from "@/services/course-audio-service";

export type ReaderMode = "chinese" | "english" | "cue";
export type ReaderPlayMode = "once" | "loop";
type CourseAudio = { url: string; segments: CourseAudioSegment[] };

const labels: Record<ReaderMode, string> = { chinese: "中文", english: "英文", cue: "Cue" };

type ReaderWorkbenchProps = {
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  playMode: ReaderPlayMode;
  onPlayModeChange: (mode: ReaderPlayMode) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  audio?: CourseAudio;
  activeSegment: number | null;
  onTimeUpdate: () => void;
};

export function ReaderWorkbench({ mode, onModeChange, playMode, onPlayModeChange, audioRef, audio, activeSegment, onTimeUpdate }: ReaderWorkbenchProps) {
  const PlayModeIcon = playMode === "loop" ? Repeat : Repeat1;
  const currentSegment = activeSegment === null ? undefined : audio?.segments[activeSegment];
  const playModeLabel = playMode === "loop" ? "循环播放" : "单篇播放";
  const nextPlayModeLabel = playMode === "loop" ? "切换到单篇播放" : "切换到循环播放";

  return <div className="reader-workbench">
    <div className="reader-workbench-inner">
      <div className="reader-workbench-topline">
        <div className="mode-switch" role="tablist" aria-label="课程内容模式">
          {Object.entries(labels).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={mode === key} className={mode === key ? "active" : ""} onClick={() => onModeChange(key as ReaderMode)}>{label}</button>)}
        </div>
        {audio && <button type="button" className="play-mode-toggle" aria-label={nextPlayModeLabel} title={nextPlayModeLabel} aria-pressed={playMode === "loop"} onClick={() => onPlayModeChange(playMode === "loop" ? "once" : "loop")}>
          <PlayModeIcon aria-hidden="true" size={18} strokeWidth={2} />
          <span className="sr-only">当前为{playModeLabel}</span>
        </button>}
      </div>
      {audio && <div className="reader-workbench-player">
        <audio ref={audioRef} controls preload="metadata" loop={playMode === "loop"} src={audio.url} onTimeUpdate={onTimeUpdate}>你的浏览器不支持音频播放。</audio>
        <div className="reader-workbench-status" aria-live="polite">
          {currentSegment && <><span>第 {currentSegment.index} / {audio.segments.length} 段</span><span className="reader-workbench-status-text">{currentSegment.text}</span></>}
        </div>
      </div>}
    </div>
  </div>;
}
