import { existsSync } from "node:fs";
import path from "node:path";

export function getCourseAudioUrl(slug: string): string | undefined {
  const audioPath = path.join(process.cwd(), "public", "audio", "courses", slug, "english.wav");
  return existsSync(audioPath) ? `/audio/courses/${slug}/english.wav` : undefined;
}
