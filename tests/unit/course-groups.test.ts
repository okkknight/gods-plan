import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ensureCourseGroups } from "@/db/course-group-migration";

describe("legacy course grouping migration", () => {
  it("adds memberships without changing existing course data and is repeatable", () => {
    const db = new Database(":memory:");
    try {
      db.pragma("foreign_keys = ON");
      db.exec("CREATE TABLE courses (id INTEGER PRIMARY KEY, slug TEXT, series TEXT, status TEXT); INSERT INTO courses VALUES (1,'modern-family-s01e01','Modern Family','active'),(2,'steve-jobs-stanford-2005-part-1','乔布斯','queued')");
      const before = db.prepare("SELECT id,slug,series,status FROM courses ORDER BY id").all();
      ensureCourseGroups(db);
      expect(db.prepare("SELECT id,slug,series,status FROM courses ORDER BY id").all()).toEqual(before);
      expect(db.prepare("SELECT group_id FROM courses ORDER BY id").all()).toEqual([{ group_id: "modern-family" }, { group_id: "steve-jobs-stanford-2005" }]);
      db.prepare("UPDATE app_settings SET value=? WHERE key='active_course_group'").run("steve-jobs-stanford-2005");
      ensureCourseGroups(db);
      expect(db.prepare("SELECT value FROM app_settings WHERE key='active_course_group'").get()).toEqual({ value: "steve-jobs-stanford-2005" });
      expect(db.pragma("foreign_key_check")).toEqual([]);
    } finally { db.close(); }
  });
});

