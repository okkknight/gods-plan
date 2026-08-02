"use client";

import { useEffect, useRef, useState } from "react";
import { TaskAction } from "./task-action";
import { ReaderWorkbench, type ReaderMode, type ReaderPlayMode } from "./reader-workbench";
import { ReaderHeader } from "./reader-header";
import { ReaderContent } from "./reader-content";
import { appPath } from "@/lib/app-path";
import type { CourseAudioSegment } from "@/services/course-audio-service";

type Paragraph = { chinese: string; english: string; cue: string };
type Section = { heading: string | null; paragraphs: Paragraph[] };
type CourseAudio = { url: string; segments: CourseAudioSegment[] };
export function CourseReader({ course, stage, canComplete }: { course: { id: number; slug: string; title: string; sections: Section[]; audio?: CourseAudio }; stage: number; canComplete: boolean }) {
  const [mode, setMode] = useState<ReaderMode>("chinese");
  const [playMode, setPlayMode] = useState<ReaderPlayMode>("once");
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const segmentRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modeSectionIndex = { chinese: 0, english: 1, cue: 2 }[mode];
  const section = course.sections[modeSectionIndex] ?? course.sections[0];
  useEffect(() => {
    if (activeSegment === null) return;
    segmentRefs.current[activeSegment]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSegment]);

  const handleTimeUpdate = () => {
    const currentTime = audioRef.current?.currentTime ?? 0;
    const segment = course.audio?.segments.find((item) => currentTime >= item.start && currentTime < item.end);
    setActiveSegment(segment ? segment.index - 1 : null);
  };

  const playSegment = (segment: CourseAudioSegment) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = segment.start;
    setActiveSegment(segment.index - 1);
    void audio.play().catch(() => undefined);
  };

  const episode = course.slug.replace("modern-family-", "").toUpperCase();
  return <main className="reader-page"><div className="reader-top"><a href={appPath("/today")} className="back-link">← 返回今日</a><span>{episode}</span></div><ReaderHeader episode={episode} title={course.title} stage={stage} /><div className="reader-content"><ReaderContent mode={mode} section={section} audio={course.audio} activeSegment={activeSegment} onPlaySegment={playSegment} segmentRefs={segmentRefs} /></div>{canComplete && <div className="reader-footer"><TaskAction kind="complete" courseId={course.id} expectedStage={stage} /></div>}<ReaderWorkbench mode={mode} onModeChange={setMode} playMode={playMode} onPlayModeChange={setPlayMode} audioRef={audioRef} audio={course.audio} activeSegment={activeSegment} onTimeUpdate={handleTimeUpdate} /></main>;
}
