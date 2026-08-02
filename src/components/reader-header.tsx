export function ReaderHeader({ episode, title, stage }: { episode: string; title: string; stage: number }) {
  return <header className="reader-header"><p className="reader-stage"><span className="reader-stage-dot" aria-hidden="true" />{stage === 0 ? "一次学习" : `第 ${stage} 次复习`}</p><h1>{title}</h1><p className="reader-context">{episode} · 按自己的节奏读一遍，再听一遍</p></header>;
}
