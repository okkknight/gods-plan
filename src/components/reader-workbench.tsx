"use client";

import { useEffect, useState, type ChangeEvent, type RefObject } from "react";
import { ChevronRight, Gauge, Languages, Pause, Play, Repeat, Repeat1 } from "lucide-react";
import { getNextPlaybackRate, getNextReaderPlayMode, getReaderPlayModeIcon, type PlaybackRate, type ReaderPlayMode, type ReaderPlayModeIcon } from "@/domain/audio/reader-playback";
import type { CourseAudioSegment } from "@/services/course-audio-service";

export type ReaderMode = "chinese" | "english" | "cue";
export type { PlaybackRate, ReaderPlayMode } from "@/domain/audio/reader-playback";
type CourseAudio = { url: string; segments: CourseAudioSegment[] };

const labels: Record<ReaderMode, string> = { chinese: "中文", english: "英文", cue: "Cue" };
const modeOrder: ReaderMode[] = ["chinese", "english", "cue"];

function ReaderModeIcon({ icon, size = 17, strokeWidth = 2 }: { icon: ReaderPlayModeIcon; size?: number; strokeWidth?: number }) {
  if (icon === "repeat-one") return <Repeat1 aria-hidden="true" size={size} strokeWidth={strokeWidth} />;
  if (icon === "repeat-segment") return <svg aria-hidden="true" className="reader-mode-segment-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4" /><path d="M3 6h14a4 4 0 0 1 4 4" /><path d="m7 22-4-4 4-4" /><path d="M21 18H7a4 4 0 0 1-4-4" /><path d="M8 12h8" /><path d="m10 10-2 2 2 2" /><path d="m14 10 2 2-2 2" /></svg>;
  return <span className="reader-mode-off-icon"><Repeat aria-hidden="true" size={size} strokeWidth={strokeWidth} /><span aria-hidden="true" className="reader-mode-off-icon-slash" /></span>;
}

type ReaderWorkbenchProps = {
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  playMode: ReaderPlayMode;
  onPlayModeChange: (mode: ReaderPlayMode) => void;
  playbackRate: PlaybackRate;
  onPlaybackRateChange: (rate: PlaybackRate) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  audio?: CourseAudio;
  activeSegment: number | null;
  onTimeUpdate: () => void;
};

export function ReaderWorkbench({ mode, onModeChange, playMode, onPlayModeChange, playbackRate, onPlaybackRateChange, audioRef, audio, activeSegment, onTimeUpdate, onEnded }: ReaderWorkbenchProps & { onEnded: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playModeIcon = getReaderPlayModeIcon(playMode);
  const nextMode = modeOrder[(modeOrder.indexOf(mode) + 1) % modeOrder.length];
  const currentSegment = activeSegment === null ? undefined : audio?.segments[activeSegment];
  const playModeLabel = playMode === "segment" ? "当前段循环" : playMode === "loop" ? "单课循环" : "单篇播放";
  const nextPlayMode = getNextReaderPlayMode(playMode, activeSegment !== null);
  const nextPlayModeLabel = nextPlayMode === "segment" ? "切换到当前段循环" : nextPlayMode === "loop" ? "切换到单课循环" : "切换到单篇播放";
  const nextPlaybackRate = getNextPlaybackRate(playbackRate);
  const PlayIcon = isPlaying ? Pause : Play;

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [audioRef, playbackRate]);

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
          <button type="button" className="play-mode-toggle" data-play-mode={playMode} aria-label={nextPlayModeLabel} title={`当前为${playModeLabel}，${nextPlayModeLabel}`} aria-pressed={playMode !== "once"} onClick={() => onPlayModeChange(nextPlayMode)}>
            <ReaderModeIcon icon={playModeIcon} />
            <span className="sr-only">当前为{playModeLabel}</span>
          </button>
          <button type="button" className="playback-rate-toggle" aria-label={`当前语速 ${playbackRate} 倍，切换到 ${nextPlaybackRate} 倍`} title={`切换到 ${nextPlaybackRate}x`} onClick={() => onPlaybackRateChange(nextPlaybackRate)}>
            <Gauge aria-hidden="true" size={16} strokeWidth={2} />
            <span>{playbackRate}x</span>
          </button>
        </>}
      </div>
      {audio && <div className="reader-workbench-meta" aria-live="polite"><span>{formatTime(currentTime)}</span><span className="reader-workbench-status-text">{currentSegment ? `第 ${currentSegment.index} / ${audio.segments.length} 段 · ${currentSegment.text}` : "准备播放"}</span><span>{formatTime(duration)}</span></div>}
      {audio && <audio ref={audioRef} className="reader-audio-source" controls preload="metadata" loop={playMode === "loop"} src={audio.url} onLoadedMetadata={(event) => { event.currentTarget.playbackRate = playbackRate; setDuration(event.currentTarget.duration); }} onDurationChange={(event) => setDuration(event.currentTarget.duration)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); onEnded(); }} onTimeUpdate={(event) => { setCurrentTime(event.currentTarget.currentTime); onTimeUpdate(); }}>你的浏览器不支持音频播放。</audio>}
    </div>
  </div>;
}
