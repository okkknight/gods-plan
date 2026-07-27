import { courseSchema, type CourseInput } from "./course-schema";

function extractSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+\d+\.\s+/.test(line) && line.replace(/^##\s+\d+\.\s+/, "").trim() === heading);
  if (start < 0) throw new Error(`Missing course section: ${heading}`);
  const end = lines.findIndex((line, index) => index > start && /^##\s+\d+\.\s+/.test(line));
  return lines.slice(start + 1, end < 0 ? lines.length : end).join("\n").trim();
}

function cleanMarkdown(value: string): string {
  return value.replace(/^>.*\n/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function parseCourseMarkdown(markdown: string, orderIndex: number): CourseInput {
  const titleMatch = markdown.match(/^#\s+S(\d+)E(\d+)\s+[—-]\s+(.+)$/m);
  if (!titleMatch) throw new Error("Course Markdown must begin with an episode title");
  const season = Number(titleMatch[1]);
  const episode = Number(titleMatch[2]);
  const title = titleMatch[3].trim();
  const chinese = cleanMarkdown(extractSection(markdown, "中文剧情描述"));
  const english = cleanMarkdown(extractSection(markdown, "Spoken English 标准版"));
  const cue = cleanMarkdown(extractSection(markdown, "Cue Version"));
  const slug = `modern-family-s${String(season).padStart(2, "0")}e${String(episode).padStart(2, "0")}`;
  return courseSchema.parse({
    schemaVersion: 1, slug, series: "Modern Family", season, episode, title, orderIndex,
    sections: [
      { id: "chinese", heading: "中文剧情描述", paragraphs: [{ id: "main", chinese, english, cue }] },
      { id: "english", heading: "Spoken English 标准版", paragraphs: [{ id: "main", chinese, english, cue }] },
      { id: "cue", heading: "Cue Version", paragraphs: [{ id: "main", chinese, english, cue }] },
    ],
  });
}
