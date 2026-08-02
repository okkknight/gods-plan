"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  const links = [{ href: "/today", label: "今日", glyph: "✦" }, { href: "/calendar", label: "日历", glyph: "◷" }, { href: "/library", label: "课程库", glyph: "▤" }] as const;
  return <nav className="nav"><Link href="/today" className="brand"><span className="brand-mark">G</span><span className="brand-copy"><strong>God's Plan</strong><small>English study, one day at a time</small></span></Link><div className="nav-links">{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""} aria-current={pathname === link.href ? "page" : undefined}><span className="nav-glyph" aria-hidden="true">{link.glyph}</span><span>{link.label}</span></Link>)}</div></nav>;
}
