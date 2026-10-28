"use client";

import { useState } from "react";
import { appPath } from "@/lib/app-path";
import { InlineFeedback } from "./feedback";

export function CourseGroupSwitcher({ groups, activeGroupId }: { groups: { id: string; name: string; courseCount: number }[]; activeGroupId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function switchGroup(groupId: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch(appPath("/api/course-groups"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ groupId }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "切换失败");
      window.location.assign(appPath("/library"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "切换失败");
      setBusy(false);
    }
  }
  return <div className="course-group-switcher"><label htmlFor="active-course-group">当前学习的课程组</label><select id="active-course-group" value={activeGroupId} disabled={busy} onChange={(event) => void switchGroup(event.target.value)}>{groups.map((group) => <option key={group.id} value={group.id}>{group.name} · {group.courseCount} 课</option>)}</select><p>{busy ? "正在切换课程组…" : "今日任务和日历按当前组安排，各组学习进度分别保留。"}</p>{error && <InlineFeedback>{error}</InlineFeedback>}</div>;
}
