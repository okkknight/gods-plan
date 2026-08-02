import type { ButtonHTMLAttributes, ReactNode } from "react";

export type StatusTone = "accent" | "neutral" | "warm" | "complete";

export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  return <span className={`status-badge status-badge-${tone}`}>{children}</span>;
}

export function SectionHeading({ eyebrow, title, meta }: { eyebrow?: string; title: string; meta?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="section-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{meta && <div className="section-meta">{meta}</div>}</div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="empty-state"><span className="empty-state-mark" aria-hidden="true">✦</span><strong>{title}</strong>{description && <p>{description}</p>}</div>;
}

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button {...props} className={`icon-button ${className}`.trim()} aria-label={label}>{children}</button>;
}
