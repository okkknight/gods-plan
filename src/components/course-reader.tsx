"use client";

import { useEffect, useRef, useState } from "react";
import { TaskAction } from "./task-action";
import { MarkdownContent } from "./markdown-content";
import { ReaderWorkbench, type ReaderMode, type ReaderPlayMode } from "./reader-workbench";
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

  const englishContent = course.audio?.segments.map((segment, index) => <button key={segment.index} ref={(element) => { segmentRefs.current[index] = element; }} type="button" className={`audio-segment ${activeSegment === index ? "active" : ""}`} data-start={segment.start} data-end={segment.end} aria-current={activeSegment === index ? "true" : undefined} onClick={() => playSegment(segment)}>{segment.text}</button>);
  return <main className="reader-page"><div className="reader-top"><a href={appPath("/today")} className="back-link">← 返回今日</a><span>{course.slug.replace("modern-family-", "").toUpperCase()}</span></div><div className="reader-heading"><p className="eyebrow">第 {stage === 0 ? "一次学习" : `${stage} 次复习`}</p><h1>{course.title}</h1></div><div className="reader-content"><section className="reader-section"><h2>{section.heading}</h2>{mode === "english" && course.audio ? <div className="audio-segments">{englishContent}</div> : section.paragraphs.map((paragraph, paragraphIndex) => mode === "cue" ? <MarkdownContent key={paragraphIndex} content={paragraph.cue} revealSource={paragraph.english} /> : <p key={paragraphIndex} className={mode === "english" ? "english-text" : ""}>{paragraph[mode]}</p>)}</section></div>{canComplete && <div className="reader-footer"><TaskAction kind="complete" courseId={course.id} expectedStage={stage} /></div>}<ReaderWorkbench mode={mode} onModeChange={setMode} playMode={playMode} onPlayModeChange={setPlayMode} audioRef={audioRef} audio={course.audio} activeSegment={activeSegment} onTimeUpdate={handleTimeUpdate} /></main>;
}