describe("independent course-group planning and progression", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "godsplan-groups-"));
  const previousUrl = process.env.DATABASE_URL;
  let sqlite: typeof import("@/db/client").sqlite;
  let groups: typeof import("@/services/course-group-service");
  let dashboard: typeof import("@/services/dashboard-service");
  let calendar: typeof import("@/services/calendar-service");
  let study: typeof import("@/services/study-service");
  let courseService: typeof import("@/services/course-service");
  let importer: typeof import("@/domain/courses/import-course");
  let ids: number[];
  const today = "2026-10-16";
  const input = (slug: string, orderIndex: number) => ({ schemaVersion: 1, slug, title: slug, orderIndex, sections: [{ id: "english", paragraphs: [{ id: "p", chinese: "中文", english: "Original words.", cue: "Original _____." }] }] });

  beforeAll(async () => {
    process.env.DATABASE_URL = path.join(directory, "test.db");
    await import("@/db/migrate");
    ({ sqlite } = await import("@/db/client"));
    groups = await import("@/services/course-group-service");
    dashboard = await import("@/services/dashboard-service");
    calendar = await import("@/services/calendar-service");
    study = await import("@/services/study-service");
    courseService = await import("@/services/course-service");
    importer = await import("@/domain/courses/import-course");
  });
  beforeEach(() => {
    sqlite.exec("DELETE FROM study_events; DELETE FROM course_progress; DELETE FROM course_paragraphs; DELETE FROM course_sections; DELETE FROM courses");
    groups.setActiveCourseGroup("modern-family");
    ids = ["modern-family-s01e01", "modern-family-s01e02", "steve-jobs-stanford-2005-part-1", "steve-jobs-stanford-2005-part-2"].map((slug, i) => importer.importCourse(input(slug, i + 1)).courseId);
  });
  afterAll(() => {
    sqlite?.close();
    if (previousUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousUrl;
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it("defaults to Modern Family and only lists its own courses", () => {
    expect(groups.getActiveCourseGroup().id).toBe("modern-family");
    expect(courseService.getCourses().map((c) => c.id)).toEqual(ids.slice(0, 2));
    expect(groups.getCourseGroups().map((g) => g.courseCount)).toEqual([2, 2]);
    expect(dashboard.getTodayDashboard(today).tasks.newCourse?.id).toBe(ids[0]);
  });

  it("keeps daily new-course quotas, completions and tomorrow's reviews separate", () => {
    study.completeCourseStage(ids[0], 0, today);
    expect(dashboard.getTodayDashboard(today).tasks.newCourse).toBeNull();
    groups.setActiveCourseGroup("steve-jobs-stanford-2005");
    expect(dashboard.getTodayDashboard(today).tasks.newCourse?.id).toBe(ids[2]);
    expect(dashboard.getTodayDashboard(today).tasks.completedToday).toHaveLength(0);
    study.completeCourseStage(ids[2], 0, today);
    const jobs = dashboard.getTodayDashboard(today);
    expect(jobs.tasks.newCourse).toBeNull();
    expect(jobs.tasks.completedToday.map((event) => event.courseId)).toEqual([ids[2]]);
    const future = calendar.getTasksForDate("2026-10-17", today);
    expect(future.mode).toBe("future");
    if (future.mode === "future") {
      expect(future.tasks.some((task) => task.courseId === ids[2])).toBe(true);
      expect(future.tasks.every((task) => ids.slice(2).includes(task.courseId))).toBe(true);
    }
    groups.setActiveCourseGroup("modern-family");
    expect(dashboard.getTodayDashboard("2026-10-17").tasks.reviewTasks.map((c) => c.id)).toEqual([ids[0]]);
    expect(dashboard.getTodayDashboard("2026-10-17").tasks.newCourse?.id).toBe(ids[1]);
  });

  it("filters historical records by group without deleting another group's history", () => {
    study.completeCourseStage(ids[0], 0, today);
    groups.setActiveCourseGroup("steve-jobs-stanford-2005");
    expect(calendar.getTasksForDate(today, "2026-10-17").events).toHaveLength(0);
    study.completeCourseStage(ids[2], 0, today);
    expect(calendar.getTasksForDate(today, "2026-10-17").events.map((e) => e.courseId)).toEqual([ids[2]]);
    groups.setActiveCourseGroup("modern-family");
    expect(calendar.getTasksForDate(today, "2026-10-17").events.map((e) => e.courseId)).toEqual([ids[0]]);
    expect(sqlite.prepare("SELECT count(*) AS n FROM study_events").get()).toEqual({ n: 2 });
  });

  it("rejects stale-page mutations against an inactive group", () => {
    study.completeCourseStage(ids[0], 0, today);
    groups.setActiveCourseGroup("steve-jobs-stanford-2005");
    expect(() => study.completeCourseStage(ids[1], 0, today)).toThrow("课程组已经切换");
    expect(() => study.undoTodayCompletion(ids[0], today)).toThrow("课程组已经切换");
    expect(() => courseService.archiveCourse(ids[1])).toThrow("课程组已经切换");
    expect(() => importer.importCourse(input("modern-family-s01e01", 1), "update", "steve-jobs-stanford-2005")).toThrow("其他组");
    expect(sqlite.prepare("SELECT count(*) AS n FROM study_events").get()).toEqual({ n: 1 });
  });

  it("persists the selection across migration checks and rejects unknown groups", () => {
    groups.setActiveCourseGroup("steve-jobs-stanford-2005");
    ensureCourseGroups(sqlite);
    expect(groups.getActiveCourseGroup().id).toBe("steve-jobs-stanford-2005");
    expect(() => groups.setActiveCourseGroup("does-not-exist")).toThrow("不存在");
    expect(groups.getActiveCourseGroup().id).toBe("steve-jobs-stanford-2005");
  });

  it("does not automatically start another group when the current group is complete", () => {
    sqlite.prepare("UPDATE courses SET status='completed' WHERE group_id=?").run("modern-family");
    const tasks = dashboard.getTodayDashboard(today).tasks;
    expect(tasks.newCourse).toBeNull();
    expect(tasks.reviewTasks).toHaveLength(0);
    groups.setActiveCourseGroup("steve-jobs-stanford-2005");
    expect(dashboard.getTodayDashboard(today).tasks.newCourse?.id).toBe(ids[2]);
  });

  it("imports into the selected group and preserves membership on subsequent updates", () => {
    const course = input("new-lesson", 10);
    const result = importer.importCourse(course, "create", "steve-jobs-stanford-2005");
    importer.importCourse({ ...course, series: "A different series", title: "Updated" }, "update");
    expect(courseService.getCourse(result.courseId)?.groupId).toBe("steve-jobs-stanford-2005");
  });
});
