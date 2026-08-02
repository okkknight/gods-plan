import { expect, test } from "@playwright/test";

const appToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00+08:00`);
  value.setDate(value.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(value);
}

test("learn, switch modes, complete, and undo today's first course", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "今天学什么" })).toBeVisible();
  await page.getByRole("link", { name: /S01E01.*Pilot/ }).click();
  await page.waitForLoadState("networkidle");
  const modeButton = page.locator(".mode-cycle-button");
  await expect(modeButton).toHaveAttribute("data-mode", "chinese");
  await modeButton.click();
  await expect(modeButton).toHaveAttribute("data-mode", "english");
  await expect(page.getByRole("heading", { name: "Spoken English 标准版" })).toBeVisible();
  await modeButton.click();
  await expect(modeButton).toHaveAttribute("data-mode", "cue");
  await expect(page.getByRole("heading", { name: "Cue Version" })).toBeVisible();
  await page.getByRole("button", { name: "完成本次学习" }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByText("今天已完成")).toBeVisible();
  await expect(page.getByText("S01E02")).not.toBeVisible();
  await page.getByRole("button", { name: "撤销完成" }).click();
  await expect(page.getByText("今日新课")).toBeVisible();
});

test("future calendar is read-only and explains forecasting", async ({ page }) => {
  await page.goto(`/calendar?date=${addDays(appToday, 1)}`);
  await expect(page.getByText("预计计划")).toBeVisible();
  await expect(page.getByText("未来安排会自动变化")).toBeVisible();
  await expect(page.getByRole("button", { name: "完成本次学习" })).not.toBeVisible();
});

test("calendar date picker navigates immediately", async ({ page }) => {
  const tomorrow = addDays(appToday, 1);
  await page.goto("/calendar");
  await page.getByLabel("选择日期").fill(tomorrow);
  await expect(page).toHaveURL(new RegExp(`/calendar\\?date=${tomorrow}$`));
  await expect(page.getByText("预计计划")).toBeVisible();
  await expect(page.getByRole("button", { name: "查看" })).not.toBeVisible();
});

test("today page arrows move one day at a time", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("button", { name: "前一天" })).toBeVisible();
  await expect(page.getByRole("button", { name: "后一天" })).toBeVisible();
  await page.getByRole("button", { name: "后一天" }).click();
  await expect(page).toHaveURL(new RegExp(`/today\\?date=${addDays(appToday, 1)}$`));
  await expect(page.getByText("预计计划")).toBeVisible();
  await page.getByRole("button", { name: "前一天" }).click();
  await expect(page).toHaveURL(new RegExp(`/today\\?date=${appToday}$`));
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
  await expect(page.locator(".reader-header")).toBeVisible();
  await expect(page.locator(".reader-article")).toBeVisible();
  await page.locator(".mode-cycle-button").click();
  const audio = page.locator("audio");
  await expect(audio).toBeVisible();
  await audio.evaluate((element) => { element.setAttribute("data-persist-marker", "true"); });
  await page.locator(".mode-cycle-button").click();
  await expect(audio).toHaveAttribute("data-persist-marker", "true");
  await expect(page.locator(".reader-workbench")).toBeVisible();
  await expect(audio).toBeVisible();
});

test("floating workbench stays usable while reading down the article", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.locator(".mode-cycle-button").click();
  await page.locator(".audio-segment").last().scrollIntoViewIfNeeded();
  const workbench = page.locator(".reader-workbench");
  await expect(workbench).toBeVisible();
  const box = await workbench.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator(".mode-cycle-button")).toBeVisible();
});

test("floating workbench fits a mobile reading viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await expect(page.locator(".reader-workbench")).toBeVisible();
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  const workbench = await page.locator(".reader-workbench").boundingBox();
  expect(workbench).not.toBeNull();
  expect(workbench!.width).toBeLessThanOrEqual(390);
});

test("english audio supports once and loop modes", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.locator(".mode-cycle-button").click();
  const audio = page.locator("audio");
  await expect(audio).toHaveJSProperty("loop", false);
  await page.getByRole("button", { name: "切换到循环播放" }).click();
  await expect(audio).toHaveJSProperty("loop", true);
  await page.getByRole("button", { name: "切换到单篇播放" }).click();
  await expect(audio).toHaveJSProperty("loop", false);
});

test("english subtitles follow audio segments and can jump to a segment", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.locator(".mode-cycle-button").click();
  const segments = page.locator(".audio-segment");
  await expect(segments).toHaveCount(14);
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
  await page.locator(".mode-cycle-button").click();
  await page.locator(".mode-cycle-button").click();
  await expect(page.locator(".cue-blank").first()).toBeVisible();
  await expect(page.locator(".markdown-content ul")).toHaveCount(0);
});

test("cue blanks reveal their matching source text and can be hidden again", async ({ page }) => {
  await page.goto("/course/1?stage=0&date=2026-07-28");
  await page.locator(".mode-cycle-button").click();
  await page.locator(".mode-cycle-button").click();
  const firstBlank = page.locator(".cue-blank").first();
  const secondBlank = page.locator(".cue-blank").nth(1);

  await firstBlank.click();
  await expect(page.locator(".cue-revealed").first()).toHaveText("three");
  await expect(secondBlank).toBeVisible();

  await firstBlank.click();
  await expect(page.locator(".cue-revealed")).toHaveCount(0);

  await secondBlank.click();
  await expect(page.locator(".cue-revealed").first()).toHaveText("families");
});

test("today does not show explanatory marketing copy", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByText("把今天的一小段练习完成，复习会自己继续向前。", { exact: true })).not.toBeVisible();
});

test("main navigation marks the current page", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("link", { name: "今日", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "日历", exact: true })).not.toHaveAttribute("aria-current", "page");
});

test("library uses product status rows and a dedicated toolbar", async ({ page }) => {
  await page.goto("/library");
  await expect(page.locator(".library-toolbar")).toBeVisible();
  await expect(page.locator(".library-row").first()).toBeVisible();
  await expect(page.locator(".status-badge").first()).toBeVisible();
});

test("mobile navigation and Cue blanks remain keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/today");
  await expect(page.locator(".nav")).toBeVisible();
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  await page.goto("/course/1?stage=0&date=2026-07-27");
  await page.locator(".mode-cycle-button").click();
  await page.locator(".mode-cycle-button").click();
  const firstBlank = page.locator(".cue-blank").first();
  await firstBlank.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".cue-revealed").first()).toHaveText("three");
});
