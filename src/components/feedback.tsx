import type { ReactNode } from "react";

export function InlineFeedback({ children, tone = "warm" }: { children: ReactNode; tone?: "warm" | "accent" }) {
  return <div className={`inline-feedback inline-feedback-${tone}`} role="status">{children}</div>;
}
