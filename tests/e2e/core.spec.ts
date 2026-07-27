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
