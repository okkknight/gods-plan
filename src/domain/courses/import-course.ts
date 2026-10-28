import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { courseGroups, courseParagraphs, courseSections, courses } from "@/db/schema";
import { courseSchema, type CourseInput } from "./course-schema";
import { inferCourseGroup } from "./course-group";

export type ImportMode = "create" | "update";

export function importCourse(input: unknown, mode: ImportMode = "create", targetGroupId?: string) {
  const course = courseSchema.parse(input);
  const now = new Date().toISOString();
  return db.transaction((tx) => {
    const existing = tx.select().from(courses).where(eq(courses.slug, course.slug)).get();
    if (existing && mode !== "update") throw new Error("课程已存在。如需更新内容，请使用更新模式。");
    if (existing && targetGroupId && existing.groupId !== targetGroupId) throw new Error("不能从当前课程组更新其他组的课程。");
    const inferredGroup = inferCourseGroup(course);
    const groupId = existing?.groupId ?? targetGroupId ?? inferredGroup.id;
    if (targetGroupId && !tx.select().from(courseGroups).where(eq(courseGroups.id, targetGroupId)).get()) throw new Error("课程组不存在。");
    if (!targetGroupId && !existing) tx.insert(courseGroups).values(inferredGroup).onConflictDoNothing().run();
    let courseId: number;
    if (existing) {
      tx.update(courses).set({ series: course.series ?? null, season: course.season ?? null, episode: course.episode ?? null, title: course.title, orderIndex: course.orderIndex, updatedAt: now }).where(eq(courses.id, existing.id)).run();
      tx.delete(courseSections).where(eq(courseSections.courseId, existing.id)).run();
      courseId = existing.id;
    } else {
      const inserted = tx.insert(courses).values({ slug: course.slug, groupId, series: course.series ?? null, season: course.season ?? null, episode: course.episode ?? null, title: course.title, orderIndex: course.orderIndex, status: "queued", createdAt: now, updatedAt: now }).returning({ id: courses.id }).get();
      courseId = inserted.id;
    }
    course.sections.forEach((section, sectionIndex) => {
      const insertedSection = tx.insert(courseSections).values({ courseId, sectionKey: section.id, heading: section.heading ?? null, orderIndex: sectionIndex }).returning({ id: courseSections.id }).get();
      tx.insert(courseParagraphs).values(section.paragraphs.map((paragraph, paragraphIndex) => ({ sectionId: insertedSection.id, paragraphKey: paragraph.id, chinese: paragraph.chinese, english: paragraph.english, cue: paragraph.cue, orderIndex: paragraphIndex }))).run();
    });
    return { courseId, slug: course.slug, mode: existing ? "updated" : "created" } as const;
  });
}
