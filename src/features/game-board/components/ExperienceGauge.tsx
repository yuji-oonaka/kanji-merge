"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../stores/store";
import { STAGES_PER_BADGE, BADGES } from "@/features/collection/data/badges";
import { THEMES } from "../constants/themes";
import { soundEngine } from "@/lib/sounds/SoundEngine";

export function ExperienceGauge() {
  const currentTheme = useGameStore((state) => state.currentTheme);
  const gaugeCurrent = useGameStore((state) => state.gaugeCurrent);
  const unlockedBadgeCount = useGameStore((state) => state.unlockedBadgeCount);
  const isCleared = useGameStore((state) => state.isCleared);
  const resolveBadge = useGameStore((state) => state.resolveBadge);

  const theme = THEMES[currentTheme];
  const progress = gaugeCurrent / STAGES_PER_BADGE;
  const isFull = gaugeCurrent >= STAGES_PER_BADGE;

  // 演出用ステート
  const [showLevelUp, setShowLevelUp] = useState(false);

  // 満タン かつ リザルトを閉じた後(プレイ画面) なら演出開始
  useEffect(() => {
    if (isFull && !isCleared) {
      // 少し待ってから演出開始（画面遷移の直後なので）
      const timer = setTimeout(() => {
        setShowLevelUp(true);
        // 音を鳴らすならここで (控えめな達成音)
        // soundEngine.playBadgeGet(); // 必要なら追加
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFull, isCleared]);

  // 演出終了後にデータを更新
  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => {
        resolveBadge(); // Store更新 (ゲージ0, バッジ+1)
        setShowLevelUp(false);
      }, 2000); // 2秒間見せる
      return () => clearTimeout(timer);
    }
  }, [showLevelUp, resolveBadge]);

  // 次に獲得する（あるいは今獲得した）バッジ文字
  const currentBadgeChar = BADGES[unlockedBadgeCount]?.char || "？";

  return (
    <Link
      href="/traces"
      className="block cursor-pointer active:opacity-70 transition-opacity"
    >
      <div className="flex items-center gap-2 select-none">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`${theme.colors.sub} opacity-20`}
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={88}
              strokeDashoffset={88 * (1 - progress)}
              className={`${theme.colors.accent} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>

          {/* 中央の表示：通常時は数字、レベルアップ時は文字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showLevelUp ? (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className={`font-serif font-bold text-base ${theme.colors.accent}`}
                >
                  {currentBadgeChar}
                </motion.span>
              ) : (
                <motion.span
                  key="count"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-[10px] font-bold ${theme.colors.sub}`}
                >
                  {unlockedBadgeCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Link>
  );
}
