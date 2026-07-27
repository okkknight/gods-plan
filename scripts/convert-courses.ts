import fs from "node:fs";
import path from "node:path";
import { parseCourseMarkdown } from "../src/domain/courses/markdown-parser";

const sourceDir = path.join(process.cwd(), "Modern_Family_S1E01-E24_Speaking_Course_MD", "episodes");
const targetDir = path.join(process.cwd(), "content", "courses");
fs.mkdirSync(targetDir, { recursive: true });
const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
files.forEach((file, index) => {
  const course = parseCourseMarkdown(fs.readFileSync(path.join(sourceDir, file), "utf8"), index + 1);
  fs.writeFileSync(path.join(targetDir, `${course.slug}.json`), `${JSON.stringify(course, null, 2)}\n`);
});
console.log(`Converted ${files.length} courses`);
