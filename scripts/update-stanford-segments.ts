import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { sqlite } from "../src/db/client";
import { courseSchema } from "../src/domain/courses/course-schema";

// Update paragraph content only. Course identity, group, status and learner data
// are intentionally excluded, including when the current group is different.
async function main() {
  const lessons = Array.from({ length: 5 }, (_, index) => {
    const slug = `steve-jobs-stanford-2005-part-${index + 1}`;
    return courseSchema.parse(JSON.parse(fs.readFileSync(path.join("content/courses", `${slug}.json`), "utf8")));
  });
  const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const learnerData = () => ({ progress: sqlite.prepare("SELECT * FROM course_progress ORDER BY course_id").all(), events: sqlite.prepare("SELECT * FROM study_events ORDER BY id").all() });
  const courseData = () => sqlite.prepare("SELECT * FROM courses ORDER BY id").all();
  const settings = () => sqlite.prepare("SELECT * FROM app_settings ORDER BY key").all();
  const before = { learning: fingerprint(learnerData()), courses: fingerprint(courseData()), settings: fingerprint(settings()) };
  const backup = `data/english-learning.db.pre-stanford-resegmentation-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  await sqlite.backup(backup);
  const updated = sqlite.transaction(() => {
    const result = lessons.map((lesson) => {
      const course = sqlite.prepare("SELECT id FROM courses WHERE slug = ?").get(lesson.slug) as { id: number } | undefined;
      if (!course) throw new Error(`Missing existing course: ${lesson.slug}`);
      for (const section of lesson.sections) {
        const existing = sqlite.prepare("SELECT id FROM course_sections WHERE course_id = ? AND section_key = ?").get(course.id, section.id) as { id: number } | undefined;
        if (!existing) throw new Error(`Missing section: ${lesson.slug}/${section.id}`);
        sqlite.prepare("DELETE FROM course_paragraphs WHERE section_id = ?").run(existing.id);
        section.paragraphs.forEach((paragraph, index) => {
          sqlite.prepare("INSERT INTO course_paragraphs (section_id,paragraph_key,chinese,english,cue,order_index) VALUES (?,?,?,?,?,?)").run(existing.id, paragraph.id, paragraph.chinese, paragraph.english, paragraph.cue, index);
        });
      }
      return { id: course.id, slug: lesson.slug, segments: lesson.sections[1].paragraphs.length };
    });
    if (fingerprint(learnerData()) !== before.learning || fingerprint(courseData()) !== before.courses || fingerprint(settings()) !== before.settings) throw new Error("Course state, group selection or learning data changed; rolling back");
    return result;
  }).immediate();
  console.log(JSON.stringify({ backup, originalCourseStatePreserved: true, originalGroupSelectionPreserved: true, learningDataHash: before.learning, updated }, null, 2));
  sqlite.close();
}
main().catch((error) => { console.error(error); sqlite.close(); process.exitCode = 1; });
