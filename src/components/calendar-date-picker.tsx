"use client";

import { useRouter } from "next/navigation";
import { appPath } from "@/lib/app-path";

export function CalendarDatePicker({ date }: { date: string }) {
  const router = useRouter();
  return <input aria-label="选择日期" type="date" defaultValue={date} min="2020-01-01" max="2030-12-31" onChange={(event) => {
    if (event.currentTarget.value) router.push(`${appPath("/calendar")}?date=${event.currentTarget.value}` as never);
  }} />;
}
