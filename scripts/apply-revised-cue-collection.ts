import fs from "node:fs";
import path from "node:path";

const collectionPath = path.resolve("docs/Modern_Family_S1E01-E24_Revised_Cue_Collection.md");
const episodesDir = path.resolve("docs/Modern_Family_S1E01-E24_Speaking_Course_MD/episodes");
const collection = fs.readFileSync(collectionPath, "utf8");
const sections = collection
  .split(/^## (?=S01E\d{2} — )/m)
  .slice(1)
  .map((section) => {
    const match = section.match(/^(S01E(\d{2})) — .+\n\n([\s\S]*)$/);
    if (!match) throw new Error("Invalid revised Cue section heading");
    return match;
  });

function normalizeBlanks(text: string) {
  // Preserve the collection's original full-width underline groups and spaces.
  return text.trim();
}

const episodeFiles = fs.readdirSync(episodesDir).filter((file) => file.endsWith(".md"));
if (sections.length !== 24) throw new Error(`Expected 24 revised Cue sections, found ${sections.length}`);

for (const match of sections) {
  const episodeCode = match[1];
  const file = episodeFiles.find((candidate) => candidate.startsWith(`${episodeCode}_`));
  if (!file) throw new Error(`No Markdown episode found for ${episodeCode}`);
  const filePath = path.join(episodesDir, file);
  const markdown = fs.readFileSync(filePath, "utf8");
  const cue = normalizeBlanks(match[3].replace(/\n---\s*$/, ""));
  const updated = markdown.replace(
    /(## 3\. Cue Version\n\n)[\s\S]*?(\n\n---\n\n## 4\. 本集可迁移口语表达)/,
    `$1${cue}$2`,
  );
  if (updated === markdown) throw new Error(`Cue section not replaced for ${episodeCode}`);
  fs.writeFileSync(filePath, updated);
}

console.log(`Applied revised Cue collection to ${sections.length} episodes`);
