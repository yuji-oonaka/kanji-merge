"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useGameStore } from "../stores/store";
import { FloatingPart } from "./FloatingPart";
import { GoalSlot } from "./GoalSlot";
import { ResultOverlay } from "./ResultOverlay";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { THEMES } from "../constants/themes"; // 追加
import { ThemeSwitcher } from "./ThemeSwitcher"; // 追加

interface StageViewProps {
  levelDisplay?: number;
  onNextLevel?: () => void;
}

export function StageView({ levelDisplay = 1, onNextLevel }: StageViewProps) {
  const parts = useGameStore((state) => state.parts);
  const currentJukugo = useGameStore((state) => state.currentJukugo);
  const isCleared = useGameStore((state) => state.isCleared);
  const currentTheme = useGameStore((state) => state.currentTheme); // 追加

  const theme = THEMES[currentTheme]; // 現在のテーマ設定を取得

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isCleared) {
      if (soundEngine && typeof soundEngine.playClear === "function") {
        soundEngine.playClear();
      }
    }
  }, [isCleared]);

  return (
    // ▼ 背景色をテーマに応じて変更
    <div
      className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${theme.colors.background}`}
    >
      {/* --- ヘッダーエリア --- */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Link
            href="/"
            className={`
              backdrop-blur border px-3 py-1 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1 w-fit
              ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
            `}
          >
            <span>🏠</span> 戻る
          </Link>
          <div
            className={`font-bold tracking-widest text-sm pl-1 ${theme.colors.sub}`}
          >
            STAGE {levelDisplay}
          </div>
        </div>

        {/* ▼ テーマ切り替えボタンを配置 */}
        <div className="pointer-events-auto">
          <ThemeSwitcher />
        </div>
      </div>

      {/* --- ゴールエリア --- */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <GoalSlot target={currentJukugo} />
        </div>
      </div>

      {/* --- プレイフィールド --- */}
      <div className="absolute inset-0 z-20">
        {parts.map((part) => {
          let displayX = part.x;
          let displayY = part.y;

          if (part.x <= 1 && part.y <= 1 && dimensions.width > 0) {
            displayX = part.x * dimensions.width;
            displayY = part.y * dimensions.height;

            if (displayX < 40) displayX = 40;
            if (displayX > dimensions.width - 40)
              displayX = dimensions.width - 40;
          }

          return (
            <FloatingPart key={part.id} part={part} x={displayX} y={displayY} />
          );
        })}
      </div>

      {/* 背景装飾（テーマが和紙のときだけ乗算テクスチャをかける等の調整も可） */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply z-0" />

      {/* --- クリア画面 --- */}
      <AnimatePresence>
        {isCleared && <ResultOverlay onNextLevel={onNextLevel} />}
      </AnimatePresence>
    </div>
  );
}
