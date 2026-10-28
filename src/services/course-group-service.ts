import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { appSettings, courseGroups, courses } from "@/db/schema";

export function getCourseGroups() {
  return db.select().from(courseGroups).orderBy(asc(courseGroups.orderIndex), asc(courseGroups.id)).all().map((group) => ({
    ...group, courseCount: db.select({ total: count() }).from(courses).where(eq(courses.groupId, group.id)).get()?.total ?? 0,
  }));
}

export function getActiveCourseGroup() {
  const setting = db.select().from(appSettings).where(eq(appSettings.key, "active_course_group")).get();
  const group = setting ? db.select().from(courseGroups).where(eq(courseGroups.id, setting.value)).get() : undefined;
  if (!group) throw new Error("当前课程组不存在，请在课程库重新选择。");
  return group;
}

export function setActiveCourseGroup(groupId: string) {
  if (typeof groupId !== "string" || !db.select().from(courseGroups).where(eq(courseGroups.id, groupId)).get()) throw new Error("课程组不存在。");
  db.insert(appSettings).values({ key: "active_course_group", value: groupId }).onConflictDoUpdate({ target: appSettings.key, set: { value: groupId } }).run();
}

export function assertActiveCourseGroup(groupId: string | null) {
  if (groupId !== getActiveCourseGroup().id) throw new Error("课程组已经切换，请回到当前课程组后再操作。");
}
