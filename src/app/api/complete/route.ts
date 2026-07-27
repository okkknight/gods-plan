import { NextResponse } from "next/server";
import { completeCourseStage } from "@/services/study-service";

export async function POST(request: Request) {
  try { const body = await request.json(); return NextResponse.json({ ok: true, result: completeCourseStage(Number(body.courseId), Number(body.expectedStage)) }); }
  catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "操作失败" }, { status: 400 }); }
}
