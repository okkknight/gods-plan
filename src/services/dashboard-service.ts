import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";
import { getTodayTasks } from "@/domain/scheduling/today-tasks";
import { getCourses } from "./course-service";
import { getStudyEvents } from "./study-service";

export function getTodayDashboard(today = getTodayInAppTimezone()) {
  const courses = getCourses();
  const events = getStudyEvents();
  return { today, courses, events, tasks: getTodayTasks(today, courses, events) };
}
