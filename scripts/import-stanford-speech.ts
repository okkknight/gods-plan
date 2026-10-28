import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { sqlite } from "../src/db/client";
import { importCourse } from "../src/domain/courses/import-course";
import { courseSchema } from "../src/domain/courses/course-schema";

async function main() {
  const report = JSON.parse(fs.readFileSync("content/speeches/steve-jobs-stanford-2005/preparation-report.json", "utf8"));
  const inputs = report.lessons.map((lesson: { slug: string }) => {
    const course = courseSchema.parse(JSON.parse(fs.readFileSync(path.join("content/courses", `${lesson.slug}.json`), "utf8")));
    if (!fs.existsSync(path.join("public/audio/courses", course.slug, "english.mp3"))) throw new Error(`Missing original audio: ${course.slug}`);
    return course;
  });
  const progressHash = () => createHash("sha256").update(JSON.stringify({
    progress: sqlite.prepare("SELECT * FROM course_progress ORDER BY course_id").all(),
    events: sqlite.prepare("SELECT * FROM study_events ORDER BY id").all(),
  })).digest("hex");
  const before = progressHash();
  const backup = `data/english-learning.db.pre-stanford-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  await sqlite.backup(backup);
  const results = sqlite.transaction(() => {
    const result = inputs.map((course: ReturnType<typeof courseSchema.parse>) => {
      const existing = sqlite.prepare("SELECT id FROM courses WHERE slug = ?").get(course.slug);
      if (existing) return { slug: course.slug, mode: "unchanged", ...existing };
      return importCourse(course);
    });
    if (progressHash() !== before) throw new Error("Learning data changed; rolling back");
    return result;
  })();
  console.log(JSON.stringify({ backup, learningDataHashBefore: before, learningDataHashAfter: progressHash(), results }, null, 2));
  sqlite.close();
}

main().catch((error) => { console.error(error); sqlite.close(); process.exitCode = 1; });
