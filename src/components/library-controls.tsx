"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { appPath } from "@/lib/app-path";
import { InlineFeedback } from "./feedback";

export function LibraryControls({ courseId, archived }: { courseId?: number; archived?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"create" | "update">("create");
  async function importFile(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const course = JSON.parse(await file.text());
      const response = await fetch(appPath("/api/import"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ course, mode }) });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error);
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "导入失败"); }
    setBusy(false);
  }
  async function toggleArchive() {
    if (!courseId || (!archived && !window.confirm("确定要归档这门课程吗？"))) return;
    setBusy(true); setError("");
      const response = await fetch(appPath("/api/archive"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ courseId, action: archived ? "unarchive" : "archive" }) });
    const result = await response.json();
    if (!result.ok) setError(result.error); else router.refresh();
    setBusy(false);
  }
  if (!courseId) return <span className="import-controls"><select aria-label="导入模式" value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="create">新课程</option><option value="update">更新已有课程</option></select><label className="button button-primary import-button">{busy ? "导入中…" : "导入课程 JSON"}<input type="file" accept="application/json,.json" hidden onChange={(event) => importFile(event.target.files?.[0])} /></label>{error && <InlineFeedback>{error}</InlineFeedback>}</span>;
  return <span className="library-controls"><button className="button button-link" disabled={busy} onClick={toggleArchive}>{archived ? "取消归档" : "归档"}</button>{error && <InlineFeedback>{error}</InlineFeedback>}</span>;
}
