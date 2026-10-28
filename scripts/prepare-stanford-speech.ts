import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { courseSchema } from "../src/domain/courses/course-schema";
import { alignCueBlanks } from "../src/domain/courses/cue-reveal";

// Local content preparation only: never imports into a database or generates speech.
const root = path.resolve("content/speeches/steve-jobs-stanford-2005");
const cache = path.resolve("data/audio-cache/steve-jobs-stanford-2005");
const source = JSON.parse(fs.readFileSync(path.join(root, "bilingual-source.json"), "utf8")) as {
  sourceUrl: string; series: string; paragraphs: { id: string; english: string; chinese: string }[];
};
const plan = JSON.parse(fs.readFileSync(path.join(root, "split-plan.json"), "utf8")) as {
  lessons: { slug: string; part: number; title: string; wordCount: number; sourceParagraphStart: number; sourceParagraphEnd: number }[];
};
const recitation = JSON.parse(fs.readFileSync(path.join(root, "recitation-plan.json"), "utf8")) as {
  version: number; maxWords: number; paragraphs: { sourceParagraphId: string; segments: { english: string; chinese: string }[] }[];
};
const segmentsOnly = process.argv.includes("--segments-only");
const origins = JSON.parse(fs.readFileSync(path.join(root, "audio-sources.json"), "utf8"));
const original = path.join(cache, "candidate-9696.mp3");
const originalHash = createHash("sha256").update(fs.readFileSync(original)).digest("hex");
if (originalHash !== origins.candidates[0].sha256) throw new Error("Original recording checksum changed; recheck alignment before continuing");
const transcript = JSON.parse(fs.readFileSync(path.join(cache, "words.json"), "utf8")) as {
  transcription: { text: string; offsets: { from: number; to: number } }[];
};
const words = (text: string) => text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) ?? [];
const normalize = (text: string) => {
  const word = text.toLowerCase().replace(/[’']/g, "");
  // ASR spells these proper names phonetically. Displayed text stays untouched.
  return word === "reed" ? "read" : word === "stewart" ? "stuart" : word;
};
const canonical = source.paragraphs.flatMap((p) => words(p.english).map(normalize));
const spoken = transcript.transcription.flatMap((segment) => words(segment.text).map((text) => ({
  text: normalize(text), start: segment.offsets.from / 1000, end: segment.offsets.to / 1000,
})));

// Align the reference words to recognised words. Timing comes only from ASR,
// never from dividing the recording's duration by text length.
const width = spoken.length + 1;
const distance = new Uint16Array((canonical.length + 1) * width);
for (let i = 0; i <= canonical.length; i++) distance[i * width] = i;
for (let j = 0; j <= spoken.length; j++) distance[j] = j;
for (let i = 1; i <= canonical.length; i++) {
  for (let j = 1; j <= spoken.length; j++) {
    distance[i * width + j] = Math.min(
      distance[(i - 1) * width + j] + 1,
      distance[i * width + j - 1] + 1,
      distance[(i - 1) * width + j - 1] + Number(canonical[i - 1] !== spoken[j - 1].text),
    );
  }
}
const anchors = new Map<number, number>();
let i = canonical.length, j = spoken.length;
while (i || j) {
  const value = distance[i * width + j];
  if (i && j && value === distance[(i - 1) * width + j - 1] + Number(canonical[i - 1] !== spoken[j - 1].text)) {
    if (canonical[i - 1] === spoken[j - 1].text) anchors.set(i - 1, j - 1);
    i--; j--;
  } else if (i && value === distance[(i - 1) * width + j] + 1) i--;
  else j--;
}
const coverage = anchors.size / canonical.length;
if (coverage < 0.95) throw new Error(`Recording/reference mismatch: only ${(coverage * 100).toFixed(1)}% matching words`);
let cursor = 0;
const paragraphStarts = source.paragraphs.map((p, index) => {
  const first = cursor;
  cursor += words(p.english).length;
  const match = anchors.get(first);
  if (match === undefined) throw new Error(`Paragraph ${index + 1} has no exact first-word timing anchor; check manually`);
  return spoken[match].start;
});

const subdivisions = new Map(recitation.paragraphs.map((p) => [p.sourceParagraphId, p.segments]));
if (subdivisions.size !== recitation.paragraphs.length) throw new Error("Duplicate recitation source paragraph");
for (const id of subdivisions.keys()) if (!source.paragraphs.some((p) => p.id === id)) throw new Error(`Unknown recitation paragraph: ${id}`);
let wordOffset = 0;
const units = source.paragraphs.flatMap((paragraph, paragraphIndex) => {
  const pieces = subdivisions.get(paragraph.id) ?? [{ english: paragraph.english, chinese: paragraph.chinese }];
  if (pieces.map((p) => p.english).join(" ").replace(/\s+/g, " ").trim() !== paragraph.english.replace(/\s+/g, " ").trim()) throw new Error(`${paragraph.id}: recitation split changed the original text`);
  return pieces.map((piece, index) => {
    const count = words(piece.english).length;
    if (!piece.chinese.trim() || !count || count > recitation.maxWords) throw new Error(`${paragraph.id}: invalid recitation unit (${count} words)`);
    const anchor = anchors.get(wordOffset);
    if (anchor === undefined) throw new Error(`${paragraph.id}.${index + 1}: missing exact first-word recording anchor at word ${wordOffset}`);
    wordOffset += count;
    return { id: `${paragraph.id}-${index + 1}`, ...piece, paragraphIndex, originalStart: spoken[anchor].start };
  });
});

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command}: ${result.stderr}`);
  return result.stdout.trim();
}
const durationOf = (file: string) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]));
const originalDuration = durationOf(original);
const sentenceBreaker = new Intl.Segmenter("en", { granularity: "sentence" });
const report: object[] = [];
for (const lesson of plan.lessons) {
  const paragraphs = source.paragraphs.slice(lesson.sourceParagraphStart - 1, lesson.sourceParagraphEnd);
  const wordCount = words(paragraphs.map((p) => p.english).join(" ")).length;
  if (wordCount !== lesson.wordCount || wordCount < 400 || wordCount > 500) throw new Error(`${lesson.slug}: invalid word count ${wordCount}`);
  const start = lesson.part === 1 ? 0 : paragraphStarts[lesson.sourceParagraphStart - 1];
  const end = paragraphStarts[lesson.sourceParagraphEnd] ?? originalDuration;
  const folder = path.resolve("public/audio/courses", lesson.slug);
  fs.mkdirSync(folder, { recursive: true });
  const audioFile = path.join(folder, "english.mp3");
  if (!segmentsOnly) run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", original, "-ss", String(start), "-t", String(end - start), "-map", "0:a:0", "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "96k", audioFile]);
  if (!fs.existsSync(audioFile)) throw new Error(`${lesson.slug}: --segments-only requires the existing original MP3`);
  const duration = durationOf(audioFile);
  const lessonUnits = units.filter((unit) => unit.paragraphIndex >= lesson.sourceParagraphStart - 1 && unit.paragraphIndex < lesson.sourceParagraphEnd);
  const content = lessonUnits.map((p) => {
    const sentences = Array.from(sentenceBreaker.segment(p.english), (s) => s.segment.trim());
    let cue = sentences.map((s, n) => n % 2 ? "______________________________" : s).join(" ");
    if (sentences.length === 1) {
      const tokens = [...p.english.matchAll(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g)];
      const visibleWords = Math.min(10, Math.max(1, Math.floor(tokens.length * 0.45)));
      cue = `${p.english.slice(0, tokens[visibleWords].index).trimEnd()} ______________________________`;
    }
    if (alignCueBlanks(cue, p.english).some((answer) => answer === null)) throw new Error(`${p.id}: Cue cannot be aligned`);
    return { id: p.id, chinese: p.chinese, english: p.english, cue };
  });
  const segments = lessonUnits.map((p, n) => {
    const segmentStart = n === 0 ? 0 : p.originalStart - start;
    const segmentEnd = n === lessonUnits.length - 1 ? duration : lessonUnits[n + 1].originalStart - start;
    if (segmentStart < 0 || segmentEnd <= segmentStart || segmentEnd > duration) throw new Error(`${p.id}: invalid recording boundary`);
    return { index: n + 1, text: p.english, start: segmentStart, end: segmentEnd, duration: segmentEnd - segmentStart };
  });
  const course = courseSchema.parse({ schemaVersion: 1, slug: lesson.slug, series: source.series,
    title: `斯坦福毕业演讲 ${lesson.part}/5 · ${lesson.title}`, orderIndex: 24 + lesson.part,
    sections: [{ id: "chinese", heading: "中文理解", paragraphs: content }, { id: "english", heading: "演讲原文", paragraphs: content }, { id: "cue", heading: "Cue Version", paragraphs: content }],
  });
  const manifest = { audio_file: "english.mp3", duration, source: { kind: "original-recording", page: origins.candidates[0].page, sha256: originalHash, start, end },
    alignment: { method: "whisper-tiny.en-word-anchors", referenceWordCoverage: coverage, humanReviewed: false, segmentationVersion: recitation.version }, segments };
  fs.writeFileSync(path.resolve("content/courses", `${lesson.slug}.json`), JSON.stringify(course, null, 2) + "\n");
  fs.writeFileSync(path.join(folder, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  const sizes = content.map((p) => words(p.english).length);
  report.push({ slug: lesson.slug, wordCount, originalStart: start, originalEnd: end, duration, segments: segments.length, wordsPerSegment: sizes, maxWordsPerSegment: Math.max(...sizes) });
}
fs.writeFileSync(path.join(root, segmentsOnly ? "recitation-report.json" : "preparation-report.json"), JSON.stringify({ status: "local-preview-not-human-reviewed", segmentationVersion: recitation.version, audioUnchanged: segmentsOnly, referenceWordCoverage: coverage, lessons: report }, null, 2) + "\n");
console.log(JSON.stringify({ referenceWordCoverage: coverage, lessons: report }, null, 2));
