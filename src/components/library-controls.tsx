"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LibraryControls({ courseId, archived }: { courseId?: number; archived?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function importFile(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const course = JSON.parse(await file.text());
      const response = await fetch("/api/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ course, mode: "create" }) });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error);
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "导入失败"); }
    setBusy(false);
  }
  async function toggleArchive() {
    if (!courseId) return;
    setBusy(true); setError("");
    const response = await fetch("/api/archive", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ courseId, action: archived ? "unarchive" : "archive" }) });
    const result = await response.json();
    if (!result.ok) setError(result.error); else router.refresh();
    setBusy(false);
  }
  if (!courseId) return <label className="button button-primary import-button">{busy ? "导入中…" : "导入课程 JSON"}<input type="file" accept="application/json,.json" hidden onChange={(event) => importFile(event.target.files?.[0])} /></label>;
  return <span className="library-controls"><button className="button button-link" disabled={busy} onClick={toggleArchive}>{archived ? "取消归档" : "归档"}</button>{error && <small className="error-text">{error}</small>}</span>;
}
