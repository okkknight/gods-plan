import { forecastTasks } from "@/domain/scheduling/future-plan";
import { getTodayInAppTimezone, addBusinessDays } from "@/domain/scheduling/date-utils";
import { getCourses } from "./course-service";
import { getStudyEvents } from "./study-service";
import { getTodayTasks } from "@/domain/scheduling/today-tasks";

export function getTasksForDate(date: string, today = getTodayInAppTimezone()) {
  const courses = getCourses();
  const events = getStudyEvents();
  if (date < today) return { mode: "past" as const, date, events: events.filter((event) => event.completedDate === date).map((event) => ({ ...event, course: courses.find((course) => course.id === event.courseId) ?? null })), tasks: null };
  if (date === today) return { mode: "today" as const, date, events, tasks: getTodayTasks(today, courses, events) };
  return { mode: "future" as const, date, events: [], tasks: forecastTasks(addBusinessDays(today, 1), date, courses, events) };
}
