import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

type Segment = { index: number; start: number; end: number; duration: number };
type Manifest = { segments?: Segment[]; duration?: number; audio_file?: string };

const root = process.cwd();
const audioRoot = path.join(root, "public", "audio", "courses");
const requestedSlugs = process.argv
  .flatMap((argument, index, args) => argument === "--course" ? [args[index + 1]] : [])
  .filter((slug): slug is string => Boolean(slug));

function durationOf(file: string) {
  const result = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`无法读取音频时长：${file}\n${result.stderr}`);
  return Number(result.stdout.trim());
}

async function main() {
  const slugs = (await readdir(audioRoot)).filter((entry) => entry.startsWith("modern-family-") && (!requestedSlugs.length || requestedSlugs.includes(entry)));
  if (!slugs.length) throw new Error("没有找到待校验的课程音频目录");
  for (const slug of slugs) {
    const dir = path.join(audioRoot, slug);
    const manifestPath = path.join(dir, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
    const audioPath = path.join(dir, manifest.audio_file ?? "english.wav");
    if (!existsSync(audioPath)) throw new Error(`${slug}: 缺少 ${audioPath}`);
    if (!manifest.segments?.length) throw new Error(`${slug}: manifest 没有分段`);
    let previousEnd = 0;
    for (const segment of manifest.segments) {
      if (![segment.start, segment.end, segment.duration].every(Number.isFinite) || segment.start < previousEnd || segment.end <= segment.start) {
        throw new Error(`${slug}: 分段 ${segment.index} 缺少有效的 start/end/duration`);
      }
      previousEnd = segment.end;
    }
    const audioDuration = durationOf(audioPath);
    if (Math.abs(audioDuration - previousEnd) > 0.1 || (manifest.duration && Math.abs(manifest.duration - audioDuration) > 0.1)) {
      throw new Error(`${slug}: manifest ${previousEnd.toFixed(3)}s 与音频 ${audioDuration.toFixed(3)}s 不一致`);
    }
    console.log(`${slug}: ${manifest.segments.length} segments, ${audioDuration.toFixed(3)}s OK`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
