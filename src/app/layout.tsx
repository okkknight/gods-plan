import "./globals.css";

export const metadata = { title: "God's Plan", description: "God's Plan 英语口语学习与复习计划", icons: { icon: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
