# English Speaking Review App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a runnable local English speaking review planner backed by the supplied 24-course dataset.

**Architecture:** Next.js App Router renders the four product pages and route handlers perform transactional writes. Pure scheduling and Markdown parsing modules sit below services and are tested without React or SQLite.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, SQLite, Drizzle ORM, better-sqlite3, Zod, date-fns, Vitest, Playwright.

## Global Constraints

- Business dates are `YYYY-MM-DD` in `Asia/Shanghai`; do not derive them from UTC ISO slicing.
- Review stages are `0 / 1 / 2 / 3 / 4 / 5` with offsets `0 / 1 / 3 / 7 / 15 / 30`.
- Only today's tasks can be completed or undone.
- Future plans are predictions and must not write database rows.
- Course content updates preserve status, progress, and study events.
- Keep domain logic separate from UI and database operations.

### Task 1: Project foundation

**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `README.md`, `.env.example`, `.gitignore`.

- [ ] Add scripts for dev, build, lint, unit tests, e2e, migration, seed, validate, and import.
- [ ] Add the Next.js shell, global typography, and responsive app layout.
- [ ] Run `npm install` and verify the shell builds.

### Task 2: Scheduling domain (TDD)

**Files:** `src/domain/scheduling/constants.ts`, `types.ts`, `date-utils.ts`, `complete-stage.ts`, `today-tasks.ts`, `future-plan.ts`, `tests/unit/scheduling.test.ts`.

- [ ] Write failing tests for stage progression, delay, date boundaries, new-course blocking, task grouping, and forecast purity.
- [ ] Run the focused test and confirm expected missing-module failures.
- [ ] Implement the smallest pure functions to pass, then refactor while green.

### Task 3: Course content and database

**Files:** `src/domain/courses/course-schema.ts`, `markdown-parser.ts`, `import-course.ts`, `src/db/schema.ts`, `client.ts`, `migrate.ts`, `scripts/convert-courses.ts`, `scripts/seed.ts`, `content/courses/*.json`, `tests/unit/course-parser.test.ts`.

- [ ] Write failing parser tests against the supplied Markdown shape.
- [ ] Implement Zod validation and deterministic conversion for all 24 episodes.
- [ ] Implement Drizzle schema and atomic insert/update import behavior.
- [ ] Generate JSON content and seed the local database.

### Task 4: Services and writes

**Files:** `src/services/dashboard-service.ts`, `calendar-service.ts`, `course-service.ts`, `study-service.ts`, `src/app/api/complete/route.ts`, `undo/route.ts`, `import/route.ts`.

- [ ] Add read services for today, arbitrary dates, library, and course detail.
- [ ] Add transactional completion, undo, archive, unarchive, and import operations with server-side revalidation.
- [ ] Add integration tests for idempotency and state restoration.

### Task 5: Product pages

**Files:** `src/components/*`, `src/app/page.tsx`, `today/page.tsx`, `calendar/page.tsx`, `course/[id]/page.tsx`, `library/page.tsx`.

- [ ] Build responsive navigation and shared task cards.
- [ ] Build Today with overdue/due/new/completed groups and empty states.
- [ ] Build Course Reader with stable scroll position across Chinese/English/Cue modes and contextual completion.
- [ ] Build Calendar with past facts, today actions, future forecast warning, and read-only enforcement.
- [ ] Build Library filters, import form, update mode, preview, archive, and unarchive.

### Task 6: Verification and handoff

**Files:** `tests/e2e/*.spec.ts`, `PROJECT_CONTEXT.md`, `docs/handoff/README.md`, `docs/handoff/CHANGELOG.md`.

- [ ] Add Playwright flows for import/seed, completion, delay, calendar permissions, and undo.
- [ ] Run tests, build, lint, and a real browser smoke test.
- [ ] Refresh handoff docs with exact commands and evidence.
- [ ] Commit the verified implementation and hand off for independent review.
