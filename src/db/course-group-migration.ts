import type Database from "better-sqlite3";
import { inferCourseGroup } from "../domain/courses/course-group";

export function ensureCourseGroups(sqlite: Database.Database) {
  if (!sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'courses'").get()) return;
  sqlite.transaction(() => {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS course_groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, order_index INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT OR IGNORE INTO course_groups VALUES ('modern-family', '摩登家庭 · 第一季', 1);
      INSERT OR IGNORE INTO course_groups VALUES ('steve-jobs-stanford-2005', '乔布斯 · 斯坦福毕业演讲', 2);
    `);
    const columns = sqlite.pragma("table_info(courses)") as { name: string }[];
    if (!columns.some((column) => column.name === "group_id")) sqlite.exec("ALTER TABLE courses ADD COLUMN group_id TEXT REFERENCES course_groups(id)");
    const ungrouped = sqlite.prepare("SELECT id, slug, series FROM courses WHERE group_id IS NULL").all() as { id: number; slug: string; series: string | null }[];
    for (const course of ungrouped) {
      const group = inferCourseGroup(course);
      sqlite.prepare("INSERT OR IGNORE INTO course_groups (id, name, order_index) VALUES (?, ?, ?)").run(group.id, group.name, group.orderIndex);
      sqlite.prepare("UPDATE courses SET group_id = ? WHERE id = ?").run(group.id, course.id);
    }
    sqlite.exec("CREATE INDEX IF NOT EXISTS courses_group_idx ON courses(group_id)");
    sqlite.prepare("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('active_course_group', 'modern-family')").run();
  }).immediate();
}
