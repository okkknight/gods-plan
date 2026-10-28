import { forecastTasks } from "@/domain/scheduling/future-plan";
import { getTodayInAppTimezone, addBusinessDays } from "@/domain/scheduling/date-utils";
import { getCourses } from "./course-service";
import { getStudyEvents } from "./study-service";
import { getTodayTasks } from "@/domain/scheduling/today-tasks";
import { getActiveCourseGroup } from "./course-group-service";

export function getTasksForDate(date: string, today = getTodayInAppTimezone()) {
  const group = getActiveCourseGroup();
  const courses = getCourses(group.id);
  const events = getStudyEvents(group.id);
  if (date < today) return { mode: "past" as const, group, date, events: events.filter((event) => event.completedDate === date).map((event) => ({ ...event, course: courses.find((course) => course.id === event.courseId) ?? null })), tasks: null };
  if (date === today) return { mode: "today" as const, group, date, events, tasks: getTodayTasks(today, courses, events) };
  return { mode: "future" as const, group, date, events: [], tasks: forecastTasks(addBusinessDays(today, 1), date, courses, events) };
}
