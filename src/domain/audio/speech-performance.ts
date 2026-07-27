export type SpeechPerformance = {
  tags: string[];
  speed: number;
};

export function inferSpeechPerformance(text: string, index: number): SpeechPerformance {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  const bySegment = [
    "[warm lively storyteller]", "[friendly conversational storyteller]", "[warm narrative tension]", "[playful storyteller]",
    "[animated engaging narration]", "[bright storytelling emphasis]", "[warm smooth story transition]", "[sympathetic storyteller]",
    "[warm reflective storyteller]", "[warm narrative tension]", "[genuinely delighted storyteller]", "[tender warm conclusion]",
  ];
  if (bySegment[index]) tags.push(bySegment[index]);
  else if (/overall|the final scene|in the end/.test(lower)) tags.push("[thoughtful conclusion]");
  else if (/heartbroken|insecure|nervous|judging|misunderstood/.test(lower)) tags.push("[empathetic]");
  return { tags, speed: 0.95 };
}
