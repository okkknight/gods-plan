import Link from "next/link";

export function Navigation() {
  return <nav className="nav"><div className="brand"><span className="brand-mark">G</span><span>God's Plan</span></div><div className="nav-links"><Link href="/today">今日</Link><Link href="/calendar">日历</Link><Link href="/library">课程库</Link></div></nav>;
}
