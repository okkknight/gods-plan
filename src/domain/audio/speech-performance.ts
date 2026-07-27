export type SpeechPerformance = {
  tags: string[];
  speed: number;
};

export function inferSpeechPerformance(text: string, index: number): SpeechPerformance {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  const bySegment = [
    "[a warm storyteller inviting the listener into the story]", "[a natural conversational storyteller]", "[a storyteller building gentle suspense]", "[a storyteller with playful humor]",
    "[an animated storyteller explaining the scene]", "[a storyteller emphasizing the surprising turn]", "[a storyteller smoothly moving to the next story]", "[a storyteller with warm empathy]",
    "[a thoughtful storyteller reflecting on the character]", "[a storyteller building gentle suspense]", "[a storyteller warmly enjoying the happy moment]", "[a heartfelt storyteller bringing the story home]",
  ];
  if (bySegment[index]) tags.push(bySegment[index]);
  else if (/overall|the final scene|in the end/.test(lower)) tags.push("[thoughtful conclusion]");
  else if (/heartbroken|insecure|nervous|judging|misunderstood/.test(lower)) tags.push("[empathetic]");
  return { tags, speed: 0.90 };
}
