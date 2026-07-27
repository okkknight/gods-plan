import { Navigation } from "@/components/navigation";
import { TaskCard } from "@/components/task-card";
import { getTodayDashboard } from "@/services/dashboard-service";

export default function TodayPage() {
  const { today, tasks } = getTodayDashboard();
  const total = tasks.overdueReviews.length + tasks.dueReviews.length + (tasks.newCourse ? 1 : 0) + tasks.completedToday.length;
  const completed = tasks.completedToday.length;
  return <><Navigation /><main className="shell"><header className="page-heading"><div><p className="eyebrow">{new Intl.DateTimeFormat("zh-CN", { dateStyle: "full", timeZone: "Asia/Shanghai" }).format(new Date(`${today}T12:00:00+08:00`))}</p><h1>今天学什么</h1></div><div className="progress"><strong>{completed} / {total || 0}</strong><span>今日完成</span></div></header><p className="intro">把今天的一小段练习完成，复习会自己继续向前。</p><TaskGroup title="逾期复习" tasks={tasks.overdueReviews} today={today} empty="没有逾期复习" /><TaskGroup title="今日复习" tasks={tasks.dueReviews} today={today} empty="今天没有到期复习" />{tasks.newCourse && <section className="task-group"><div className="section-heading"><h2>今日新学</h2><span>每天一篇</span></div><TaskCard task={tasks.newCourse} today={today} /></section>}<section className="task-group"><div className="section-heading"><h2>今日已完成</h2><span>{completed} 项</span></div>{tasks.completedToday.length ? tasks.completedToday.map((task) => <TaskCard key={`${task.courseId}-${task.stage}`} task={task} today={today} completed />) : <div className="empty">今天还没有完成记录。</div>}</section></main></>;
}

function TaskGroup({ title, tasks, today, empty }: { title: string; tasks: any[]; today: string; empty: string }) { return <section className="task-group"><div className="section-heading"><h2>{title}</h2><span>{tasks.length} 项</span></div>{tasks.length ? tasks.map((task) => <TaskCard key={`${task.id}-${task.stage}`} task={task} today={today} />) : <div className="empty">{empty}</div>}</section>; }
