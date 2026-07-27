import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { courseParagraphs, courseSections, courseProgress, courses } from "@/db/schema";
import type { SchedulableCourse } from "@/domain/scheduling/types";

export function getCourses(): SchedulableCourse[] {
  const rows = db.select({ course: courses, progress: courseProgress }).from(courses).leftJoin(courseProgress, eq(courses.id, courseProgress.courseId)).orderBy(asc(courses.orderIndex)).all();
  return rows.map(({ course, progress }) => ({ id: course.id, slug: course.slug, title: course.title, orderIndex: course.orderIndex, status: course.status, currentStage: progress?.currentStage, nextDueDate: progress?.nextDueDate, archivedFromStatus: course.archivedFromStatus }));
}

export function getCourse(id: number) {
  const course = db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course) return null;
  const sections = db.select().from(courseSections).where(eq(courseSections.courseId, id)).orderBy(asc(courseSections.orderIndex)).all();
  return { ...course, sections: sections.map((section) => ({ ...section, paragraphs: db.select().from(courseParagraphs).where(eq(courseParagraphs.sectionId, section.id)).orderBy(asc(courseParagraphs.orderIndex)).all() })) };
}

export function archiveCourse(id: number) {
  const course = db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course || course.status === "archived") throw new Error("课程不存在或已经归档");
  db.update(courses).set({ status: "archived", archivedFromStatus: course.status, updatedAt: new Date().toISOString() }).where(eq(courses.id, id)).run();
}

export function unarchiveCourse(id: number) {
  const course = db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course || course.status !== "archived") throw new Error("课程不存在或未归档");
  db.update(courses).set({ status: course.archivedFromStatus ?? "queued", archivedFromStatus: null, updatedAt: new Date().toISOString() }).where(eq(courses.id, id)).run();
}
