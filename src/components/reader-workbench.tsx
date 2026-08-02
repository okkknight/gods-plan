"use client";

import { useState, type ChangeEvent, type RefObject } from "react";
import { ChevronRight, Languages, Pause, Play, Repeat, Repeat1 } from "lucide-react";
import type { CourseAudioSegment } from "@/services/course-audio-service";

export type ReaderMode = "chinese" | "english" | "cue";
export type ReaderPlayMode = "once" | "loop";
type CourseAudio = { url: string; segments: CourseAudioSegment[] };

const labels: Record<ReaderMode, string> = { chinese: "中文", english: "英文", cue: "Cue" };
const modeOrder: ReaderMode[] = ["chinese", "english", "cue"];

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const PlayModeIcon = playMode === "loop" ? Repeat : Repeat1;
  const nextMode = modeOrder[(modeOrder.indexOf(mode) + 1) % modeOrder.length];
  const currentSegment = activeSegment === null ? undefined : audio?.segments[activeSegment];
  const playModeLabel = playMode === "loop" ? "循环播放" : "单篇播放";
  const nextPlayModeLabel = playMode === "loop" ? "切换到单篇播放" : "切换到循环播放";
  const PlayIcon = isPlaying ? Pause : Play;

  const togglePlayback = () => {
    const player = audioRef.current;
    if (!player) return;
    if (player.paused) {
      void player.play().catch(() => setIsPlaying(false));
    } else {
      player.pause();
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    if (!audioRef.current) return;
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    onTimeUpdate();
  };

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return <div className="reader-workbench">
    <div className="reader-workbench-inner">
      <div className="reader-workbench-controls">
        <button type="button" className="mode-cycle-button" data-mode={mode} aria-label={`当前模式：${labels[mode]}，点击切换到${labels[nextMode]}`} title={`切换到${labels[nextMode]}`} onClick={() => onModeChange(nextMode)}><Languages aria-hidden="true" size={15} strokeWidth={2} /><span>{labels[mode]}</span><ChevronRight aria-hidden="true" size={14} strokeWidth={2} /></button>
        {audio && <>
          <button type="button" className="reader-play-button" aria-label={isPlaying ? "暂停播放" : "开始播放"} onClick={togglePlayback}><PlayIcon aria-hidden="true" size={17} fill={isPlaying ? "none" : "currentColor"} strokeWidth={2.2} /></button>
          <input className="reader-progress" type="range" min="0" max={duration || 0} step="0.01" value={Math.min(currentTime, duration || 0)} aria-label="播放进度" onChange={handleSeek} />
          <button type="button" className="play-mode-toggle" aria-label={nextPlayModeLabel} title={nextPlayModeLabel} aria-pressed={playMode === "loop"} onClick={() => onPlayModeChange(playMode === "loop" ? "once" : "loop")}>
            <PlayModeIcon aria-hidden="true" size={17} strokeWidth={2} />
            <span className="sr-only">当前为{playModeLabel}</span>
          </button>
        </>}
      </div>
      {audio && <div className="reader-workbench-meta" aria-live="polite"><span>{formatTime(currentTime)}</span><span className="reader-workbench-status-text">{currentSegment ? `第 ${currentSegment.index} / ${audio.segments.length} 段 · ${currentSegment.text}` : "准备播放"}</span><span>{formatTime(duration)}</span></div>}
      {audio && <audio ref={audioRef} className="reader-audio-source" controls preload="metadata" loop={playMode === "loop"} src={audio.url} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onDurationChange={(event) => setDuration(event.currentTarget.duration)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onTimeUpdate={(event) => { setCurrentTime(event.currentTarget.currentTime); onTimeUpdate(); }}>你的浏览器不支持音频播放。</audio>}
    </div>
  </div>;
}
