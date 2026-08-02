import type { RefObject } from "react";
import { MarkdownContent } from "./markdown-content";
import type { ReaderMode } from "./reader-workbench";
import type { CourseAudioSegment } from "@/services/course-audio-service";

type Paragraph = { chinese: string; english: string; cue: string };
type Section = { heading: string | null; paragraphs: Paragraph[] };
type CourseAudio = { url: string; segments: CourseAudioSegment[] };

export function ReaderContent({ mode, section, audio, activeSegment, onPlaySegment, segmentRefs }: { mode: ReaderMode; section: Section; audio?: CourseAudio; activeSegment: number | null; onPlaySegment: (segment: CourseAudioSegment) => void; segmentRefs: RefObject<Array<HTMLButtonElement | null>> }) {
  const englishContent = audio?.segments.map((segment, index) => <button key={segment.index} ref={(element) => { segmentRefs.current[index] = element; }} type="button" className={`audio-segment ${activeSegment === index ? "active" : ""}`} data-start={segment.start} data-end={segment.end} aria-current={activeSegment === index ? "true" : undefined} onClick={() => onPlaySegment(segment)}>{segment.text}</button>);
  return <article className="reader-article"><section className="reader-section"><h2>{section.heading}</h2>{mode === "english" && audio ? <div className="audio-segments">{englishContent}</div> : section.paragraphs.map((paragraph, paragraphIndex) => mode === "cue" ? <MarkdownContent key={paragraphIndex} content={paragraph.cue} revealSource={paragraph.english} /> : <p key={paragraphIndex} className={mode === "english" ? "english-text" : ""}>{paragraph[mode]}</p>)}</section></article>;
}
