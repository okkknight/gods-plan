import { Navigation } from "@/components/navigation";
import { getCourses } from "@/services/course-service";
import { LibraryControls } from "@/components/library-controls";
import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";
import { LibraryRow } from "@/components/library-row";

export default function LibraryPage() { const courses = getCourses(); const today = getTodayInAppTimezone(); return <><Navigation /><main className="shell"><header className="page-heading"><div><p className="eyebrow">{courses.length} 篇课程</p><h1>课程库</h1></div><div className="library-toolbar"><span className="library-count">{courses.filter((c) => c.status !== "archived").length} 篇参与计划</span><LibraryControls /></div></header><div className="library-list">{courses.map((course) => <LibraryRow key={course.id} course={course} today={today} />)}</div></main></> }
