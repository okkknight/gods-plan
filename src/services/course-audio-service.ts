import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { appPath } from "@/lib/app-path";

export type CourseAudioSegment = { index: number; text: string; start: number; end: number; duration: number };

export function getCourseAudioUrl(slug: string): string | undefined {
  const audioPath = path.join(process.cwd(), "public", "audio", "courses", slug, "english.wav");
  return existsSync(audioPath) ? appPath(`/audio/courses/${slug}/english.wav`) : undefined;
}

export function getCourseAudioData(slug: string): { url: string; segments: CourseAudioSegment[] } | undefined {
  const url = getCourseAudioUrl(slug);
  const manifestPath = path.join(process.cwd(), "public", "audio", "courses", slug, "manifest.json");
  if (!url || !existsSync(manifestPath)) return undefined;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { segments?: CourseAudioSegment[] };
  if (!manifest.segments?.every((segment) => Number.isFinite(segment.start) && Number.isFinite(segment.end))) return undefined;
  return { url, segments: manifest.segments };
}
