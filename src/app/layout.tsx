import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ベースのフォント (UI用)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 数字・ゲーム画面用の等幅フォント
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Between - Instant Reflex Game",
  description: "声で遊ぶ、数字の「間」を答える瞬間反射ゲーム",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        // 2つのフォント変数をセットし、デフォルトは font-sans (Inter)
        // ゲーム画面では font-mono (JetBrains Mono) が優先されるようにCSS変数を利用
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
