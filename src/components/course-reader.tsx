"use client";

import { useState } from "react";
import { TaskAction } from "./task-action";

type Paragraph = { chinese: string; english: string; cue: string };
type Section = { heading: string | null; paragraphs: Paragraph[] };
export function CourseReader({ course, stage, canComplete }: { course: { id: number; slug: string; title: string; sections: Section[] }; stage: number; canComplete: boolean }) {
  const [mode, setMode] = useState<"chinese" | "english" | "cue">("chinese");
  const labels = { chinese: "中文", english: "英文", cue: "Cue" } as const;
  const modeSectionIndex = { chinese: 0, english: 1, cue: 2 }[mode];
  const section = course.sections[modeSectionIndex] ?? course.sections[0];
  return <main className="reader-page"><div className="reader-top"><a href="/today" className="back-link">← 返回今日</a><span>{course.slug.replace("modern-family-", "").toUpperCase()}</span></div><div className="reader-heading"><p className="eyebrow">第 {stage === 0 ? "一次学习" : `${stage} 次复习`}</p><h1>{course.title}</h1></div><div className="mode-switch" role="tablist">{Object.entries(labels).map(([key, label]) => <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? "active" : ""} onClick={() => setMode(key as typeof mode)}>{label}</button>)}</div><div className="reader-content"><section className="reader-section"><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className={mode === "english" ? "english-text" : ""}>{paragraph[mode]}</p>)}</section></div>{canComplete && <div className="reader-footer"><TaskAction kind="complete" courseId={course.id} expectedStage={stage} /></div>}</main>;
}
