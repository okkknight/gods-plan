import fs from "node:fs";
import path from "node:path";

type Episode = { code: string; title: string; body: string };
type Course = {
  season: number;
  episode: number;
  title: string;
  sections: Array<{ paragraphs: Array<{ chinese: string; english: string; cue: string }> }>;
};

const sourceDirectory = path.join(process.cwd(), "docs", "ModernFamily S01");
const sourceFiles = {
  chinese: path.join(sourceDirectory, "Combined_Chinese_E09-E24.md"),
  cue: path.join(sourceDirectory, "Combined_Cue_E09-E24.md"),
  english: path.join(sourceDirectory, "Combined_English_E09-E24.md"),
};

function parseEpisodes(filePath: string): Episode[] {
  const source = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const headings = [...source.matchAll(/^#\s+Modern Family (S\d+E\d{2})\s+[—-]\s+(.+)$/gm)];
  if (headings.length !== 16) throw new Error(`${path.basename(filePath)} 应包含 16 集，实际为 ${headings.length}`);
  return headings.map((heading, index) => ({
    code: heading[1],
    title: heading[2].trim(),
    body: source.slice(heading.index! + heading[0].length, headings[index + 1]?.index ?? source.length)
      .replace(/^>.*\n/gm, "")
      .trim(),
  }));
}

const sources = Object.fromEntries(Object.entries(sourceFiles).map(([key, file]) => [key, parseEpisodes(file)])) as Record<keyof typeof sourceFiles, Episode[]>;
const expectedCodes = Array.from({ length: 16 }, (_, index) => `S01E${String(index + 9).padStart(2, "0")}`);

for (const code of expectedCodes) {
  const parts = (Object.keys(sources) as Array<keyof typeof sources>).map((key) => sources[key].find((episode) => episode.code === code));
  if (parts.some((episode) => !episode)) throw new Error(`${code} 在三份来源文件中不完整`);
  if (new Set(parts.map((episode) => episode!.title)).size !== 1) throw new Error(`${code} 的标题不一致`);

  const [chinese, cue, english] = parts as [Episode, Episode, Episode];
  const episodeNumber = Number(code.slice(-2));
  const slug = `modern-family-s01e${String(episodeNumber).padStart(2, "0")}`;
  const coursePath = path.join(process.cwd(), "content", "courses", `${slug}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8")) as Course;
  if (course.season !== 1 || course.episode !== episodeNumber || course.title !== english.title) {
    throw new Error(`${code} 与现有课程元数据不一致`);
  }
  course.sections.forEach((section) => section.paragraphs.forEach((paragraph) => {
    paragraph.chinese = chinese.body;
    paragraph.english = english.body;
    paragraph.cue = cue.body;
  }));
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
  console.log(`Updated ${code}: ${slug}`);
}
