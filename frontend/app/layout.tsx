import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Kanban Todo",
  description: "AI-powered Kanban task board with local Ollama",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
