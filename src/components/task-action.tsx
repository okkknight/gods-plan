"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { appPath } from "@/lib/app-path";

export function TaskAction({ kind, courseId, expectedStage }: { kind: "complete" | "undo"; courseId: number; expectedStage?: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run() {
    setBusy(true); setError("");
    const response = await fetch(appPath(`/api/${kind}`), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ courseId, expectedStage }) });
    const result = await response.json();
    if (!result.ok) setError(result.error); else router.push("/today");
    setBusy(false);
  }
  return <span className="action-wrap"><button className={`button ${kind === "complete" ? "button-primary" : "button-link"}`} disabled={busy} onClick={run}>{busy ? "处理中…" : kind === "complete" ? "完成本次学习" : "撤销完成"}</button>{error && <small className="error-text">{error}</small>}</span>;
}
