"use client";

import Link from "next/link";
import type { ReviewTask, NewCourseTask, CompletedTask } from "@/domain/scheduling/types";
import { STAGE_LABELS } from "@/domain/scheduling/constants";
import { TaskAction } from "./task-action";
import { StatusBadge } from "./ui";

export function TaskCard({ task, today, completed = false }: { task: ReviewTask | NewCourseTask | CompletedTask; today: string; completed?: boolean }) {
  const isCompleted = completed || task.kind === "completed";
  const stage = task.kind === "completed" ? task.stage : task.stage;
  const courseId = task.kind === "completed" ? task.courseId : task.id;
  const title = task.kind === "completed" ? task.course.title : task.title;
  const status = task.kind === "new" ? "今日新课" : isCompleted ? "今天已完成" : "今日复习";
  const card = <Link className={`task-card ${isCompleted ? "task-done" : ""}`} href={`/course/${courseId}?stage=${stage}&date=${today}`} aria-label={`${task.kind === "completed" ? task.course.slug.replace("modern-family-", "").toUpperCase() : task.slug.replace("modern-family-", "").toUpperCase()} ${title} ${status}`}>
    <div className="task-main"><div className="task-meta"><span className="episode">{task.kind === "completed" ? task.course.slug.replace("modern-family-", "").toUpperCase() : task.slug.replace("modern-family-", "").toUpperCase()}</span><StatusBadge tone={isCompleted ? "complete" : task.kind === "new" ? "accent" : "neutral"}>{status}</StatusBadge></div><h3>{title}</h3><p>{STAGE_LABELS[stage]}</p></div>
    <span className="task-card-arrow" aria-hidden="true">↗</span>
  </Link>;
  if (!isCompleted) return card;
  return <article className="task-card-shell">{card}<div className="task-card-undo"><TaskAction kind="undo" courseId={courseId} /></div></article>;
}
