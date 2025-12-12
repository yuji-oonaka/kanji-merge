"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
// ★修正: store.ts を直接指定するように変更
import { useGameStore } from "../stores/store";
import { FloatingPart } from "./FloatingPart";
import { GoalSlot } from "./GoalSlot";
import { ResultOverlay } from "./ResultOverlay";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { JukugoDefinition } from "@/features/kanji-core/types";

interface StageViewProps {
  levelDisplay?: number;
  onNextLevel?: () => void;
}

export function StageView({ levelDisplay = 1, onNextLevel }: StageViewProps) {
  const parts = useGameStore((state) => state.parts);
  const currentJukugo = useGameStore((state) => state.currentJukugo);
  const isCleared = useGameStore((state) => state.isCleared);

  // 画面サイズ
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // クライアントサイドでのみ実行
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
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f2eb]">
      {/* --- ヘッダーエリア --- */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Link
            href="/"
            className="bg-white/80 backdrop-blur border border-stone-300 px-3 py-1 rounded-full text-sm font-bold text-stone-600 shadow-sm hover:bg-stone-100 transition-colors flex items-center gap-1 w-fit"
          >
            <span>🏠</span> 戻る
          </Link>
          <div className="text-stone-400 font-bold tracking-widest text-sm pl-1">
            STAGE {levelDisplay}
          </div>
        </div>
        <div></div>
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

      <div className="absolute inset-0 opacity-10 pointer-events-none bg-stone-200 mix-blend-multiply z-0" />

      {/* --- クリア画面 (ResultOverlay) --- */}
      <AnimatePresence>
        {isCleared && <ResultOverlay onNextLevel={onNextLevel} />}
      </AnimatePresence>
    </div>
  );
}
