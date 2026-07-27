import { addBusinessDays } from "./date-utils";
import { REVIEW_OFFSETS } from "./constants";
import type { ForecastTask, SchedulableCourse, StudyEventSummary } from "./types";

type SimCourse = SchedulableCourse & { currentStage: number; nextDueDate: string | null };

export function forecastTasks(fromDate: string, toDate: string, sourceCourses: SchedulableCourse[], events: StudyEventSummary[]): ForecastTask[] {
  const courses: SimCourse[] = sourceCourses.map((course) => ({ ...course, currentStage: course.currentStage ?? 0, nextDueDate: course.nextDueDate ?? null }));
  const eventKeys = new Set(events.map((event) => `${event.courseId}:${event.stage}`));
  const output: ForecastTask[] = [];
  let date = fromDate;
  while (date <= toDate) {
    const active = courses.filter((course) => course.status === "active" && course.nextDueDate === date);
    for (const course of active) {
      output.push({ date, courseId: course.id, title: course.title, stage: course.currentStage, kind: "review" });
      advanceSimulatedCourse(course, date);
    }
    const queued = courses.filter((course) => course.status === "queued").sort((a, b) => a.orderIndex - b.orderIndex)[0];
    if (queued && !eventKeys.has(`${queued.id}:0`)) {
      output.push({ date, courseId: queued.id, title: queued.title, stage: 0, kind: "new" });
      queued.status = "active";
      queued.currentStage = 1;
      queued.nextDueDate = addBusinessDays(date, 1);
    }
    date = addBusinessDays(date, 1);
  }
  return output;
}

function advanceSimulatedCourse(course: SimCourse, completedDate: string) {
  const nextStage = course.currentStage + 1;
  if (nextStage >= REVIEW_OFFSETS.length) { course.status = "completed"; course.nextDueDate = null; return; }
  course.currentStage = nextStage;
  course.nextDueDate = addBusinessDays(completedDate, REVIEW_OFFSETS[nextStage] - REVIEW_OFFSETS[nextStage - 1]);
}
