import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { getCourses } from "@/services/course-service";
import { STAGE_LABELS } from "@/domain/scheduling/constants";
import { LibraryControls } from "@/components/library-controls";
import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";

export default function LibraryPage() { const courses = getCourses(); const today = getTodayInAppTimezone(); return <><Navigation /><main className="shell"><header className="page-heading"><div><p className="eyebrow">{courses.length} 篇课程</p><h1>课程库</h1></div><div className="library-header-actions"><span className="library-count">{courses.filter((c) => c.status !== "archived").length} 篇参与计划</span><LibraryControls /></div></header><div className="library-list">{courses.map((course) => <article className="library-row" key={course.id}><div><span className="episode">{course.slug.replace("modern-family-", "").toUpperCase()}</span><h2>{course.title}</h2><p>{course.status === "queued" ? "待学习" : course.status === "completed" ? "已完成全部复习" : course.status === "archived" ? "已归档" : `${STAGE_LABELS[course.currentStage ?? 0]} · 下次 ${course.nextDueDate ?? "—"}`}</p></div><div className="library-row-actions"><Link className="button button-secondary" href={`/course/${course.id}?stage=${course.currentStage ?? 0}&date=${today}`}>预览</Link><LibraryControls courseId={course.id} archived={course.status === "archived"} /></div></article>)}</div></main></> }
