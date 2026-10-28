export type CourseGroup = { id: string; name: string; orderIndex: number };

export function inferCourseGroup(course: { slug: string; series?: string | null }): CourseGroup {
  if (course.slug.startsWith("modern-family-")) return { id: "modern-family", name: "摩登家庭 · 第一季", orderIndex: 1 };
  if (course.slug.startsWith("steve-jobs-stanford-2005-")) return { id: "steve-jobs-stanford-2005", name: "乔布斯 · 斯坦福毕业演讲", orderIndex: 2 };
  const series = course.series?.trim();
  return series ? { id: `series:${series}`, name: series, orderIndex: 3 } : { id: "unassigned", name: "其他课程", orderIndex: 4 };
}
