import type { Metadata } from "next";
import { Shippori_Mincho } from "next/font/google"; // 和風フォントのインポート
import "./globals.css";

// フォントのロード設定
const shippori = Shippori_Mincho({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-shippori",
  display: "swap",
});

export const metadata: Metadata = {
  title: "漢字合体 (Kanji Merge)",
  description: "漢字を触って発明する感覚的ロジックパズル",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning: ブラウザ拡張機能等が属性を注入することによるHydrationエラーを抑制
  return (
    <html lang="ja" suppressHydrationWarning>
      {/* bodyにフォント変数を適用 */}
      <body
        className={`${shippori.variable} font-serif bg-[#f5f2eb] text-[#3d3330]`}
      >
        {children}
      </body>
    </html>
  );
}
