const blankPattern = /(＿＿+|_+)/g;

export function alignCueBlanks(cue: string, english: string): Array<string | null> {
  const normalizedCue = cue.replace(/\r\n/g, "\n");
  const normalizedEnglish = english.replace(/\r\n/g, "\n");
  const blanks = [...normalizedCue.matchAll(blankPattern)];
  if (!blanks.length) return [];

  const result: Array<string | null> = [];
  const visiblePrefix = normalizedCue.slice(0, blanks[0].index).trimEnd();
  const prefixStart = visiblePrefix ? normalizedEnglish.indexOf(visiblePrefix) : 0;
  if (prefixStart < 0) return blanks.map(() => null);
  let englishCursor = prefixStart + visiblePrefix.length;
  let groupStart = 0;

  const resolveGroup = (groupEnd: number) => {
    const lastBlank = blanks[groupEnd];
    const nextBlank = blanks[groupEnd + 1];
    const literal = normalizedCue.slice(lastBlank.index! + lastBlank[0].length, nextBlank?.index ?? normalizedCue.length).trim();
    const anchorStart = literal ? normalizedEnglish.indexOf(literal, englishCursor) : normalizedEnglish.length;
    if (anchorStart < englishCursor) {
      result.push(...Array.from({ length: groupEnd - groupStart + 1 }, () => null));
      return false;
    }

    const hidden = normalizedEnglish.slice(englishCursor, anchorStart).trim();
    const words = hidden ? hidden.split(/[^\p{L}\p{N}]+/u).filter(Boolean) : [];
    const groupSize = groupEnd - groupStart + 1;
    if (groupSize === 1) result.push(hidden || null);
    else if (words.length === groupSize) result.push(...words);
    else result.push(...Array.from({ length: groupSize }, () => null));

    englishCursor = anchorStart + literal.length;
    return true;
  };

  for (let index = 0; index < blanks.length; index += 1) {
    const nextBlank = blanks[index + 1];
    const onlySeparatorsBetween = nextBlank && /^[^\p{L}\p{N}]*$/u.test(normalizedCue.slice(blanks[index].index! + blanks[index][0].length, nextBlank.index));
    if (onlySeparatorsBetween) continue;
    if (!resolveGroup(index)) {
      result.push(...Array.from({ length: blanks.length - index - 1 }, () => null));
      return result;
    }
    groupStart = index + 1;
  }

  return result;
}
