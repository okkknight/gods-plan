import { daysBetween } from "./date-utils";
import { DAILY_REVIEW_DISPLAY_LIMIT, REVIEW_BACKLOG_NEW_COURSE_THRESHOLD } from "./constants";
import type { CompletedTask, NewCourseTask, ReviewTask, SchedulableCourse, StudyEventSummary, TodayTasks } from "./types";

export function getTodayTasks(today: string, sourceCourses: SchedulableCourse[], events: StudyEventSummary[]): TodayTasks {
  const courses = [...sourceCourses].sort((a, b) => a.orderIndex - b.orderIndex);
  const completedIds = new Set(events.filter((event) => event.completedDate === today).map((event) => `${event.courseId}:${event.stage}`));
  const overdueReviews: ReviewTask[] = [];
  const dueReviews: ReviewTask[] = [];

  for (const course of courses) {
    if (course.status !== "active" || !course.nextDueDate || course.currentStage === undefined) continue;
    const eventKey = `${course.id}:${course.currentStage}`;
    if (completedIds.has(eventKey) || course.nextDueDate > today) continue;
    const task = { ...course, kind: "review" as const, stage: course.currentStage, scheduledDate: course.nextDueDate, overdueDays: Math.max(0, daysBetween(today, course.nextDueDate)) };
    if (course.nextDueDate < today) overdueReviews.push(task); else dueReviews.push(task);
  }

  const allReviews = [...overdueReviews, ...dueReviews].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const reviewTasks = allReviews.slice(0, DAILY_REVIEW_DISPLAY_LIMIT);
  const reviewBacklogCount = allReviews.length;
  const queued = courses.filter((course) => course.status === "queued");
  const newCourseCompletedToday = events.some((event) => event.stage === 0 && event.completedDate === today);
  const queuedCourse = newCourseCompletedToday ? undefined : queued.find((course) => !events.some((event) => event.courseId === course.id && event.stage === 0));
  const newCourse: NewCourseTask | null = queuedCourse && reviewBacklogCount <= REVIEW_BACKLOG_NEW_COURSE_THRESHOLD && !completedIds.has(`${queuedCourse.id}:0`)
    ? { ...queuedCourse, kind: "new", stage: 0, scheduledDate: today }
    : null;

  const completedToday: CompletedTask[] = events
    .filter((event) => event.completedDate === today)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .map((event) => ({ ...event, kind: "completed" as const, course: courses.find((course) => course.id === event.courseId)! }))
    .filter((task) => task.course);

  return { overdueReviews: overdueReviews.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)), dueReviews, reviewTasks, reviewBacklogCount, newCourse, completedToday };
}
