import { readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

type Manifest = { audio_file?: string; [key: string]: unknown };

const root = process.cwd();
const audioRoot = path.join(root, "public", "audio", "courses");
const requestedSlugs = process.argv
  .flatMap((argument, index, args) => argument === "--course" ? [args[index + 1]] : [])
  .filter((slug): slug is string => Boolean(slug));

function convert(source: string, destination: string) {
  const result = spawnSync("ffmpeg", ["-y", "-i", source, "-vn", "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "96k", "-f", "mp3", destination], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`MP3 转换失败：${source}\n${result.stderr}`);
}

async function main() {
  const slugs = (await readdir(audioRoot))
    .filter((slug) => slug.startsWith("modern-family-") && (!requestedSlugs.length || requestedSlugs.includes(slug)))
    .sort();
  if (!slugs.length) throw new Error("没有找到待转换的课程音频目录");

  for (const slug of slugs) {
    const directory = path.join(audioRoot, slug);
    const manifestPath = path.join(directory, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
    const sourceFilename = manifest.audio_file ?? "english.wav";
    if (sourceFilename === "english.mp3" && existsSync(path.join(directory, sourceFilename))) {
      console.log(`${slug}: 已是 MP3，跳过`);
      continue;
    }

    const source = path.join(directory, sourceFilename);
    if (!existsSync(source)) throw new Error(`${slug}: 找不到源音频 ${sourceFilename}`);
    const sourceInfo = await stat(source);
    const destination = path.join(directory, "english.mp3");
    const temporaryDestination = `${destination}.tmp`;
    convert(source, temporaryDestination);
    await rename(temporaryDestination, destination);
    await writeFile(manifestPath, JSON.stringify({ ...manifest, audio_file: "english.mp3" }, null, 2));
    if (path.resolve(source) !== path.resolve(destination)) await rm(source);

    const destinationInfo = await stat(destination);
    console.log(`${slug}: MP3 96 kbps，${destinationInfo.size} bytes（原 ${sourceInfo.size} bytes）`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
