export function courseLabel(slug: string): string {
  const episode = slug.match(/^modern-family-(s\d+e\d+)$/);
  if (episode) return episode[1].toUpperCase();
  const speech = slug.match(/^steve-jobs-stanford-2005-part-(\d+)$/);
  if (speech) return `乔布斯 · 第 ${Number(speech[1])} 课`;
  return slug.replace(/-/g, " ");
}
