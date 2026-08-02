import { describe, expect, it } from "vitest";
import { parseCourseMarkdown } from "@/domain/courses/markdown-parser";
import { courseSchema } from "@/domain/courses/course-schema";

describe("course markdown import", () => {
  it("maps the three learning modes into non-empty aligned sections", () => {
    const markdown = `# S01E01 — Pilot

## 1. 中文剧情描述

三个家庭在重要时刻成为一家人。

## 2. Spoken English 标准版

Three families become one when it matters.

## 3. Cue Version

Three families become one when it ______.
`;
    const course = parseCourseMarkdown(markdown, 1);
    expect(course.slug).toBe("modern-family-s01e01");
    expect(course.title).toBe("Pilot");
    expect(course.sections).toHaveLength(3);
    expect(course.sections.every((section) => section.paragraphs.length === 1)).toBe(true);
    expect(course.sections.every((section) => section.paragraphs[0].chinese && section.paragraphs[0].english && section.paragraphs[0].cue)).toBe(true);
    expect(courseSchema.parse(course)).toEqual(course);
  });

  it("rejects duplicate section and paragraph ids", () => {
    expect(() => courseSchema.parse({
      schemaVersion: 1, slug: "bad", title: "Bad", orderIndex: 1,
      sections: [{ id: "same", paragraphs: [{ id: "p", chinese: "中", english: "en", cue: "cue" }] }, { id: "same", paragraphs: [{ id: "p2", chinese: "中", english: "en", cue: "cue" }] }],
    })).toThrow();
  });
});
