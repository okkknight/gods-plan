import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  series: text("series"),
  season: integer("season"),
  episode: integer("episode"),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull(),
  status: text("status", { enum: ["queued", "active", "completed", "archived"] }).notNull().default("queued"),
  archivedFromStatus: text("archived_from_status", { enum: ["queued", "active", "completed"] }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const courseSections = sqliteTable("course_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  sectionKey: text("section_key").notNull(),
  heading: text("heading"),
  orderIndex: integer("order_index").notNull(),
}, (table) => ({ uniqueCourseSection: uniqueIndex("course_section_key_idx").on(table.courseId, table.sectionKey) }));

export const courseParagraphs = sqliteTable("course_paragraphs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sectionId: integer("section_id").notNull().references(() => courseSections.id, { onDelete: "cascade" }),
  paragraphKey: text("paragraph_key").notNull(),
  chinese: text("chinese").notNull(),
  english: text("english").notNull(),
  cue: text("cue").notNull(),
  orderIndex: integer("order_index").notNull(),
}, (table) => ({ uniqueSectionParagraph: uniqueIndex("section_paragraph_key_idx").on(table.sectionId, table.paragraphKey) }));

export const courseProgress = sqliteTable("course_progress", {
  courseId: integer("course_id").primaryKey().references(() => courses.id, { onDelete: "cascade" }),
  currentStage: integer("current_stage").notNull(),
  nextDueDate: text("next_due_date"),
  startedDate: text("started_date"),
  lastCompletedDate: text("last_completed_date"),
  completedDate: text("completed_date"),
  updatedAt: text("updated_at").notNull(),
});

export const studyEvents = sqliteTable("study_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  stage: integer("stage").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  completedDate: text("completed_date").notNull(),
  completedAt: text("completed_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => ({ uniqueCourseStage: uniqueIndex("study_event_course_stage_idx").on(table.courseId, table.stage) }));
