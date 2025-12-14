import type { Metadata } from "next";
// ❌ 削除: import { Shippori_Mincho } from "next/font/google";
import "./globals.css";

// ❌ 削除: const shippori = Shippori_Mincho({ ... });

export const metadata: Metadata = {
  title: "漢字合体 (Kanji Merge)",
  description: "漢字を触って発明する感覚的ロジックパズル",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      {/* ▼ 修正: shippori.variable を削除。
        "font-serif" クラスをつけるだけで、globals.css で設定したフォントが適用されます。
      */}
      <body className="font-serif bg-[#f5f2eb] text-[#3d3330]">{children}</body>
    </html>
  );
}
