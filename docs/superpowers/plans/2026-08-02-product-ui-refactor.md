# God's Plan Product UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild God's Plan's shared visual system and four core product surfaces so the app feels calm, polished, focused, and reliable on desktop and mobile without changing learning logic or content.

**Architecture:** Keep the existing Next.js App Router, SQLite services, scheduling domain, audio pipeline, and Markdown/Cue data unchanged. Add a small shared UI layer for repeated presentation patterns, refactor page components to consume those primitives, and centralize responsive visual rules in the stylesheet. Each milestone is independently testable and preserves the current public routes.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Vitest, Playwright.

## Global Constraints

- Use the approved “安静、有质感的英语学习工作台” direction.
- Do not change course content, Cue source text, audio files, audio segments, or review scheduling logic.
- Do not expose overdue terminology; keep overdue as internal scheduling logic only.
- Keep the daily review display limit at 3.
- Preserve audio state when switching Chinese, English, and Cue modes.
- Preserve Cue blank reveal/hide behavior.
- Keep VPS deployment runtime-only.
- Preserve unrelated worktree files, including `docs/IOS_MIGRATION_CURRENT_FEATURE_SPEC.md`.

---

### Task 1: Establish shared UI primitives and visual tokens

**Files:**
- Create: `src/components/ui.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/navigation.tsx`
- Test: `tests/e2e/core.spec.ts`

**Interfaces:**
- `StatusBadge({ tone, children })` renders a consistent status pill.
- `SectionHeading({ eyebrow?, title, meta? })` renders shared section hierarchy.
- `EmptyState({ title, description? })` renders a neutral empty state.
- `IconButton({ label, children, ...buttonProps })` renders an accessible compact action.

- [x] **Step 1: Add a failing navigation and empty-state expectation**

Add an end-to-end assertion that the active main navigation item has `aria-current="page"` and that an empty today state uses the shared `.empty-state` class.

- [x] **Step 2: Run the focused test and confirm it fails**

Run `npm run test:e2e -- tests/e2e/core.spec.ts -g "navigation|empty"`; expect failure because the shared semantics do not exist.

- [x] **Step 3: Implement tokens and primitives**

Add layered CSS variables for colors, type, spacing, radius, shadows, focus, and motion. Add the four shared components with accessible markup and no new dependency.

- [x] **Step 4: Refactor Navigation to expose active state**

Convert `Navigation` to a client component using `usePathname`, mark the current route with `aria-current`, and add a mobile-safe navigation structure without changing route URLs.

- [x] **Step 5: Run focused unit/type checks**

Run `npm run lint` and the focused e2e test; both must pass.

- [x] **Step 6: Commit the foundation**

Run `git add src/components/ui.tsx src/components/navigation.tsx src/app/globals.css tests/e2e/core.spec.ts && git commit -m "refactor: add shared product UI foundation"`.

### Task 2: Rebuild Today and shared task cards

**Files:**
- Create: `src/components/task-group.tsx`
- Modify: `src/components/task-card.tsx`
- Modify: `src/components/date-navigator.tsx`
- Modify: `src/app/today/page.tsx`
- Modify: `src/app/calendar/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/core.spec.ts`

**Interfaces:**
- `TaskGroup({ title, eyebrow?, tasks, today, variant? })` renders only when tasks exist.
- `TaskCard` remains the single full-card entry action and keeps undo behavior for completed tasks.

- [x] **Step 1: Add failing assertions for the new Today structure**

Assert that Today renders `.today-hero`, `.today-primary-task`, and a single card-level course link without a nested “开始练习” link.

- [x] **Step 2: Run the test and confirm the current structure fails**

Run `npm run test:e2e -- tests/e2e/core.spec.ts -g "course card|today"`; expect failure on the new selectors and nested-link expectation.

- [x] **Step 3: Implement the task card and task group refactor**

Use a real `Link` as the card root, keep keyboard/focus behavior native, move status and metadata into stable slots, and keep completed undo as a separate button that stops navigation.

- [x] **Step 4: Rebuild Today page hierarchy**

Use the hero, progress summary, primary task section, review/new/completed groups, and shared date navigator. Preserve empty group filtering and the internal three-review limit.

- [x] **Step 5: Reuse the same groups in Calendar**

Replace duplicated today grouping markup with `TaskGroup` and preserve the existing past/future service results.

- [x] **Step 6: Run the Today/calendar regression suite**

Run `npm run test:e2e -- tests/e2e/core.spec.ts -g "today|calendar|course card"` and `npm run lint`.

- [x] **Step 7: Commit the Today milestone**

Run `git add src/components/task-group.tsx src/components/task-card.tsx src/components/date-navigator.tsx src/app/today/page.tsx src/app/calendar/page.tsx src/app/globals.css tests/e2e/core.spec.ts && git commit -m "refactor: rebuild today learning flow"`.

### Task 3: Rebuild Course Reader and floating workbench

**Files:**
- Create: `src/components/reader-header.tsx`
- Create: `src/components/reader-content.tsx`
- Modify: `src/components/course-reader.tsx`
- Modify: `src/components/reader-workbench.tsx`
- Modify: `src/components/markdown-content.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/core.spec.ts`

