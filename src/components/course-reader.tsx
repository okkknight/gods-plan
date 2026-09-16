"use client";

import { useEffect, useRef, useState } from "react";
import { TaskAction } from "./task-action";
import { ReaderWorkbench, type ReaderMode } from "./reader-workbench";
import { ReaderHeader } from "./reader-header";
import { ReaderContent } from "./reader-content";
import { appPath } from "@/lib/app-path";
import type { CourseAudioSegment } from "@/services/course-audio-service";
import { getSegmentLoopTime, type PlaybackRate, type ReaderPlayMode } from "@/domain/audio/reader-playback";

type Paragraph = { chinese: string; english: string; cue: string };
type Section = { heading: string | null; paragraphs: Paragraph[] };
type CourseAudio = { url: string; segments: CourseAudioSegment[] };
export function CourseReader({ course, stage, canComplete }: { course: { id: number; slug: string; title: string; sections: Section[]; audio?: CourseAudio }; stage: number; canComplete: boolean }) {
  const [mode, setMode] = useState<ReaderMode>("chinese");
  const [playMode, setPlayMode] = useState<ReaderPlayMode>("once");
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [segmentLoopIndex, setSegmentLoopIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const segmentRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modeSectionIndex = { chinese: 0, english: 1, cue: 2 }[mode];
  const section = course.sections[modeSectionIndex] ?? course.sections[0];
  useEffect(() => {
    if (activeSegment === null) return;
    segmentRefs.current[activeSegment]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSegment]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    const currentTime = audio?.currentTime ?? 0;
    const segment = course.audio?.segments.find((item) => currentTime >= item.start && currentTime < item.end);
    const nextActiveSegment = segment ? segment.index - 1 : null;
    setActiveSegment(nextActiveSegment);

    if (playMode === "segment" && segmentLoopIndex !== null && audio) {
      const loopSegment = course.audio?.segments[segmentLoopIndex];
      const loopTime = loopSegment ? getSegmentLoopTime(currentTime, loopSegment) : null;
      if (loopTime !== null) {
        audio.currentTime = loopTime;
        setActiveSegment(segmentLoopIndex);
        void audio.play().catch(() => undefined);
      }
    }
  };

  const playSegment = (segment: CourseAudioSegment) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = segment.start;
    const segmentIndex = segment.index - 1;
    setActiveSegment(segmentIndex);
    if (playMode === "segment") setSegmentLoopIndex(segmentIndex);
    void audio.play().catch(() => undefined);
  };

  const handlePlayModeChange = (nextPlayMode: ReaderPlayMode) => {
    if (nextPlayMode === "segment") {
      if (activeSegment === null) return;
      setSegmentLoopIndex(activeSegment);
    } else {
      setSegmentLoopIndex(null);
    }
    setPlayMode(nextPlayMode);
  };

  const handleAudioEnded = () => {
    const audio = audioRef.current;
    const loopSegment = segmentLoopIndex === null ? undefined : course.audio?.segments[segmentLoopIndex];
    if (playMode !== "segment" || !audio || !loopSegment) return;
    audio.currentTime = loopSegment.start;
    setActiveSegment(segmentLoopIndex);
    void audio.play().catch(() => undefined);
  };

  const episode = course.slug.replace("modern-family-", "").toUpperCase();
  return <main className="reader-page"><div className="reader-top"><a href={appPath("/today")} className="back-link">← 返回今日</a><span>{episode}</span></div><ReaderHeader episode={episode} title={course.title} stage={stage} /><div className="reader-content"><ReaderContent mode={mode} section={section} audio={course.audio} activeSegment={activeSegment} onPlaySegment={playSegment} segmentRefs={segmentRefs} /></div>{canComplete && <div className="reader-footer"><TaskAction kind="complete" courseId={course.id} expectedStage={stage} /></div>}<ReaderWorkbench mode={mode} onModeChange={setMode} playMode={playMode} onPlayModeChange={handlePlayModeChange} playbackRate={playbackRate} onPlaybackRateChange={setPlaybackRate} audioRef={audioRef} audio={course.audio} activeSegment={activeSegment} onTimeUpdate={handleTimeUpdate} onEnded={handleAudioEnded} /></main>;
}
