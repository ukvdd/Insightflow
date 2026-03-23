// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "访谈洞察助手 | Interview Insight Tool",
  description: "AI-powered multi-perspective interview analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-bg-primary text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
