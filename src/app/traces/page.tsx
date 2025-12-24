"use client";

// ★修正: useRouter をインポート
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/features/game-board/stores/store";
import { BADGES } from "@/features/collection/data/badges";
import { THEMES } from "@/features/game-board/constants/themes";

export default function TracesPage() {
  const currentTheme = useGameStore((state) => state.currentTheme);
  const unlockedCount = useGameStore((state) => state.unlockedBadgeCount);
  const theme = THEMES[currentTheme];

  // ★追加
  const router = useRouter();

  const isFirstLoopComplete = unlockedCount >= 40;
  const isSecondLoopComplete = unlockedCount >= 80;

  return (
    <div
      className={`min-h-dvh w-full flex flex-col items-center ${theme.colors.background} ${theme.colors.text}`}
    >
      {/* ヘッダー */}
      <header className="w-full h-16 flex items-center px-6 sticky top-0 bg-inherit/80 backdrop-blur z-10">
        {/* ★修正: Linkではなくbuttonにし、onClickで戻る処理を実行 */}
        <button
          onClick={() => router.back()}
          className={`
            px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm flex items-center gap-2
            transition-transform active:scale-95
            ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
          `}
        >
          <span>←</span>
          <span className="text-xs">戻る</span>
        </button>
        <h1 className="ml-auto font-serif text-sm opacity-30 tracking-widest">
          足跡
        </h1>
      </header>

      {/* ... (以下、変更なし) ... */}
      <main className="flex-1 w-full max-w-4xl p-6 pb-20 flex flex-col items-center">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4 mb-16">
          {BADGES.map((badge, index) => {
            const isUnlocked = index < unlockedCount;
            const isSecondLoop = index >= 40;
            if (!isUnlocked && isSecondLoop) return null;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index % 10) * 0.05 }}
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
                  <span className="text-black/5 text-[8px]">●</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center h-20 flex flex-col items-center justify-center gap-2">
          <p
            className={`font-serif transition-all duration-1000 ${theme.colors.sub}`}
          >
            {isSecondLoopComplete ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs opacity-40 tracking-widest"
              >
                （いまも、同じ時間の中にいます）
              </motion.span>
            ) : isFirstLoopComplete ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm md:text-base opacity-60 leading-loose"
              >
                遊んでくれて、ありがとう。
              </motion.span>
            ) : (
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
