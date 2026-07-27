"use client";

import { useEffect, useRef, useState } from "react";
import { Repeat, Repeat1 } from "lucide-react";
import { TaskAction } from "./task-action";
import { MarkdownContent } from "./markdown-content";
import { appPath } from "@/lib/app-path";
import type { CourseAudioSegment } from "@/services/course-audio-service";

type Paragraph = { chinese: string; english: string; cue: string };
type Section = { heading: string | null; paragraphs: Paragraph[] };
type CourseAudio = { url: string; segments: CourseAudioSegment[] };
export function CourseReader({ course, stage, canComplete }: { course: { id: number; slug: string; title: string; sections: Section[]; audio?: CourseAudio }; stage: number; canComplete: boolean }) {
  const [mode, setMode] = useState<"chinese" | "english" | "cue">("chinese");
  const [playMode, setPlayMode] = useState<"once" | "loop">("once");
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const segmentRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labels = { chinese: "中文", english: "英文", cue: "Cue" } as const;
  const modeSectionIndex = { chinese: 0, english: 1, cue: 2 }[mode];
  const section = course.sections[modeSectionIndex] ?? course.sections[0];
  const PlayModeIcon = playMode === "loop" ? Repeat : Repeat1;
  const playModeLabel = playMode === "loop" ? "循环播放" : "单篇播放";
  const nextPlayModeLabel = playMode === "loop" ? "切换到单篇播放" : "切换到循环播放";
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
  return <main className="reader-page"><div className="reader-top"><a href={appPath("/today")} className="back-link">← 返回今日</a><span>{course.slug.replace("modern-family-", "").toUpperCase()}</span></div><div className="reader-heading"><p className="eyebrow">第 {stage === 0 ? "一次学习" : `${stage} 次复习`}</p><h1>{course.title}</h1></div><div className="mode-switch" role="tablist">{Object.entries(labels).map(([key, label]) => <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? "active" : ""} onClick={() => setMode(key as typeof mode)}>{label}</button>)}</div>{course.audio && <div className={`reader-audio ${mode === "english" ? "" : "reader-audio-hidden"}`} aria-hidden={mode !== "english"}><div className="reader-audio-controls"><audio ref={audioRef} controls preload="metadata" loop={playMode === "loop"} src={course.audio.url} onTimeUpdate={handleTimeUpdate}>你的浏览器不支持音频播放。</audio><div className="play-mode" role="group" aria-label="播放模式"><button type="button" className="play-mode-toggle" aria-label={nextPlayModeLabel} title={nextPlayModeLabel} aria-pressed={playMode === "loop"} onClick={() => setPlayMode(playMode === "loop" ? "once" : "loop")}><PlayModeIcon aria-hidden="true" size={18} strokeWidth={2} /><span className="sr-only">当前为{playModeLabel}</span></button></div></div></div>}<div className="reader-content"><section className="reader-section"><h2>{section.heading}</h2>{mode === "english" && course.audio ? <div className="audio-segments">{englishContent}</div> : section.paragraphs.map((paragraph, paragraphIndex) => mode === "cue" ? <MarkdownContent key={paragraphIndex} content={paragraph.cue} /> : <p key={paragraphIndex} className={mode === "english" ? "english-text" : ""}>{paragraph[mode]}</p>)}</section></div>{canComplete && <div className="reader-footer"><TaskAction kind="complete" courseId={course.id} expectedStage={stage} /></div>}</main>;
}
