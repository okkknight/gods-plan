import Link from "next/link";
import type { SchedulableCourse } from "@/domain/scheduling/types";
import { STAGE_LABELS } from "@/domain/scheduling/constants";
import { LibraryControls } from "./library-controls";
import { StatusBadge } from "./ui";

const statusCopy = { queued: "未开始", active: "学习中", completed: "已完成", archived: "已归档" } as const;

export function LibraryRow({ course, today }: { course: SchedulableCourse; today: string }) {
  const status = statusCopy[course.status];
  const tone = course.status === "completed" ? "complete" : course.status === "archived" ? "warm" : course.status === "active" ? "accent" : "neutral";
  return <article className="library-row"><div className="library-row-main"><span className="episode">{course.slug.replace("modern-family-", "").toUpperCase()}</span><h2>{course.title}</h2><p>{course.status === "archived" ? "已从当前计划中移出" : course.status === "completed" ? "已完成全部复习" : course.status === "queued" ? "准备开始" : `${STAGE_LABELS[course.currentStage ?? 0]} · 下次 ${course.nextDueDate ?? "—"}`}</p></div><div className="library-row-actions"><StatusBadge tone={tone}>{status}</StatusBadge><Link className="button button-secondary" href={`/course/${course.id}?stage=${course.currentStage ?? 0}&date=${today}`}>进入课程</Link><LibraryControls courseId={course.id} archived={course.status === "archived"} /></div></article>;
}
