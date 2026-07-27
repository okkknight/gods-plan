import { sqlite } from "./client";

sqlite.exec(`
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  series TEXT,
  season INTEGER,
  episode INTEGER,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  archived_from_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS courses_order_idx ON courses(order_index);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE TABLE IF NOT EXISTS course_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  heading TEXT,
  order_index INTEGER NOT NULL,
  UNIQUE(course_id, section_key)
);
CREATE TABLE IF NOT EXISTS course_paragraphs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  paragraph_key TEXT NOT NULL,
  chinese TEXT NOT NULL,
  english TEXT NOT NULL,
  cue TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE(section_id, paragraph_key)
);
CREATE TABLE IF NOT EXISTS course_progress (
  course_id INTEGER PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  current_stage INTEGER NOT NULL,
  next_due_date TEXT,
  started_date TEXT,
  last_completed_date TEXT,
  completed_date TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS study_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  scheduled_date TEXT NOT NULL,
  completed_date TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(course_id, stage)
);
`);

if (import.meta.url === `file://${process.argv[1]}`) console.log("Database migrated");
