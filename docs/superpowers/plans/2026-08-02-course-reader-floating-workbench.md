# Course Reader Floating Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep course mode switching and audio playback controls available in a polished bottom-floating workbench while preserving uninterrupted audio and synchronized segment reading.

**Architecture:** Extract the persistent controls into a focused `ReaderWorkbench` client component. `CourseReader` remains the single owner of mode, playback mode, audio ref, and active segment state; the workbench receives those values and callbacks without owning a second audio element. CSS will use one fixed, centered surface with a compact mobile layout and reserved reader bottom space.

**Tech Stack:** Next.js App Router, React client components, TypeScript, existing CSS tokens, lucide-react, Playwright.

## Global Constraints

- Keep exactly one `<audio>` element mounted throughout mode changes.
- Preserve segment click-to-seek, time-based highlighting, auto-scroll, once/loop playback, and current accessibility labels.
- Do not add a new dependency or change the database/audio contract.
- Do not show the browser's blue tap highlight on touch devices.
- Keep the workbench below the system-level layer and above article content.

### Task 1: Add failing reader-workbench interaction coverage

**Files:**
- Modify: `tests/e2e/core.spec.ts`

**Interfaces:**
- Consumes: Existing `/course/1` reader and audio fixtures.
- Produces: Assertions for persistent `.reader-workbench`, visible mode tabs after article scrolling, and audio persistence while switching to Cue.

- [ ] **Step 1: Add the scroll persistence test**

Add a test that opens `/course/1?stage=0&date=2026-07-27`, switches to English, scrolls the last `.audio-segment` into view, and asserts `.reader-workbench` is visible and its bounding box remains inside the viewport.

- [ ] **Step 2: Update the mode-switch persistence expectation**

Keep the existing `data-persist-marker` assertion, but change the old hidden-control assertion to require the workbench and its audio control to remain visible after switching to Cue.

- [ ] **Step 3: Run the focused tests and confirm the new behavior fails**

Run: `npx playwright test tests/e2e/core.spec.ts -g "workbench|audio element survives"`

Expected: the new workbench test fails because the current page has no `.reader-workbench`, and the updated persistence expectation fails because the existing non-English audio container is intentionally hidden.

### Task 2: Extract the persistent workbench component

**Files:**
- Create: `src/components/reader-workbench.tsx`
- Modify: `src/components/course-reader.tsx`

**Interfaces:**
- Consumes: `mode`, `onModeChange`, `playMode`, `onPlayModeChange`, `audioRef`, `audio`, `activeSegment`, `labels`, and `PlayModeIcon`-equivalent state.
- Produces: A single fixed-workbench render containing mode tabs, loop toggle, one stable audio element, and current segment metadata.

- [ ] **Step 1: Define the component props**

Use explicit types for the three modes, two playback modes, `CourseAudio`, and the audio segment list. Accept the existing `HTMLAudioElement` ref and callbacks rather than creating local playback state.

- [ ] **Step 2: Move the mode tabs and audio element into the workbench**

Render one `.reader-workbench` with a `.reader-workbench-inner`, a `.reader-workbench-topline`, and a `.reader-workbench-player`. Keep `audio` mounted regardless of the current mode. Use `controls`, `preload="metadata"`, `loop`, `onTimeUpdate`, and the existing audio URL.

- [ ] **Step 3: Add current-segment metadata**

When `activeSegment` is valid, show `第 N / total 段` and the segment text in a visually secondary line; otherwise show a quiet neutral state. Truncate long text with CSS rather than duplicating the article content.

- [ ] **Step 4: Render the workbench from `CourseReader`**

Remove the old in-flow mode/audio blocks and pass the existing state and callbacks to `ReaderWorkbench`. Keep `handleTimeUpdate` and `playSegment` in `CourseReader` so article subtitles and the workbench share one source of truth.

### Task 3: Implement the responsive visual system

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Existing `--line`, `--ink`, `--muted`, `--accent`, page background, and button focus patterns.
- Produces: Fixed desktop workbench, safe-area mobile layout, article clearance, readable focus/active states, and no touch highlight.

- [ ] **Step 1: Style the fixed desktop surface**

Use `position: fixed`, `left: 50%`, `transform: translateX(-50%)`, `bottom: calc(18px + env(safe-area-inset-bottom))`, `width: min(744px, calc(100vw - 56px))`, `z-index` below dialogs, translucent warm-white background, a 1px border, and a restrained shadow.

- [ ] **Step 2: Style the two-level desktop layout**

Place tabs and loop control on one line; place the native audio control and current-segment metadata below it. Keep audio full-width within the inner surface and make metadata truncate without changing layout height.

- [ ] **Step 3: Reserve article clearance and segment scroll clearance**

Increase `.reader-page` bottom padding to cover the workbench. Add bottom scroll margin to `.audio-segment` and the reader footer so the fixed surface never covers the last readable line or completion action.

- [ ] **Step 4: Add mobile layout and touch behavior**

At `max-width: 640px`, make the workbench width `calc(100vw - 24px)`, reduce padding, keep the tabs at a minimum touch target, move audio below the first row, apply safe-area padding, disable tap highlight, and prevent horizontal overflow.

### Task 4: Verify and polish the reader flow

**Files:**
- Modify: `tests/e2e/core.spec.ts` only if assertions need stable accessibility selectors.
- Modify: `src/components/course-reader.tsx` or `src/components/reader-workbench.tsx` for defects found during verification.

**Interfaces:**
- Consumes: Workbench UI and existing course/audio fixtures.
- Produces: Verified desktop/mobile reading experience with no regressions.

- [ ] **Step 1: Run static checks**

Run `npm run lint`, `npm run test:run`, and `npm run build`.

- [ ] **Step 2: Run focused Playwright coverage**

Run `npx playwright test tests/e2e/core.spec.ts -g "workbench|audio element survives|english audio supports|english subtitles"`.

- [ ] **Step 3: Run the full available e2e suite**

Run `npm run test:e2e` and record any fixed-date or shared-state failures separately from workbench failures.

- [ ] **Step 4: Inspect desktop and mobile screenshots**

Use a desktop viewport and a 390px mobile viewport. Confirm the workbench remains visible after scrolling, does not cover the current segment or completion button, and does not create horizontal overflow.

- [ ] **Step 5: Commit the implementation**

Run:

```bash
git add src/components/course-reader.tsx src/components/reader-workbench.tsx src/app/globals.css tests/e2e/core.spec.ts
git commit -m "refactor course reader floating workbench"
```
