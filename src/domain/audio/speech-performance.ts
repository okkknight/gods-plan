export type SpeechPerformance = {
  tags: string[];
  speed: number;
};

export function inferSpeechPerformance(text: string, index: number): SpeechPerformance {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  const bySegment = [
    "[warm engaging storyteller]", "[conversational storytelling]", "[gentle narrative tension]", "[gentle humor in the story]",
    "[clear engaging narration]", "[brief storytelling emphasis]", "[smooth story transition]", "[empathetic storytelling]",
    "[reflective storytelling]", "[gentle narrative tension]", "[delighted storytelling]", "[warm reflective storyteller]",
  ];
  if (bySegment[index]) tags.push(bySegment[index]);
  else if (/overall|the final scene|in the end/.test(lower)) tags.push("[thoughtful conclusion]");
  else if (/heartbroken|insecure|nervous|judging|misunderstood/.test(lower)) tags.push("[empathetic]");
  return { tags, speed: 0.95 };
}
