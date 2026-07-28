import { Navigation } from "@/components/navigation";
import { TaskCard } from "@/components/task-card";
import { getTodayDashboard } from "@/services/dashboard-service";
import { getTasksForDate } from "@/services/calendar-service";
import { getTodayInAppTimezone, isValidBusinessDate } from "@/domain/scheduling/date-utils";
import { DateNavigator } from "@/components/date-navigator";
import { STAGE_LABELS } from "@/domain/scheduling/constants";

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const today = getTodayInAppTimezone();
  const query = await searchParams;
  const selectedDate = query.date && isValidBusinessDate(query.date) ? query.date : today;
  if (selectedDate !== today) return <><Navigation /><main className="shell"><header className="page-heading"><div><p className="eyebrow">{selectedDate < today ? "真实学习记录" : "预计学习计划"}</p><h1>{selectedDate}</h1></div></header><DateNavigator currentDate={selectedDate} today={today} /><NonTodayOverview result={getTasksForDate(selectedDate, today)} selectedDate={selectedDate} /></main></>;
  const { tasks } = getTodayDashboard(today);
  const total = tasks.reviewTasks.length + (tasks.newCourse ? 1 : 0) + tasks.completedToday.length;
  const completed = tasks.completedToday.length;
  return <><Navigation /><main className="shell"><header className="page-heading"><div><p className="eyebrow">{new Intl.DateTimeFormat("zh-CN", { dateStyle: "full", timeZone: "Asia/Shanghai" }).format(new Date(`${today}T12:00:00+08:00`))}</p><h1>今天学什么</h1></div><div className="progress"><strong>{completed} / {total || 0}</strong><span>今日完成</span></div></header><TaskGroup title="今日复习" tasks={tasks.reviewTasks} today={today} />{tasks.newCourse && <section className="task-group"><div className="section-heading"><h2>今日新学</h2></div><TaskCard task={tasks.newCourse} today={today} /></section>}{tasks.completedToday.length > 0 && <section className="task-group"><div className="section-heading"><h2>今日已完成</h2><span>{completed} 项</span></div>{tasks.completedToday.map((task) => <TaskCard key={`${task.courseId}-${task.stage}`} task={task} today={today} completed />)}</section>}{total === 0 && <div className="empty">今天没有学习任务。</div>}<DateNavigator currentDate={today} today={today} /></main></>;
}

function TaskGroup({ title, tasks, today }: { title: string; tasks: any[]; today: string }) { if (!tasks.length) return null; return <section className="task-group"><div className="section-heading"><h2>{title}</h2><span>{tasks.length} 项</span></div>{tasks.map((task) => <TaskCard key={`${task.id}-${task.stage}`} task={task} today={today} />)}</section>; }

function NonTodayOverview({ result, selectedDate }: { result: Awaited<ReturnType<typeof getTasksForDate>>; selectedDate: string }) {
  if (result.mode === "past") return <section className="date-overview"><h2>{selectedDate} 完成记录</h2>{result.events.length ? result.events.map((event) => <div className="history-row" key={event.id}><span>{STAGE_LABELS[event.stage]}</span><strong>{event.course?.title ?? `课程 #${event.courseId}`}</strong><small>原计划 {event.scheduledDate} · 实际完成 {event.completedDate}</small></div>) : <div className="empty">这一天没有完成记录。</div>}</section>;
  if (result.mode === "today") return null;
  return <section className="date-overview"><div className="notice">以下为基于当前学习进度生成的预计计划。如果当前任务延期完成，未来安排会自动变化。</div><h2>{selectedDate} 预计任务</h2>{result.tasks.filter((task) => task.date === selectedDate).map((task) => <div className="history-row" key={`${task.courseId}-${task.stage}`}><span>{STAGE_LABELS[task.stage]}</span><strong>{task.title}</strong><small>{task.kind === "new" ? "预计新课" : "预计复习"}</small></div>)}</section>;
}
