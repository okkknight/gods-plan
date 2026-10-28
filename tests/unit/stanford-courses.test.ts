import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { courseSchema } from "@/domain/courses/course-schema";
import { alignCueBlanks } from "@/domain/courses/cue-reveal";

const baseline = JSON.parse(fs.readFileSync("content/speeches/steve-jobs-stanford-2005/recitation-baseline-v1.json", "utf8"));
const fingerprint = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

describe("Stanford original-recording courses", () => {
  for (let part = 1; part <= 5; part++) {
    it(`keeps part ${part} within word limits and aligns its three modes with audio`, () => {
      const slug = `steve-jobs-stanford-2005-part-${part}`;
      const course = courseSchema.parse(JSON.parse(fs.readFileSync(path.resolve("content/courses", `${slug}.json`), "utf8")));
      const manifest = JSON.parse(fs.readFileSync(path.resolve("public/audio/courses", slug, "manifest.json"), "utf8"));
      const paragraphs = course.sections[1].paragraphs;
      const original = baseline.lessons.find((item: { slug: string }) => item.slug === slug);
      expect(fingerprint(paragraphs.map((p) => p.english).join(" ").replace(/\s+/g, " ").trim())).toBe(original.englishSha256);
      expect(fingerprint(fs.readFileSync(path.resolve("public/audio/courses", slug, "english.mp3")))).toBe(original.mp3Sha256);
      expect(manifest.duration).toBe(original.duration);
      expect(manifest.source).toEqual(original.source);
      expect(paragraphs.length).toBeGreaterThan(original.originalSegments);
      const wordCount = paragraphs.map((p) => p.english).join(" ").match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g)!.length;
      expect(wordCount).toBeGreaterThanOrEqual(400);
      expect(wordCount).toBeLessThanOrEqual(500);
      expect(course.sections).toHaveLength(3);
      expect(course.sections[0].paragraphs).toEqual(paragraphs);
      expect(course.sections[2].paragraphs).toEqual(paragraphs);
      expect(manifest.source.kind).toBe("original-recording");
      expect(manifest.segments.map((s: { text: string }) => s.text)).toEqual(paragraphs.map((p) => p.english));
      expect(manifest.segments[0].start).toBe(0);
      let previousEnd = 0;
      for (const segment of manifest.segments) {
        expect(segment.start).toBe(previousEnd);
        expect(segment.end).toBeGreaterThan(segment.start);
        previousEnd = segment.end;
      }
      expect(previousEnd).toBe(manifest.duration);
      for (const paragraph of paragraphs) {
        expect(paragraph.english.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g)!.length).toBeLessThanOrEqual(45);
        expect(alignCueBlanks(paragraph.cue, paragraph.english)).not.toContain(null);
      }
    });
  }
  it("splits lesson two's calligraphy paragraph into three complete thought groups", () => {
    const manifest = JSON.parse(fs.readFileSync("public/audio/courses/steve-jobs-stanford-2005-part-2/manifest.json", "utf8"));
    expect(manifest.segments.slice(1, 4).map((s: { text: string }) => s.text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g)!.length)).toEqual([27, 26, 23]);
    expect(manifest.segments[1].text).toMatch(/^Reed College/);
    expect(manifest.segments[2].text).toMatch(/^Because I had dropped out/);
    expect(manifest.segments[3].text).toMatch(/^I learned about serif/);
  });
});
