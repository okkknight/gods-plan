import { Navigation } from "@/components/navigation";
import { getCourses } from "@/services/course-service";
import { LibraryControls } from "@/components/library-controls";
import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";
import { LibraryRow } from "@/components/library-row";
import { CourseGroupSwitcher } from "@/components/course-group-switcher";
import { getActiveCourseGroup, getCourseGroups } from "@/services/course-group-service";

export const dynamic = "force-dynamic";

export default function LibraryPage() {
  const group = getActiveCourseGroup();
  const courses = getCourses(group.id);
  const today = getTodayInAppTimezone();
  return <><Navigation groupName={getActiveCourseGroup().name} /><main className="shell"><header className="page-heading"><div><p className="eyebrow">{courses.length} 篇课程 · {group.name}</p><h1>课程库</h1></div><div className="library-toolbar"><span className="library-count">{courses.filter((c) => c.status !== "archived").length} 篇参与计划</span><LibraryControls groupId={group.id} /></div></header><CourseGroupSwitcher groups={getCourseGroups()} activeGroupId={group.id} /><div className="library-list">{courses.map((course) => <LibraryRow key={course.id} course={course} today={today} />)}</div></main></>;
}
