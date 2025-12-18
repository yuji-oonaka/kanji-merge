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
    <div
      className={`fixed inset-0 w-full h-dvh overflow-hidden flex flex-col touch-none overscroll-none ${theme.colors.background}`}
    >
      {/* --- ヘッダー --- */}
      <div className="w-full h-14 shrink-0 flex justify-between items-center px-4 z-30 relative">
        <div className="flex gap-2 items-center pointer-events-auto">
          <Link
            href="/"
            className={`
              backdrop-blur border px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-1
              ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
            `}
          >
            <span>🏠</span>
          </Link>
          <div
            className={`font-bold tracking-widest text-xs pl-1 ${theme.colors.sub} opacity-70`}
          >
            STAGE {levelDisplay}
          </div>
        </div>
        <div className="pointer-events-auto">
          <ThemeSwitcher />
        </div>
      </div>

      {/* --- メインコンテンツ --- */}
      {/* PC修正: 
         - max-w-7xl: FullHD向けに幅を緩和
         - h-full を削除し flex-1 で余白を自動調整。コンテンツを中央に「ぎゅっ」と寄せます。
      */}
      <div className="flex-1 w-full max-w-7xl mx-auto min-h-0 flex flex-col landscape:flex-row items-center justify-center p-2 pb-safe-offset gap-4 landscape:gap-12 lg:gap-20">
        
        {/* エリア1: お題 (文章スロット) */}
        {/* PC修正: 
           - h-full を削除。これにより「ヒントボタン」が画面最下部ではなく、文章のすぐ下に配置されます。
           - justify-center で上下中央寄せ。
        */}
        <div className="flex-1 w-full flex items-center justify-center p-2 landscape:p-0 landscape:justify-end">
          <div className="w-full max-w-2xl landscape:max-w-lg lg:landscape:max-w-xl flex flex-col justify-center">
            <GoalSlot target={currentJukugo} />
          </div>
        </div>

        {/* エリア2: ゲーム盤面 */}
        {/* PC修正:
           - lg:landscape:w-[540px] xl:landscape:w-[600px]: 盤面を少し大きくし、FullHDでの「こじんまり感」を解消
        */}
        <div className="shrink-0 w-full landscape:w-auto h-[45dvh] landscape:h-full lg:landscape:h-auto lg:landscape:w-[540px] xl:landscape:w-[600px] p-2 landscape:p-4 landscape:pl-0 flex items-start landscape:items-center justify-center landscape:justify-start">
          <div className="aspect-square h-full max-h-full w-auto max-w-full shadow-xl rounded-xl">
            <GameBoard />
          </div>
        </div>
      </div>

      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-linear-to-t from-black/5 to-transparent landscape:hidden" />

      {/* クリア画面 */}
      <AnimatePresence>
        {isCleared && <ResultOverlay onNextLevel={onNextLevel} />}
      </AnimatePresence>
    </div>
  );
}