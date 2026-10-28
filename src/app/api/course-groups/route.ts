import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setActiveCourseGroup } from "@/services/course-group-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    setActiveCourseGroup(body.groupId);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "切换失败" }, { status: 400 });
  }
}
