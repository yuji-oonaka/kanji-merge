"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useGameStore } from "../stores/store";
import { GameBoard } from "./GameBoard";
import { GoalSlot } from "./GoalSlot";
import { ResultOverlay } from "./ResultOverlay";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { THEMES } from "../constants/themes";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface StageViewProps {
  levelDisplay?: number;
  onNextLevel?: () => void;
}

export function StageView({ levelDisplay = 1, onNextLevel }: StageViewProps) {
  const currentJukugo = useGameStore((state) => state.currentJukugo);
  const isCleared = useGameStore((state) => state.isCleared);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const theme = THEMES[currentTheme];

  useEffect(() => {
    if (isCleared) {
      if (soundEngine && typeof soundEngine.playClear === "function") {
        soundEngine.playClear();
      }
    }
  }, [isCleared]);

  return (
    // h-screen で高さを画面いっぱいに固定
    <div
      className={`relative w-full h-screen overflow-hidden flex flex-col transition-colors duration-500 ${theme.colors.background}`}
    >
      {/* --- ヘッダーエリア (固定高さ) --- */}
      <div className="w-full p-4 flex justify-between items-start z-30 shrink-0">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className={`
              backdrop-blur border px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1 w-fit
              ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
            `}
          >
            <span>🏠</span> 戻る
          </Link>
          <div
            className={`font-bold tracking-widest text-xs pl-1 ${theme.colors.sub} opacity-70`}
          >
            STAGE {levelDisplay}
          </div>
        </div>

        <div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* --- ゴールエリア (固定高さ・内容は可変だがshrinkさせない) --- */}
      <div className="w-full flex justify-center z-10 shrink-0">
        <GoalSlot target={currentJukugo} />
      </div>

      {/* --- メイン盤面 (残りの高さを埋める) --- */}
      <div className="flex-1 flex items-center justify-center z-20 pb-4 min-h-0">
        {/* GameBoard内でスクロールが必要な場合はそこで対応 */}
        <GameBoard />
      </div>

      {/* --- クリア画面 --- */}
      <AnimatePresence>
        {isCleared && <ResultOverlay onNextLevel={onNextLevel} />}
      </AnimatePresence>
    </div>
  );
}
