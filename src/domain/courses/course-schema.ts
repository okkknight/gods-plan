import { z } from "zod";

const paragraphSchema = z.object({ id: z.string().min(1), chinese: z.string().min(1), english: z.string().min(1), cue: z.string().min(1) });
const sectionSchema = z.object({ id: z.string().min(1), heading: z.string().nullable().optional(), paragraphs: z.array(paragraphSchema).min(1) });

export const courseSchema = z.object({
  schemaVersion: z.literal(1), slug: z.string().regex(/^[a-z0-9-]+$/), series: z.string().nullable().optional(), season: z.number().int().positive().optional(), episode: z.number().int().positive().optional(), title: z.string().min(1), orderIndex: z.number().int().nonnegative(), sections: z.array(sectionSchema).min(1),
}).superRefine((course, ctx) => {
  const sectionIds = new Set<string>();
  course.sections.forEach((section, sectionIndex) => {
    if (sectionIds.has(section.id)) ctx.addIssue({ code: "custom", path: ["sections", sectionIndex, "id"], message: "Duplicate section id" });
    sectionIds.add(section.id);
    const paragraphIds = new Set<string>();
    section.paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraphIds.has(paragraph.id)) ctx.addIssue({ code: "custom", path: ["sections", sectionIndex, "paragraphs", paragraphIndex, "id"], message: "Duplicate paragraph id" });
      paragraphIds.add(paragraph.id);
    });
  });
});

export type CourseInput = z.infer<typeof courseSchema>;
