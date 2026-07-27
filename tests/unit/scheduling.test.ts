import { describe, expect, it } from "vitest";
import { completeStage } from "@/domain/scheduling/complete-stage";
import { getTodayTasks } from "@/domain/scheduling/today-tasks";
import { forecastTasks } from "@/domain/scheduling/future-plan";

describe("review scheduling", () => {
  it("moves the first lesson to a review one day after actual completion", () => {
    expect(completeStage({ currentStage: 0, completedDate: "2026-07-27" })).toEqual({
      type: "next-stage", nextStage: 1, nextDueDate: "2026-07-28",
    });
  });

  it("calculates the next interval from the actual delayed completion date", () => {
    expect(completeStage({ currentStage: 1, completedDate: "2026-08-04" })).toEqual({
      type: "next-stage", nextStage: 2, nextDueDate: "2026-08-06",
    });
  });

  it("completes the course after the final review", () => {
    expect(completeStage({ currentStage: 5, completedDate: "2026-09-01" })).toEqual({
      type: "course-completed", completedDate: "2026-09-01",
    });
  });

  it("blocks the next queued course while the current new course is unfinished", () => {
    const tasks = getTodayTasks("2026-07-27", [
      { id: 1, slug: "one", title: "One", orderIndex: 1, status: "queued" },
      { id: 2, slug: "two", title: "Two", orderIndex: 2, status: "queued" },
    ], []);
    expect(tasks.newCourse?.id).toBe(1);
    expect(tasks.newCourse?.id).not.toBe(2);
  });

  it("does not schedule another new course after a new course was completed today", () => {
    const tasks = getTodayTasks("2026-07-27", [
      { id: 1, slug: "one", title: "One", orderIndex: 1, status: "active", currentStage: 1, nextDueDate: "2026-07-28" },
      { id: 2, slug: "two", title: "Two", orderIndex: 2, status: "queued" },
    ], [{ courseId: 1, stage: 0, scheduledDate: "2026-07-27", completedDate: "2026-07-27" }]);
    expect(tasks.newCourse).toBeNull();
  });

  it("includes overdue and due reviews independently of the new course", () => {
    const tasks = getTodayTasks("2026-07-27", [
      { id: 1, slug: "active", title: "Active", orderIndex: 1, status: "active", currentStage: 2, nextDueDate: "2026-07-26" },
      { id: 2, slug: "due", title: "Due", orderIndex: 2, status: "active", currentStage: 1, nextDueDate: "2026-07-27" },
      { id: 3, slug: "new", title: "New", orderIndex: 3, status: "queued" },
    ], []);
    expect(tasks.overdueReviews.map((task) => task.id)).toEqual([1]);
    expect(tasks.dueReviews.map((task) => task.id)).toEqual([2]);
    expect(tasks.newCourse?.id).toBe(3);
  });

  it("forecasts without mutating source progress", () => {
    const courses = [{ id: 1, slug: "one", title: "One", orderIndex: 1, status: "queued" as const }];
    const forecast = forecastTasks("2026-07-27", "2026-07-29", courses, []);
    expect(forecast.some((task) => task.date === "2026-07-27" && task.stage === 0)).toBe(true);
    expect(courses[0].status).toBe("queued");
  });
});
