# English Speaking Review App Design

**Goal:** Build a local, single-user speaking-course review planner from the supplied 24 Modern Family Markdown lessons.

## Product shape

The app has four views: Today, Calendar, Course Reader, and Library. It stores one active due stage per course and derives later review dates from the actual completion date. Only today's tasks can be completed or undone; past dates show facts and future dates show an in-memory forecast.

## Architecture

Next.js App Router provides server-rendered pages and route handlers. Domain scheduling is pure TypeScript and receives an explicit business date, so it is independent of React, the database, and the system clock. Drizzle owns a SQLite schema for courses, sections, paragraphs, progress, and study events. All writes run inside transactions and re-check the current state.

The supplied Markdown remains source content. A deterministic parser maps each episode's three content sections into aligned paragraphs: the Chinese and English sections are split by blank-line paragraphs; Cue headings become sections and cue bullets are retained as cue text. If a Cue section has fewer structural paragraphs than English, the importer keeps the cue content in a final aligned section rather than dropping it.

## Decisions

- Local SQLite at `data/english-learning.db`; default timezone `Asia/Shanghai`.
- 24 supplied courses are seeded in order `S01E01` through `S01E24`.
- Review offsets are `[0, 1, 3, 7, 15, 30]`.
- New-course limit is one per day and an unfinished queued course blocks the next queued course.
- Archive hides a course while preserving all progress and history; unarchive restores its prior status.
- Future forecasts cover today through 180 days and never write to SQLite.
- The UI is quiet and reading-first, with responsive desktop/mobile navigation and no gamification.

## Verification

Unit tests cover scheduling, delay, new-course blocking, duplicate completion, undo, archive, date boundaries, and forecasting. Playwright covers import/seed, mode switching, today's completion, calendar read-only behavior, and undo. `npm run build`, `npm run test:run`, and `npm run test:e2e` are the release gates.
