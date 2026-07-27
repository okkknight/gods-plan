"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { ReviewTask, NewCourseTask, CompletedTask } from "@/domain/scheduling/types";
import { STAGE_LABELS } from "@/domain/scheduling/constants";
import { appPath } from "@/lib/app-path";
import { TaskAction } from "./task-action";

export function TaskCard({ task, today, completed = false }: { task: ReviewTask | NewCourseTask | CompletedTask; today: string; completed?: boolean }) {
  const isCompleted = completed || task.kind === "completed";
  const stage = task.kind === "completed" ? task.stage : task.stage;
  const courseId = task.kind === "completed" ? task.courseId : task.id;
  const title = task.kind === "completed" ? task.course.title : task.title;
  const status = task.kind === "new" ? "今日新课" : isCompleted ? "今天已完成" : task.kind === "review" && task.overdueDays > 0 ? `逾期 ${task.overdueDays} 天` : "今天到期";
  const courseHref = `/course/${courseId}?stage=${stage}&date=${today}`;
  const openCourse = () => { window.location.href = appPath(courseHref); };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCourse();
    }
  };
  return <article className={`task-card ${isCompleted ? "task-done" : ""}`} role="link" tabIndex={0} onClick={openCourse} onKeyDown={handleKeyDown}>
    <div className="task-main"><div className="task-meta"><span className="episode">{task.kind === "completed" ? task.course.slug.replace("modern-family-", "").toUpperCase() : task.slug.replace("modern-family-", "").toUpperCase()}</span><span className={`pill ${status.includes("逾期") ? "pill-warning" : ""}`}>{status}</span></div><h3>{title}</h3><p>{STAGE_LABELS[stage]} · 原计划 {task.kind === "completed" ? task.scheduledDate : task.scheduledDate}</p></div>
    <div className="task-action"><Link className="button button-secondary" href={`/course/${courseId}?stage=${stage}&date=${today}`} onClick={(event) => event.stopPropagation()}>{isCompleted ? "查看课程" : "开始练习"}</Link>{isCompleted && <span onClick={(event) => event.stopPropagation()}><TaskAction kind="undo" courseId={courseId} /></span>}</div>
  </article>;
}
