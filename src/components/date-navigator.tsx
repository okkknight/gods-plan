"use client";

import { useRouter } from "next/navigation";
import { addBusinessDays } from "@/domain/scheduling/date-utils";

export function DateNavigator({ currentDate, today }: { currentDate: string; today: string }) {
  const router = useRouter();
  function move(days: number) {
    router.push(`/today?date=${addBusinessDays(currentDate, days)}`);
  }
  return <div className="date-navigator" aria-label="切换学习日期"><button className="date-nav-button" aria-label="前一天" onClick={() => move(-1)}>← <span>前一天</span></button><div className="date-nav-current"><strong>{currentDate === today ? "今天" : currentDate}</strong>{currentDate !== today && <button className="today-link" onClick={() => router.push("/today")}>回到今天</button>}</div><button className="date-nav-button" aria-label="后一天" onClick={() => move(1)}><span>后一天</span> →</button></div>;
}
