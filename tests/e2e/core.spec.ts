import { expect, test } from "@playwright/test";

test("learn, switch modes, complete, and undo today's first course", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "今天学什么" })).toBeVisible();
  await page.getByRole("link", { name: "开始练习" }).first().click();
  await expect(page.getByRole("tab", { name: "中文" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "英文" }).click();
  await expect(page.getByRole("tab", { name: "英文" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Spoken English 标准版" })).toBeVisible();
  await page.getByRole("tab", { name: "Cue" }).click();
  await expect(page.getByRole("tab", { name: "Cue" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Cue Version" })).toBeVisible();
  await page.getByRole("button", { name: "完成本次学习" }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByText("今天已完成")).toBeVisible();
  await expect(page.getByText("S01E02")).not.toBeVisible();
  await page.getByRole("button", { name: "撤销完成" }).click();
  await expect(page.getByText("今日新课")).toBeVisible();
});

test("future calendar is read-only and explains forecasting", async ({ page }) => {
  await page.goto("/calendar?date=2026-07-28");
  await expect(page.getByText("预计计划")).toBeVisible();
  await expect(page.getByText("未来安排会自动变化")).toBeVisible();
  await expect(page.getByRole("button", { name: "完成本次学习" })).not.toBeVisible();
});

test("today page arrows move one day at a time", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("button", { name: "前一天" })).toBeVisible();
  await expect(page.getByRole("button", { name: "后一天" })).toBeVisible();
  await page.getByRole("button", { name: "后一天" }).click();
  await expect(page).toHaveURL(/\/today\?date=2026-07-28$/);
  await expect(page.getByText("预计计划")).toBeVisible();
  await page.getByRole("button", { name: "前一天" }).click();
  await expect(page).toHaveURL(/\/today\?date=2026-07-27$/);
});

test("today hides empty priority groups so available courses move up", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "今日新学" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "逾期复习" })).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "今日复习" })).not.toBeVisible();
});

test("course card opens the lesson and removes the new-course hint", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByText("每天一篇", { exact: true })).not.toBeVisible();
  await page.getByRole("link", { name: /S01E01.*Pilot/ }).click();
  await expect(page).toHaveURL(/\/course\/1\?stage=0&date=\d{4}-\d{2}-\d{2}$/);
});

test("english audio element survives switching to another mode", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.getByRole("tab", { name: "英文" }).click();
  const audio = page.locator("audio");
  await expect(audio).toBeVisible();
  await audio.evaluate((element) => { element.setAttribute("data-persist-marker", "true"); });
  await page.getByRole("tab", { name: "Cue" }).click();
  await expect(audio).toHaveAttribute("data-persist-marker", "true");
  await expect(page.locator(".reader-audio")).toHaveClass(/reader-audio-hidden/);
});

test("english audio supports once and loop modes", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.getByRole("tab", { name: "英文" }).click();
  const audio = page.locator("audio");
  await expect(audio).toHaveJSProperty("loop", false);
  await page.getByRole("button", { name: "切换到循环播放" }).click();
  await expect(audio).toHaveJSProperty("loop", true);
  await page.getByRole("button", { name: "切换到单篇播放" }).click();
  await expect(audio).toHaveJSProperty("loop", false);
});

test("english subtitles follow audio segments and can jump to a segment", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.getByRole("tab", { name: "英文" }).click();
  const segments = page.locator(".audio-segment");
  await expect(segments).toHaveCount(12);
  await segments.nth(4).click();
  await expect(segments.nth(4)).toHaveClass(/active/);
  const start = Number(await segments.nth(7).getAttribute("data-start"));
  await page.locator("audio").evaluate((audio, time) => {
    const player = audio as HTMLAudioElement;
    player.currentTime = time + 0.2;
    player.dispatchEvent(new Event("timeupdate"));
  }, start);
  await expect(segments.nth(7)).toHaveClass(/active/);
});

test("first cue version keeps the story skeleton with fill-in blanks", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-28");
  await page.getByRole("tab", { name: "Cue" }).click();
  await expect(page.locator(".cue-blank").first()).toBeVisible();
  await expect(page.locator(".markdown-content ul")).toHaveCount(0);
});

test("today does not show explanatory marketing copy", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByText("把今天的一小段练习完成，复习会自己继续向前。", { exact: true })).not.toBeVisible();
});
