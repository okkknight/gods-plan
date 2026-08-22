import fs from "node:fs";
import path from "node:path";

type Course = {
  episode: number;
  sections: Array<{ id: string; paragraphs: Array<{ cue: string }> }>;
};

const episodeCode = process.argv[2];
const sourceArgumentIndex = process.argv.indexOf("--source");
const sourcePath = sourceArgumentIndex >= 0
  ? path.resolve(process.argv[sourceArgumentIndex + 1] ?? "")
  : path.join(process.cwd(), "docs", "ModernFamily S01", "Modern_Family_Season_1_Cue_Version_Final_Synced.md");

if (!/^S\d+E\d{2}$/.test(episodeCode ?? "")) {
  throw new Error("Usage: tsx scripts/apply-synced-cue.ts S01E06 [--source path/to/cue.md]");
}
if (!fs.existsSync(sourcePath)) throw new Error(`Cue 来源文件不存在：${sourcePath}`);

const source = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
const headings = [...source.matchAll(/^#\s+Modern Family (S\d+E\d{2})\s+[—-]\s+(.+)$/gm)];
const index = headings.findIndex((heading) => heading[1] === episodeCode);
if (index < 0) throw new Error(`同步 Cue 文件中找不到 ${episodeCode}`);

const cue = source.slice(headings[index].index! + headings[index][0].length, headings[index + 1]?.index ?? source.length)
  .replace(/^>.*\n/gm, "")
  .trim();
if (!cue) throw new Error(`${episodeCode} 的 Cue 内容为空`);

const slug = `modern-family-${episodeCode.toLowerCase()}`;
const coursePath = path.join(process.cwd(), "content", "courses", `${slug}.json`);
const course = JSON.parse(fs.readFileSync(coursePath, "utf8")) as Course;
const expectedEpisode = Number(episodeCode.slice(-2));
if (course.episode !== expectedEpisode) throw new Error(`课程文件与指定集数不一致：S01E${String(course.episode).padStart(2, "0")}`);

const cueSection = course.sections.find((section) => section.id === "cue");
if (!cueSection?.paragraphs.length) throw new Error(`${episodeCode} 缺少 Cue 区块`);
course.sections.forEach((section) => section.paragraphs.forEach((paragraph) => { paragraph.cue = cue; }));

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(`Applied synced Cue to ${episodeCode}: ${cue.length} characters`);
