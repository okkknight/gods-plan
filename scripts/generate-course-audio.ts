import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { splitTextForSpeech } from "../src/domain/audio/text-segmentation";
import { inferSpeechPerformance } from "../src/domain/audio/speech-performance";

const root = process.cwd();
const courseArgumentIndex = process.argv.indexOf("--course");
const slug = courseArgumentIndex >= 0 ? process.argv[courseArgumentIndex + 1] : "modern-family-s01e01";
const generateAll = process.argv.includes("--all");
const referenceId = process.env.FISH_AUDIO_REFERENCE_ID ?? "76fcd904aa4b4a47af107686abd68248";
const apiKey = process.env.FISH_AUDIO_API_KEY ?? process.env.FISH_API_KEY;
const model = process.env.FISH_AUDIO_MODEL ?? "s2.1-pro-free";
const maxRetries = 4;
const cacheDir = path.join(root, "data", "audio-cache");

if (!apiKey) throw new Error("缺少 FISH_AUDIO_API_KEY 或 FISH_API_KEY");

async function synthesize(text: string, speed: number): Promise<Buffer> {
  let lastMessage = "未知错误";
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch("https://api.fish.audio/v1/tts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          model,
        },
        body: JSON.stringify({ text, reference_id: referenceId, format: "wav", temperature: 0.9, top_p: 0.92, prosody: { speed, volume: 1.5, normalize_loudness: true } }),
      });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
      lastMessage = `${response.status} ${await response.text()}`.slice(0, 500);
      if (![429, 500, 502, 503, 504].includes(response.status)) break;
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : String(error);
    }
    if (attempt < maxRetries) await new Promise((resolve) => setTimeout(resolve, Math.min(30_000, 2 ** attempt * 1_000)));
  }
  throw new Error(`Fish Audio 请求失败：${lastMessage}`);
}

function runFfmpeg(args: string[]) {
  const result = spawnSync("ffmpeg", ["-y", ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`FFmpeg 失败：${result.stderr}`);
}

async function generateCourse(courseSlug: string) {
  const outputDir = path.join(root, "public", "audio", "courses", courseSlug);
  const course = JSON.parse(await readFile(path.join(root, "content", "courses", `${courseSlug}.json`), "utf8"));
  const english = course.sections.find((section: { id: string }) => section.id === "english")?.paragraphs[0]?.english;
  if (!english) throw new Error(`课程没有英文内容：${courseSlug}`);

  const segments = splitTextForSpeech(english);
  const workDir = path.join(outputDir, ".work");
  await mkdir(workDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  const generated = [] as { index: number; text: string; ttsText: string; tags: string[]; speed: number; file: string; cached: boolean }[];

  for (const [index, text] of segments.entries()) {
    const performance = inferSpeechPerformance(text, index);
    const ttsText = `${performance.tags.join(" ")} ${text}`.trim();
    const key = createHash("sha256").update(JSON.stringify({ text: ttsText, referenceId, model, speed: performance.speed, volume: 1.5, temperature: 0.9, topP: 0.92, profile: "storyteller-v8" })).digest("hex");
    const cachedPath = path.join(cacheDir, `${key}.wav`);
    const segmentPath = path.join(workDir, `${String(index + 1).padStart(3, "0")}.wav`);
    const cached = existsSync(cachedPath);
    if (cached) await copyFile(cachedPath, segmentPath);
    else {
      console.log(`生成第 ${index + 1}/${segments.length} 段`);
      const audio = await synthesize(ttsText, performance.speed);
      await writeFile(cachedPath, audio);
      await copyFile(cachedPath, segmentPath);
    }
    generated.push({ index: index + 1, text, ttsText, tags: performance.tags, speed: performance.speed, file: path.relative(outputDir, segmentPath), cached });
  }

  const normalizedDir = path.join(workDir, "normalized");
  await mkdir(normalizedDir, { recursive: true });
  for (const item of generated) {
    runFfmpeg(["-i", path.join(workDir, `${String(item.index).padStart(3, "0")}.wav`), "-ar", "44100", "-ac", "1", "-sample_fmt", "s16", path.join(normalizedDir, `${String(item.index).padStart(3, "0")}.wav`)]);
  }
  const concatFile = path.join(workDir, "concat.txt");
  await writeFile(concatFile, generated.map((item) => `file '${path.join(normalizedDir, `${String(item.index).padStart(3, "0")}.wav`)}'`).join("\n"));
  const rawOutput = path.join(workDir, "combined.wav");
  runFfmpeg(["-f", "concat", "-safe", "0", "-i", concatFile, "-c", "copy", rawOutput]);
  await mkdir(outputDir, { recursive: true });
  runFfmpeg(["-i", rawOutput, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", "-sample_fmt", "s16", path.join(outputDir, "english.wav")]);
  await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify({ generated_at: new Date().toISOString(), course: courseSlug, mode: "english", model, reference_id: referenceId, performance_profile: "storyteller-v8", speed: 0.90, volume: 1.5, temperature: 0.9, top_p: 0.92, script_sha256: createHash("sha256").update(english).digest("hex"), segment_count: generated.length, segments: generated.map(({ index, text, ttsText, tags, speed, cached }) => ({ index, text, tts_text: ttsText, tags, speed, cached })), audio_file: "english.wav" }, null, 2));
  await rm(workDir, { recursive: true, force: true });
  console.log(`已生成 ${path.join(outputDir, "english.wav")}，共 ${generated.length} 段`);
}

async function main() {
  const courseSlugs = generateAll
    ? (await readdir(path.join(root, "content", "courses"))).filter((file) => file.endsWith(".json")).sort().map((file) => path.basename(file, ".json"))
    : [slug];
  console.log(`准备生成 ${courseSlugs.length} 篇课程，声音模型 ${referenceId}`);
  for (const courseSlug of courseSlugs) await generateCourse(courseSlug);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
