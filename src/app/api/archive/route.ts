import { NextResponse } from "next/server";
import { archiveCourse, unarchiveCourse } from "@/services/course-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "unarchive") unarchiveCourse(Number(body.courseId)); else archiveCourse(Number(body.courseId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "操作失败" }, { status: 400 });
  }
}
