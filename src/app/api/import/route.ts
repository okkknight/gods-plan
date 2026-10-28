import { NextResponse } from "next/server";
import { importCourse } from "@/domain/courses/import-course";
import { getActiveCourseGroup } from "@/services/course-group-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const group = getActiveCourseGroup();
    if (body.groupId !== group.id) throw new Error("课程组已经切换，请刷新课程库后再导入。");
    const result = importCourse(body.course, body.mode === "update" ? "update" : "create", group.id);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "导入失败" }, { status: 400 });
  }
}
