import fs from "node:fs";
import path from "node:path";

const episodesDir = path.resolve("docs/Modern_Family_S1E01-E24_Speaking_Course_MD/episodes");
const blank = "______________________________";

function splitSentences(paragraph: string): string[] {
  // Keep closing quotation marks and Markdown emphasis with the sentence
  // (for example: **“Title.”** This ...), instead of leaving them visible
  // outside a blank.
  const sentences: string[] = paragraph.match(/[^.!?]+[.!?]+["'”’»)]?\*{0,2}(?=\s|$)/g) ?? [];
  const consumed = sentences.join("");
  if (consumed.length < paragraph.length) {
    sentences.push(paragraph.slice(consumed.length));
  }
  return sentences.filter(Boolean);
}

function replaceCue(markdown: string): string {
  const english = markdown
    .split("## 2. Spoken English 标准版\n\n")[1]
    .split("\n\n---\n\n## 3. Cue Version")[0];
  const paragraphs = english.split(/\n\n+/).filter(Boolean);
  const sentenceGroups = paragraphs.map(splitSentences);
  const candidates = sentenceGroups.flatMap((sentences, paragraphIndex) =>
    sentences.slice(1).map((sentence, sentenceIndex) => ({
      paragraphIndex,
      sentenceIndex: sentenceIndex + 1,
      length: sentence.length,
    })),
  );

  const totalLength = english.length;
  const target = totalLength * 0.5;
  const selected = new Set<string>();
  let blankLength = 0;

  // Every paragraph keeps its first sentence as the relationship/story cue,
  // while its next sentence becomes a substantial recall block.
  for (const group of sentenceGroups) {
    if (group.length < 2) continue;
    const paragraphIndex = sentenceGroups.indexOf(group);
    const candidate = candidates.find(
      (item) => item.paragraphIndex === paragraphIndex && item.sentenceIndex === 1,
    );
    if (!candidate) continue;
    selected.add(`${candidate.paragraphIndex}:${candidate.sentenceIndex}`);
    blankLength += candidate.length;
  }

  // Add complete sentences until the total removed content is close to 50%.
  // Choosing whole sentences avoids fragmented, low-value word blanks.
  while (blankLength / totalLength < 0.47) {
    const remaining = candidates.filter(
      (item) => !selected.has(`${item.paragraphIndex}:${item.sentenceIndex}`),
    );
    if (remaining.length === 0) break;
    remaining.sort(
      (a, b) =>
        Math.abs(target - (blankLength + a.length)) -
        Math.abs(target - (blankLength + b.length)),
    );
    const candidate = remaining[0];
    selected.add(`${candidate.paragraphIndex}:${candidate.sentenceIndex}`);
    blankLength += candidate.length;
  }

  const cue = sentenceGroups
    .map((sentences, paragraphIndex) =>
      sentences
        .map((sentence, sentenceIndex) => {
          const key = `${paragraphIndex}:${sentenceIndex}`;
          if (!selected.has(key)) return sentence.trim();
          // The punctuation belongs to the recalled sentence as well; hiding
          // it prevents stray dots from becoming visible text between blanks.
          return blank;
        })
        .join(" "),
    )
    .join("\n\n");

  return markdown.replace(
    /(## 3\. Cue Version\n\n)[\s\S]*?(\n\n---\n\n## 4\. 本集可迁移口语表达)/,
    `$1${cue}$2`,
  );
}

for (const filename of fs.readdirSync(episodesDir).filter((file) => file.endsWith(".md")).sort()) {
  const filePath = path.join(episodesDir, filename);
  const markdown = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, replaceCue(markdown));
}

console.log(`Rebuilt Cue Version from Spoken English for ${fs.readdirSync(episodesDir).filter((file) => file.endsWith(".md")).length} episodes`);
