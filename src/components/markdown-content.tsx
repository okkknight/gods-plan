import { useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { alignCueBlanks } from "@/domain/courses/cue-reveal";

type InlineOptions = {
  blankIndex: { value: number };
  revealTexts?: Array<string | null>;
  revealedBlanks: Set<number>;
  onToggleBlank: (index: number) => void;
};

function inlineMarkdown(text: string, options: InlineOptions): ReactNode[] {
  const pattern = /(＿＿+|_+|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    if (/^_+$/.test(part) || /^＿＿+$/.test(part)) {
      const blankIndex = options.blankIndex.value;
      options.blankIndex.value += 1;
      const answer = options.revealTexts?.[blankIndex];
      if (answer == null) return <span key={index} className="cue-blank" style={{ "--blank-width": `${Math.max(2.2, part.length * 0.55)}em` } as CSSProperties} aria-label="填空" />;
      const revealed = options.revealedBlanks.has(blankIndex);
      return <button key={index} type="button" className={`cue-blank${revealed ? " cue-blank--revealed" : ""}`} aria-label={revealed ? "隐藏答案" : "显示答案"} aria-pressed={revealed} onClick={() => options.onToggleBlank(blankIndex)}>
        {revealed ? <span className="cue-revealed">{answer}</span> : <span className="cue-blank-placeholder" style={{ "--blank-width": `${Math.max(2.2, part.length * 0.55)}em` } as CSSProperties} />}
      </button>;
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{inlineMarkdown(part.slice(2, -2), options)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{inlineMarkdown(part.slice(1, -1), options)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return part;
  });
}

export function MarkdownContent({ content, revealSource }: { content: string; revealSource?: string }) {
  const [revealedBlanks, setRevealedBlanks] = useState<Set<number>>(() => new Set());
  const revealTexts = revealSource ? alignCueBlanks(content, revealSource) : undefined;
  const inlineOptions = { blankIndex: { value: 0 }, revealTexts, revealedBlanks, onToggleBlank: (index: number) => setRevealedBlanks((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  }) } satisfies InlineOptions;
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (/^---+$/.test(line)) { blocks.push(<hr key={index} />); index += 1; continue; }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const Heading = `h${Math.min(heading[1].length, 6)}` as ElementType;
      blocks.push(<Heading key={index}>{inlineMarkdown(heading[2], inlineOptions)}</Heading>);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(<li key={index}>{inlineMarkdown(lines[index].replace(/^\s*[-*]\s+/, ""), inlineOptions)}</li>);
        index += 1;
      }
      blocks.push(<ul key={`list-${index}`}>{items}</ul>);
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,6})\s+|^[-*]\s+|^---+$/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{inlineMarkdown(paragraph.join(" "), inlineOptions)}</p>);
  }

  return <div className="markdown-content">{blocks}</div>;
}
