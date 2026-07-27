import { NextResponse } from "next/server";
import { importCourse } from "@/domain/courses/import-course";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = importCourse(body.course, body.mode === "update" ? "update" : "create");
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "导入失败" }, { status: 400 });
  }
}
