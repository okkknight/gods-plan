# Cue Blank Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each Cue Version blank independently reveal and hide its matching English source phrase when clicked.

**Architecture:** Add a pure Cue-to-English alignment helper that extracts hidden phrases from the canonical English text without changing stored course data. Extend the existing Markdown renderer with local per-blank state and accessible buttons, then cover alignment with unit tests and the user interaction with an end-to-end test.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Playwright, existing CSS.

## Global Constraints

- Preserve the canonical full-width underline and space layout when blanks are hidden.
- Do not add explanatory copy or a global reveal control.
- Do not interrupt or remount the existing audio element when Cue blanks are toggled.
- Preserve existing Markdown heading, list, emphasis, code, and link rendering.
- Preserve unrelated worktree changes, including `docs/IOS_MIGRATION_CURRENT_FEATURE_SPEC.md`.

---

### Task 1: Add alignment behavior tests

**Files:**
- Create: `tests/unit/cue-reveal.test.ts`
- Modify: `tests/e2e/core.spec.ts`

**Interfaces:**
- Tests will define the required `alignCueBlanks(cue: string, english: string)` result shape before implementation.

- [ ] **Step 1: Write unit tests for sequential blank extraction**

Assert that a Cue skeleton maps each blank to the corresponding English phrase, including multiple adjacent blanks and a blank at the end of a paragraph.

- [ ] **Step 2: Write the end-to-end interaction test**

Navigate to the first course Cue tab, click the first `.cue-blank`, assert its hidden English phrase is visible, click it again, and assert the blank is visible again. Click a second blank and assert only it is revealed.

- [ ] **Step 3: Run the focused tests and verify the expected failure**

Run `npm run test:run -- tests/unit/cue-reveal.test.ts` and the focused Playwright test. They must fail because the alignment helper and clickable reveal behavior do not exist yet.

### Task 2: Implement Cue alignment and interactive rendering

**Files:**
- Create: `src/domain/courses/cue-reveal.ts`
- Modify: `src/components/markdown-content.tsx`
- Modify: `src/components/course-reader.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `alignCueBlanks(cue: string, english: string): Array<{ start: number; end: number; text: string | null }>` returns one entry per blank in Cue order; unmatched entries have `text: null`.
- `MarkdownContent` accepts optional `revealSource?: string`; existing callers remain valid.

- [ ] **Step 1: Implement the minimal sequential matcher**

Convert blank runs into non-greedy capture groups, escape all visible Cue text, match against the English source, and return captured phrases. Normalize only line-ending differences; do not alter the source text returned to the UI.

- [ ] **Step 2: Add optional reveal rendering to MarkdownContent**

Parse the existing Markdown blocks as before. For Cue blank runs, render an accessible button whose local state toggles between the existing underline span and the matched phrase. Keep unmatched blanks non-interactive and hidden.

- [ ] **Step 3: Pass the English paragraph as the Cue reveal source**

In `CourseReader`, pass `paragraph.english` only when rendering `paragraph.cue`; Chinese and English rendering remain unchanged.

- [ ] **Step 4: Add restrained hover, focus, and revealed styles**

Use the existing accent palette, transparent background, and no layout-changing animation. Ensure the control remains usable at mobile widths.

### Task 3: Verify, review, and commit

**Files:**
- No additional files.

- [ ] **Step 1: Run unit tests and typecheck**

Run `npm run test:run` and `npm run lint`; fix regressions without changing test expectations.

- [ ] **Step 2: Run the focused and full end-to-end suites**

Run `npm run test:e2e -- tests/e2e/core.spec.ts -g "cue|audio element|floating workbench"`, then `npm run test:e2e`.

- [ ] **Step 3: Run the production build**

Run `NEXT_PUBLIC_BASE_PATH=/godsplan npm run build`.

- [ ] **Step 4: Review the diff and commit only feature files**

Confirm the unrelated iOS migration document is not staged, then commit the spec, plan, tests, implementation, and styles with `git commit -m "feat: reveal cue blanks on click"`.