**Interfaces:**
- `ReaderHeader({ episode, title, stage })` renders the compact course identity block.
- `ReaderContent({ mode, section, audio, activeSegment, onPlaySegment })` owns the readable article body.
- `ReaderWorkbench` keeps its current audio ref and mode/play-mode callback contract.

- [x] **Step 1: Add failing reader layout assertions**

Assert the course page exposes `.reader-header`, `.reader-article`, `.reader-workbench`, and mobile workbench width no greater than the viewport.

- [x] **Step 2: Run the focused reader tests and confirm failure**

Run `npm run test:e2e -- tests/e2e/core.spec.ts -g "audio|floating workbench|cue|reader"`; the new layout selectors must fail before implementation.

- [x] **Step 3: Split the reader into focused components**

Move header and body rendering out of `CourseReader` while keeping state ownership for mode, play mode, active segment, stable audio ref, and completion in the reader shell.

- [x] **Step 4: Improve article typography and segment states**

Add readable measure, paragraph rhythm, current-segment emphasis, Cue blank focus/reveal states, and consistent scroll margins. Do not change the audio source or segment timing logic.

- [x] **Step 5: Refine the floating workbench**

Use a compact two-level desktop layout and a mobile layout with mode tabs, playback controls, loop icon, and current-segment status. Keep it fixed, safe-area aware, keyboard accessible, and non-blocking for article clicks.

- [x] **Step 6: Run reader tests and typecheck**

Run the focused reader e2e tests, `npm run test:run`, and `npm run lint`.

- [x] **Step 7: Commit the reader milestone**

Run `git add src/components/reader-header.tsx src/components/reader-content.tsx src/components/course-reader.tsx src/components/reader-workbench.tsx src/components/markdown-content.tsx src/app/globals.css tests/e2e/core.spec.ts && git commit -m "refactor: polish course reader experience"`.

### Task 4: Rebuild Library, Calendar presentation, and action feedback

**Files:**
- Create: `src/components/library-row.tsx`
- Create: `src/components/feedback.tsx`
- Modify: `src/app/library/page.tsx`
- Modify: `src/components/library-controls.tsx`
- Modify: `src/components/task-action.tsx`
- Modify: `src/app/calendar/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/core.spec.ts`

**Interfaces:**
- `LibraryRow({ course, today })` renders a consistent course status row/card.
- `InlineFeedback({ tone, children })` renders non-blocking error/success feedback.

- [x] **Step 1: Add failing Library and feedback assertions**

Assert `.library-toolbar`, `.library-row`, `.inline-feedback`, and a visible status label exist on the course library.

- [x] **Step 2: Run the focused test and confirm failure**

Run `npm run test:e2e -- tests/e2e/core.spec.ts -g "library|archive|import"`; expect failure on the new structure.

- [x] **Step 3: Implement the library row and toolbar**

Keep import functionality and archive API calls unchanged. Reorganize controls into a clear toolbar, add status badges, and make rows/cards fully usable on mobile.

- [x] **Step 4: Add safe archive confirmation and inline errors**

Use a small confirm dialog or native confirm boundary for archive actions, preserve busy state, and render errors through the shared feedback component.

- [x] **Step 5: Refine Calendar presentation**

Use the shared page heading, date controls, task groups, history rows, future plan rows, and empty states. Keep all service data and labels accurate.

- [x] **Step 6: Run library/calendar tests and typecheck**

Run focused e2e tests, `npm run test:run`, and `npm run lint`.

- [x] **Step 7: Commit the catalog milestone**

Run `git add src/components/library-row.tsx src/components/feedback.tsx src/app/library/page.tsx src/components/library-controls.tsx src/components/task-action.tsx src/app/calendar/page.tsx src/app/globals.css tests/e2e/core.spec.ts && git commit -m "refactor: improve course library and calendar"`.

### Task 5: Responsive, accessibility, visual QA, and release

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/core.spec.ts`
- Create: `docs/superpowers/qa/2026-08-02-product-ui-refactor.md`

- [x] **Step 1: Add responsive and accessibility regression cases**

Cover 390px, 430px, 768px, and desktop widths; assert no horizontal overflow, active navigation semantics, keyboard focus, bottom workbench visibility, card link behavior, and Cue blank keyboard activation.

- [x] **Step 2: Run the responsive tests and fix issues**

Run `npm run test:e2e -- tests/e2e/core.spec.ts`; fix layout or interaction regressions without weakening assertions.

- [x] **Step 3: Capture and inspect final screenshots**

Capture Today, Course Reader, Library, and Calendar at desktop and 390px. Record the accepted states and any known limitations in the QA document.

- [x] **Step 4: Run all verification commands**

Run `npm run test:run`, `npm run lint`, `npm run test:e2e`, and `NEXT_PUBLIC_BASE_PATH=/godsplan npm run build`.

- [x] **Step 5: Review staged paths and commit the final polish**

Do not stage `docs/IOS_MIGRATION_CURRENT_FEATURE_SPEC.md`, `output/`, test artifacts, databases, or audio caches. Commit with `git commit -m "refactor: finish God's Plan product UI"`.
