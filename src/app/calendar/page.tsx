import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { getTasksForDate } from "@/services/calendar-service";
import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";
import { STAGE_LABELS } from "@/domain/scheduling/constants";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const today = getTodayInAppTimezone(); const query = await searchParams; const date = query.date ?? today; const result = getTasksForDate(date, today);
  return <><Navigation /><main className="shell"><header className="page-heading"><div><p className="eyebrow">学习记录与计划</p><h1>日历</h1></div><form className="date-form"><input type="date" name="date" defaultValue={date} min={"2020-01-01"} max={"2030-12-31"} /><button className="button button-secondary">查看</button></form></header>{result.mode === "future" && <div className="notice">以下为基于当前学习进度生成的预计计划。如果当前任务延期完成，未来安排会自动变化。</div>}{result.mode === "past" ? <section className="calendar-list"><h2>{date} 的真实记录</h2>{result.events.length ? result.events.map((event) => <div className="history-row" key={event.id}><span>{STAGE_LABELS[event.stage]}</span><strong>课程 #{event.courseId}</strong><small>原计划 {event.scheduledDate} · 实际完成 {event.completedDate}</small></div>) : <div className="empty">这一天没有完成记录。</div>}</section> : result.mode === "today" ? <section className="calendar-list"><h2>今天的任务</h2><Link className="text-link" href="/today">回到今日总览 →</Link></section> : <section className="calendar-list"><h2>{date} 的预计任务</h2>{result.tasks.filter((task) => task.date === date).map((task) => <div className="history-row" key={`${task.courseId}-${task.stage}`}><span>{STAGE_LABELS[task.stage]}</span><strong>{task.title}</strong><small>{task.kind === "new" ? "预计新课" : "预计复习"}</small></div>)}</section>}</main></>;
}
