import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

type ManifestSegment = { index: number; text: string; tts_text: string; speed: number; duration?: number; start?: number; end?: number };
type Manifest = { model: string; reference_id: string; volume: number; temperature: number; top_p: number; performance_profile: string; segments: ManifestSegment[] };

const root = process.cwd();
const audioRoot = path.join(root, "public", "audio", "courses");
const cacheRoot = path.join(root, "data", "audio-cache");
const requestedSlugs = process.argv
  .flatMap((argument, index, argumentsList) => argument === "--course" ? [argumentsList[index + 1]] : [])
  .filter((slug): slug is string => Boolean(slug));

function cacheKey(manifest: Manifest, segment: ManifestSegment) {
  return createHash("sha256").update(JSON.stringify({
    text: segment.tts_text,
    referenceId: manifest.reference_id,
    model: manifest.model,
    speed: segment.speed,
    volume: manifest.volume,
    temperature: manifest.temperature,
    topP: manifest.top_p,
    profile: manifest.performance_profile,
  })).digest("hex");
}

function durationOf(file: string) {
  const result = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`无法读取音频时长：${file}\n${result.stderr}`);
  return Number(result.stdout.trim());
}

async function main() {
  const slugs = (await readdir(audioRoot)).filter((entry) => entry.startsWith("modern-family-") && (!requestedSlugs.length || requestedSlugs.includes(entry)));
  let updated = 0;
  for (const slug of slugs) {
    const manifestPath = path.join(audioRoot, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
    let cursor = 0;
    const segments = manifest.segments.map((segment) => {
      const cachePath = path.join(cacheRoot, `${cacheKey(manifest, segment)}.wav`);
      if (!existsSync(cachePath)) throw new Error(`缺少分段缓存：${slug} #${segment.index} ${cachePath}`);
      const duration = durationOf(cachePath);
      const enriched = { ...segment, duration, start: cursor, end: cursor + duration };
      cursor += duration;
      return enriched;
    });
    await writeFile(manifestPath, `${JSON.stringify({ ...manifest, segments, duration: cursor }, null, 2)}\n`);
    updated += 1;
    console.log(`${slug}: ${segments.length} segments, ${cursor.toFixed(3)}s`);
  }
  console.log(`updated ${updated} manifests`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
