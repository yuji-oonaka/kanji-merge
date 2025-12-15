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
      className={`fixed inset-0 w-full h-dvh overflow-hidden flex flex-col transition-colors duration-500 ${theme.colors.background}`}
    >
      {/* --- ヘッダーエリア --- */}
      <div className="w-full p-4 flex justify-between items-start z-30 shrink-0 h-16">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className={`
              backdrop-blur border px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-1 w-fit
              ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
            `}
          >
            <span>🏠</span> 戻る
          </Link>
          <div
            className={`font-bold tracking-widest text-[10px] pl-1 ${theme.colors.sub} opacity-70`}
          >
            STAGE {levelDisplay}
          </div>
        </div>
        <div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* --- メインエリア (レスポンシブレイアウト分岐) --- */}
      {/* 縦画面 (Portrait): 上下に配置 (flex-col)
          横画面 (Landscape): 左右に配置 (landscape:flex-row) 
      */}
      <div className="flex-1 flex flex-col landscape:flex-row w-full min-h-0 relative">
        {/* エリア1: お題 (上部 or 左側) */}
        <div className="flex-1 flex items-center justify-center w-full landscape:w-1/2 landscape:h-full px-2 overflow-y-auto min-h-0">
          <div className="w-full py-4 landscape:py-0">
            <GoalSlot target={currentJukugo} />
          </div>
        </div>

        {/* エリア2: ゲーム盤面 (下部固定 or 右側) */}
        <div className="flex-none landscape:flex-1 w-full landscape:w-1/2 landscape:h-full px-4 pb-8 pt-2 landscape:pb-4 landscape:pt-4 z-20 flex justify-center items-end landscape:items-center bg-linear-to-t from-black/10 to-transparent landscape:from-transparent landscape:bg-none">
          <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl landscape:max-w-lg landscape:aspect-square">
            <GameBoard />
          </div>
        </div>
      </div>

      {/* --- クリア画面 --- */}
      <AnimatePresence>
        {isCleared && <ResultOverlay onNextLevel={onNextLevel} />}
      </AnimatePresence>
    </div>
  );
}
