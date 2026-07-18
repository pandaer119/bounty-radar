import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bounty Radar · AI Agent 赏金决策台",
  description: "核验、评分并推进真实 AI Agent × Web3 赏金机会。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
