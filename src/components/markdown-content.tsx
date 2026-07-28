import type { CSSProperties, ElementType, ReactNode } from "react";

function inlineMarkdown(text: string): ReactNode[] {
  const pattern = /(＿＿+|_{3,}|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    if (/^_{3,}$/.test(part)) return <span key={index} className="cue-blank" style={{ "--blank-width": `${Math.max(3, part.length * 0.55)}em` } as CSSProperties} aria-label="填空" />;
    if (/^＿＿+$/.test(part)) return <span key={index} className="cue-blank" style={{ "--blank-width": `${Math.max(2.2, part.length * 0.55)}em` } as CSSProperties} aria-label="填空" />;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{inlineMarkdown(part.slice(2, -2))}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{inlineMarkdown(part.slice(1, -1))}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return part;
  });
}

export function MarkdownContent({ content }: { content: string }) {
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
      blocks.push(<Heading key={index}>{inlineMarkdown(heading[2])}</Heading>);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(<li key={index}>{inlineMarkdown(lines[index].replace(/^\s*[-*]\s+/, ""))}</li>);
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
    blocks.push(<p key={`paragraph-${index}`}>{inlineMarkdown(paragraph.join(" "))}</p>);
  }

  return <div className="markdown-content">{blocks}</div>;
}
