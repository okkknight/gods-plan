import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { courseProgress, courses, studyEvents } from "@/db/schema";
import { completeStage } from "@/domain/scheduling/complete-stage";
import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";

export function completeCourseStage(courseId: number, expectedStage: number, today = getTodayInAppTimezone()) {
  return db.transaction((tx) => {
    const course = tx.select().from(courses).where(eq(courses.id, courseId)).get();
    if (!course || course.status === "archived") throw new Error("无法完成：课程不存在或已归档。");
    const progress = tx.select().from(courseProgress).where(eq(courseProgress.courseId, courseId)).get();
    const currentStage = progress?.currentStage ?? (course.status === "queued" ? 0 : null);
    if (currentStage === null || currentStage !== expectedStage) throw new Error("无法完成：该课程当前阶段已经发生变化，请刷新页面后重试。");
    const scheduledDate = currentStage === 0 ? today : progress?.nextDueDate;
    if (!scheduledDate || scheduledDate > today) throw new Error("无法完成：这不是今天到期的任务。");
    const completedAt = new Date().toISOString();
    tx.insert(studyEvents).values({ courseId, stage: currentStage, scheduledDate, completedDate: today, completedAt, createdAt: completedAt }).run();
    const result = completeStage({ currentStage, completedDate: today });
    if (result.type === "course-completed") {
      tx.delete(courseProgress).where(eq(courseProgress.courseId, courseId)).run();
      tx.update(courses).set({ status: "completed", updatedAt: completedAt }).where(eq(courses.id, courseId)).run();
    } else {
      tx.insert(courseProgress).values({ courseId, currentStage: result.nextStage, nextDueDate: result.nextDueDate, startedDate: progress?.startedDate ?? today, lastCompletedDate: today, completedDate: null, updatedAt: completedAt }).onConflictDoUpdate({ target: courseProgress.courseId, set: { currentStage: result.nextStage, nextDueDate: result.nextDueDate, startedDate: progress?.startedDate ?? today, lastCompletedDate: today, updatedAt: completedAt } }).run();
      tx.update(courses).set({ status: "active", updatedAt: completedAt }).where(eq(courses.id, courseId)).run();
    }
    return result;
  });
}

export function undoTodayCompletion(courseId: number, today = getTodayInAppTimezone()) {
  return db.transaction((tx) => {
    const course = tx.select().from(courses).where(eq(courses.id, courseId)).get();
    const latest = tx.select().from(studyEvents).where(eq(studyEvents.courseId, courseId)).orderBy(desc(studyEvents.id)).get();
    if (!course || !latest || latest.completedDate !== today) throw new Error("只能撤销今天最新完成的任务。");
    const newer = tx.select().from(studyEvents).where(and(eq(studyEvents.courseId, courseId), lte(studyEvents.id, latest.id))).orderBy(desc(studyEvents.id)).all();
    if (newer[0]?.id !== latest.id) throw new Error("只能撤销该课程最新的一条完成记录。");
    tx.delete(studyEvents).where(eq(studyEvents.id, latest.id)).run();
    const previous = tx.select().from(studyEvents).where(eq(studyEvents.courseId, courseId)).orderBy(desc(studyEvents.id)).get();
    if (!previous) {
      tx.delete(courseProgress).where(eq(courseProgress.courseId, courseId)).run();
      tx.update(courses).set({ status: "queued", updatedAt: new Date().toISOString() }).where(eq(courses.id, courseId)).run();
    } else {
      const now = new Date().toISOString();
      tx.insert(courseProgress).values({ courseId, currentStage: latest.stage, nextDueDate: latest.scheduledDate, startedDate: previous.completedDate, lastCompletedDate: previous.completedDate, completedDate: null, updatedAt: now }).onConflictDoUpdate({ target: courseProgress.courseId, set: { currentStage: latest.stage, nextDueDate: latest.scheduledDate, lastCompletedDate: previous.completedDate, completedDate: null, updatedAt: now } }).run();
      tx.update(courses).set({ status: "active", updatedAt: now }).where(eq(courses.id, courseId)).run();
    }
  });
}

export function getStudyEvents() { return db.select().from(studyEvents).orderBy(desc(studyEvents.completedAt)).all(); }
