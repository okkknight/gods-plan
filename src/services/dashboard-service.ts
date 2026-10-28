import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";
import { getTodayTasks } from "@/domain/scheduling/today-tasks";
import { getCourses } from "./course-service";
import { getStudyEvents } from "./study-service";
import { getActiveCourseGroup } from "./course-group-service";

export function getTodayDashboard(today = getTodayInAppTimezone()) {
  const group = getActiveCourseGroup();
  const courses = getCourses(group.id);
  const events = getStudyEvents(group.id);
  return { today, group, courses, events, tasks: getTodayTasks(today, courses, events) };
}
