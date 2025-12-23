"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/features/game-board/stores/store";
import { BADGES } from "@/features/collection/data/badges";
import { THEMES } from "@/features/game-board/constants/themes";

export default function TracesPage() {
  const currentTheme = useGameStore((state) => state.currentTheme);
  const unlockedCount = useGameStore((state) => state.unlockedBadgeCount);
  const theme = THEMES[currentTheme];

  // 全収集チェック
  const isComplete = unlockedCount >= BADGES.length;

  return (
    <div
      className={`min-h-dvh w-full flex flex-col items-center ${theme.colors.background} ${theme.colors.text}`}
    >
      {/* ヘッダー: 極めてシンプルに */}
      <header className="w-full h-16 flex items-center px-6 sticky top-0 bg-inherit/80 backdrop-blur z-10">
        <Link
          href="/"
          className={`
            px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm flex items-center gap-2
            ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
          `}
        >
          <span>←</span>
          <span className="text-xs">戻る</span>
        </Link>
        {/* タイトルすら出さない、あるいは極めて薄く */}
        <h1 className="ml-auto font-serif text-sm opacity-30 tracking-widest">
          足跡
        </h1>
      </header>

      {/* メイン: バッジ一覧 */}
      <main className="flex-1 w-full max-w-3xl p-6 pb-20 flex flex-col items-center">
        {/* バッジグリッド */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4 mb-16">
          {BADGES.map((badge, index) => {
            const isUnlocked = index < unlockedCount;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }} // 順番にふわっと出る
                className={`
                  aspect-square w-10 md:w-12 rounded-lg flex items-center justify-center border
                  ${
                    isUnlocked
                      ? `${theme.colors.partBg} ${theme.colors.partBorder} shadow-sm`
                      : "bg-black/5 border-transparent"
                  }
                `}
              >
                {isUnlocked ? (
                  <span
                    className={`
                    font-serif font-bold text-lg md:text-xl
                    ${badge.isMessage ? theme.colors.accent : theme.colors.text}
                  `}
                  >
                    {badge.char}
                  </span>
                ) : (
                  // 未取得時は小さな点だけ
                  <span className="text-black/5 text-[8px]">●</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 隠しメッセージエリア */}
        {/* ひとつでもバッジがあれば、薄くメッセージを表示し始める */}
        <div className="mt-8 text-center h-20 flex items-center justify-center">
          <p
            className={`font-serif text-sm md:text-base leading-loose transition-all duration-1000 ${theme.colors.sub}`}
          >
            {isComplete ? (
              // コンプリート時のメッセージ
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="opacity-60"
              >
                遊んでくれて、ありがとう。
              </motion.span>
            ) : (
              // 未コンプリート時: 獲得したひらがなだけを繋げて表示（あるいは伏字）
              // ここではあえて「何も言わない」か「静かな一言」にする
              <span className="opacity-30 text-xs">
                {unlockedCount > 0 ? "......" : ""}
              </span>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
