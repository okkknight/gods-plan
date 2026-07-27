import { notFound } from "next/navigation";
import { CourseReader } from "@/components/course-reader";
import { getCourse } from "@/services/course-service";
import { getTodayInAppTimezone } from "@/domain/scheduling/date-utils";
import { getCourseAudioData } from "@/services/course-audio-service";

export default async function CoursePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ stage?: string; date?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const course = getCourse(Number(id));
  if (!course) notFound();
  const today = getTodayInAppTimezone();
  const parsedStage = Number(query.stage ?? (course.status === "queued" ? 0 : 1));
  const stage = Number.isInteger(parsedStage) ? parsedStage : 0;
  const canComplete = query.date === today && (course.status === "queued" || course.status === "active");
  return <CourseReader course={{ ...course, audio: getCourseAudioData(course.slug) }} stage={stage} canComplete={canComplete} />;
}
