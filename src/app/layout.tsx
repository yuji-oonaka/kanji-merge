import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "漢字合体 (Kanji Merge)",
  description: "漢字を触って発明する感覚的ロジックパズル",
  icons: {
    icon: "/favicon.ico",
  },
};

// ▼ 追加: これがないとスマホでレイアウトが崩れます
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // ズーム操作を禁止してアプリライクにする
  themeColor: "#f5f2eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-serif bg-[#f5f2eb] text-[#3d3330] antialiased">
        {children}
      </body>
    </html>
  );
}
