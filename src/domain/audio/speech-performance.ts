export type SpeechPerformance = {
  tags: string[];
  speed: number;
};

export function inferSpeechPerformance(text: string, index: number): SpeechPerformance {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  if (index === 0) tags.push("[warm storytelling]");
  else if (/the second family|the third family|at the same time|meanwhile|later,/.test(lower)) tags.push("[conversational transition]");
  else if (/overall|the final scene|in the end/.test(lower)) tags.push("[thoughtful conclusion]");
  else if (/heartbroken|insecure|nervous|judging|misunderstood/.test(lower)) tags.push("[empathetic storytelling]");
  else if (/but |however|instead|accidentally/.test(lower)) tags.push("[lightly amused]");
  return { tags, speed: 0.95 };
}
