import fs from "node:fs";
import path from "node:path";
import { parseCourseMarkdown } from "../src/domain/courses/markdown-parser";

const seasonSourceDir = path.join(process.cwd(), "docs", "ModernFamily S01");
const sourceCandidates = [
  path.join(process.cwd(), "docs", "Modern_Family_S1E01-E24_Speaking_Course_MD", "episodes"),
  path.join(process.cwd(), "Modern_Family_S1E01-E24_Speaking_Course_MD", "episodes"),
];
const targetDir = path.join(process.cwd(), "content", "courses");
fs.mkdirSync(targetDir, { recursive: true });

type EpisodeBlock = { id: string; title: string; body: string };

function parseSeasonFile(filePath: string): EpisodeBlock[] {
  const markdown = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const matches = [...markdown.matchAll(/^#\s+Modern Family (S\d+E\d{2})\s+[—-]\s+(.+)$/gm)];
  if (matches.length === 0) throw new Error(`课程文件没有找到集标题：${filePath}`);
  return matches.map((match, index) => ({
    id: match[1],
    title: match[2].trim(),
    body: markdown.slice(match.index! + match[0].length, matches[index + 1]?.index ?? markdown.length)
      .replace(/^>.*\n/gm, "")
      .trim(),
  }));
}

function convertSeasonFolder() {
  const englishPath = path.join(seasonSourceDir, "Modern Family S01 Spoken English.md");
  const chinesePath = path.join(seasonSourceDir, "Modern_Family_Season_1_Chinese_Translation.md");
  const cuePath = path.join(seasonSourceDir, "Modern_Family_Season_1_Cue_Version.md");
  const [english, chinese, cue] = [englishPath, chinesePath, cuePath].map(parseSeasonFile);
  if (english.length !== 24 || chinese.length !== 24 || cue.length !== 24) {
    throw new Error(`ModernFamily S01 必须各包含 24 集：English=${english.length}, Chinese=${chinese.length}, Cue=${cue.length}`);
  }
  const chineseById = new Map(chinese.map((episode) => [episode.id, episode]));
  const cueById = new Map(cue.map((episode) => [episode.id, episode]));
  english.forEach((episode, index) => {
    const chineseEpisode = chineseById.get(episode.id);
    const cueEpisode = cueById.get(episode.id);
    if (!chineseEpisode || !cueEpisode || chineseEpisode.title !== episode.title || cueEpisode.title !== episode.title) {
      throw new Error(`三份课程文件的集数或标题不一致：${episode.id}`);
    }
    const source = [
      `# S${episode.id.slice(1)} — ${episode.title}`,
      "",
      "## 1. 中文剧情描述",
      "",
      chineseEpisode.body,
      "",
      "## 2. Spoken English 标准版",
      "",
      episode.body,
      "",
      "## 3. Cue Version",
      "",
      cueEpisode.body,
      "",
    ].join("\n");
    const course = parseCourseMarkdown(source, index + 1);
    fs.writeFileSync(path.join(targetDir, `${course.slug}.json`), `${JSON.stringify(course, null, 2)}\n`);
  });
  return english.length;
}

function convertLegacyFolder(sourceDir: string) {
  const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  files.forEach((file, index) => {
    const course = parseCourseMarkdown(fs.readFileSync(path.join(sourceDir, file), "utf8"), index + 1);
    fs.writeFileSync(path.join(targetDir, `${course.slug}.json`), `${JSON.stringify(course, null, 2)}\n`);
  });
  return files.length;
}

const sourceDir = sourceCandidates.find((candidate) => fs.existsSync(candidate));
const count = fs.existsSync(seasonSourceDir)
  ? convertSeasonFolder()
  : sourceDir
    ? convertLegacyFolder(sourceDir)
    : (() => { throw new Error("找不到课程 Markdown：请将 ModernFamily S01 放在 docs/ModernFamily S01/。"); })();
console.log(`Converted ${count} courses`);
