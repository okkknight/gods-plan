const sentenceBoundary = /(?<=[.!?])\s+/;

function splitWords(text: string, maxCharacters: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && current.length + word.length + 1 > maxCharacters) {
      chunks.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function splitTextForSpeech(text: string, maxCharacters = 280): string[] {
  const paragraphs = text
    .replace(/\*{1,2}/g, "")
    .replace(/\n---\s*$/g, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.flatMap((paragraph) => {
    const sentences = paragraph.split(sentenceBoundary).filter(Boolean);
    const chunks: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      if (sentence.length > maxCharacters) {
        if (current) chunks.push(current.trim());
        current = "";
        chunks.push(...splitWords(sentence, maxCharacters));
      } else if (current && current.length + sentence.length + 1 > maxCharacters) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }
    if (current) chunks.push(current.trim());
    return chunks;
  });
}
