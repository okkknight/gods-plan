import Link from "next/link";
import type { ReviewTask, NewCourseTask, CompletedTask } from "@/domain/scheduling/types";
import { STAGE_LABELS } from "@/domain/scheduling/constants";
import { TaskAction } from "./task-action";

export function TaskCard({ task, today, completed = false }: { task: ReviewTask | NewCourseTask | CompletedTask; today: string; completed?: boolean }) {
  const isCompleted = completed || task.kind === "completed";
  const stage = task.kind === "completed" ? task.stage : task.stage;
  const courseId = task.kind === "completed" ? task.courseId : task.id;
  const title = task.kind === "completed" ? task.course.title : task.title;
  const status = task.kind === "new" ? "今日新课" : isCompleted ? "今天已完成" : task.kind === "review" && task.overdueDays > 0 ? `逾期 ${task.overdueDays} 天` : "今天到期";
  return <article className={`task-card ${isCompleted ? "task-done" : ""}`}>
    <div className="task-main"><div className="task-meta"><span className="episode">{task.kind === "completed" ? task.course.slug.replace("modern-family-", "").toUpperCase() : task.slug.replace("modern-family-", "").toUpperCase()}</span><span className={`pill ${status.includes("逾期") ? "pill-warning" : ""}`}>{status}</span></div><h3>{title}</h3><p>{STAGE_LABELS[stage]} · 原计划 {task.kind === "completed" ? task.scheduledDate : task.scheduledDate}</p></div>
    <div className="task-action"><Link className="button button-secondary" href={`/course/${courseId}?stage=${stage}&date=${today}`}>{isCompleted ? "查看课程" : "开始练习"}</Link>{isCompleted && <TaskAction kind="undo" courseId={courseId} />}</div>
  </article>;
}
