import type { CompletedTask, NewCourseTask, ReviewTask } from "@/domain/scheduling/types";
import { SectionHeading } from "./ui";
import { TaskCard } from "./task-card";

type Task = ReviewTask | NewCourseTask | CompletedTask;

export function TaskGroup({ title, tasks, today, eyebrow }: { title: string; tasks: Task[]; today: string; eyebrow?: string }) {
  if (!tasks.length) return null;
  return <section className="task-group"><SectionHeading eyebrow={eyebrow} title={title} meta={<span>{tasks.length} 项</span>} />{tasks.map((task) => <TaskCard key={`${task.kind}-${task.kind === "completed" ? task.courseId : task.id}-${task.stage}`} task={task} today={today} completed={task.kind === "completed"} />)}</section>;
}
