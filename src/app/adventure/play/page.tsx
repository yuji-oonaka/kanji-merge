"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { AREA1_STAGES } from "@/features/adventure/data/stages_area1";
import { AdventureStage } from "@/features/adventure/types";
import {
  useAdventureStore,
  AdventureTheme,
} from "@/features/adventure/stores/adventureStore";
import { soundEngine } from "@/lib/sounds/SoundEngine";

// ==========================================
// Constants & Styles
// ==========================================
const FADE_DURATION = 0.6;
type StageState = "reading" | "selecting" | "solved";

// テーマごとの配色定義
const THEME_STYLES = {
  paper: {
    bg: "bg-[#f5f2eb]",
    text: "text-[#3d3330]",
    subText: "opacity-60",
    headerBtn: "bg-white/50 border-[#3d3330]/20 hover:bg-white text-[#3d3330]",
    slotBorder: "border-[#3d3330]/30",
    accent: "text-[#d94a38]", // 朱色
    chip: {
      bg: "bg-white",
      border: "border-stone-200",
      text: "text-[#3d3330]",
      hover: "hover:border-[#d94a38]/50 hover:shadow-md",
    },
    nextBtn:
      "bg-[#3d3330] text-[#f5f2eb] border border-[#3d3330]/20 hover:bg-[#594a46]",
    fadeOverlay: "from-[#f5f2eb] to-transparent",
  },
  dark: {
    bg: "bg-[#1c1c1e]", // 深いチャコールグレー
    text: "text-[#e5e5e5]", // オフホワイト
    subText: "opacity-50",
    headerBtn: "bg-white/10 border-white/10 hover:bg-white/20 text-[#e5e5e5]",
    slotBorder: "border-white/30",
    accent: "text-[#ff9f0a]", // 落ち着いた金/橙色
    chip: {
      bg: "bg-[#2c2c2e]",
      border: "border-[#3a3a3c]",
      text: "text-[#e5e5e5]",
      hover: "hover:border-[#ff9f0a]/50 hover:shadow-white/10",
    },
    nextBtn:
      "bg-[#ff9f0a] text-[#1c1c1e] border border-[#ff9f0a]/20 hover:bg-[#ffb340]",
    fadeOverlay: "from-[#1c1c1e] to-transparent",
  },
};

// ==========================================
// Helper Components
// ==========================================

/**
 * 漢字チップ
 */
const KanjiChip = ({
  char,
  onClick,
  disabled,
  theme,
}: {
  char: string;
  onClick: () => void;
  disabled: boolean;
  theme: AdventureTheme;
}) => {
  const styles = THEME_STYLES[theme].chip;
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-12 md:w-14 md:h-14 rounded-lg shadow-sm
        flex items-center justify-center
        text-xl md:text-2xl font-serif font-bold
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${styles.bg} ${styles.border} ${styles.text} ${styles.hover} border
      `}
    >
      {char}
    </motion.button>
  );
};

/**
 * 文章表示エリア
 */
const TextDisplay = ({
  stage,
  isSolved,
  onSlotClick,
  theme,
}: {
  stage: AdventureStage;
  isSolved: boolean;
  onSlotClick?: () => void;
  theme: AdventureTheme;
}) => {
  const styles = THEME_STYLES[theme];

  return (
    <div
      className={`text-lg md:text-xl leading-loose tracking-wide font-serif whitespace-pre-wrap transition-colors duration-500 ${styles.text}`}
    >
      {stage.textParts.map((part, index) => {
        const isSlotPosition = index === 1;

        if (isSlotPosition && stage.correct) {
          return (
            <span key={index} className="inline-block mx-1 align-baseline">
              <motion.button
                onClick={onSlotClick}
                className={`
                  relative min-w-10 h-10 border-b-2 transition-colors duration-500
                  flex items-center justify-center text-2xl font-bold px-1
                  ${
                    isSolved
                      ? `border-transparent ${styles.accent}` // 正解時
                      : `${styles.slotBorder} text-transparent animate-pulse` // 未正解
                  }
                `}
              >
                {isSolved ? stage.correct : "?"}
              </motion.button>
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

// ==========================================
// Main Page Component
// ==========================================
export default function AdventurePlayPage() {
  const router = useRouter();

  // ストアからテーマ情報も取得
  const { currentStageIndex, completeStage, theme, setTheme } =
    useAdventureStore();
  const currentStyles = THEME_STYLES[theme];

  const [isMounted, setIsMounted] = useState(false);
  const [stageState, setStageState] = useState<StageState>("reading");

  useEffect(() => {
    setIsMounted(true);
    soundEngine.playRiverAmbience();
    return () => {};
  }, []);

  const currentStage = useMemo(() => {
    if (!isMounted) return null;
    if (currentStageIndex >= AREA1_STAGES.length) {
      return AREA1_STAGES[AREA1_STAGES.length - 1];
    }
    return AREA1_STAGES[currentStageIndex];
  }, [currentStageIndex, isMounted]);

  const choices = useMemo(() => {
    if (!currentStage || !currentStage.correct) return [];
    const all = [currentStage.correct, ...currentStage.distractors];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [currentStage]);

  useEffect(() => {
    if (currentStage) {
      if (currentStageIndex >= AREA1_STAGES.length) {
        setStageState("solved");
        return;
      }
      if (!currentStage.correct) {
        setStageState("solved");
      } else {
        setStageState("selecting");
      }
    }
  }, [currentStage, currentStageIndex]);

  // --- Handlers ---

  const handleChoiceClick = useCallback(
    (char: string) => {
      if (stageState !== "selecting" || !currentStage) return;

      if (char === currentStage.correct) {
        soundEngine.playStamp();
        setStageState("solved");
      }
    },
    [currentStage, stageState]
  );

  const handleNext = useCallback(() => {
    if (currentStageIndex < AREA1_STAGES.length) {
      soundEngine.playSelect();
      completeStage(currentStageIndex);
    }

    if (currentStageIndex >= AREA1_STAGES.length - 1) {
      soundEngine.playGoal();
      router.push("/adventure");
    }
  }, [currentStageIndex, completeStage, router]);

  const handleBack = () => {
    soundEngine.playSelect();
    router.push("/adventure");
  };

  const toggleTheme = () => {
    soundEngine.playSelect();
    setTheme(theme === "paper" ? "dark" : "paper");
  };

  if (!isMounted || !currentStage) return null;

  const isAllClear = currentStageIndex >= AREA1_STAGES.length;

  return (
    <main
      className={`relative w-full h-dvh overflow-hidden flex flex-col transition-colors duration-500 ${currentStyles.bg}`}
    >
      {/* 1. Header */}
      <header className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center">
        <button
          onClick={handleBack}
          className={`
            px-4 py-2 rounded-full border transition-all text-sm font-serif font-bold flex items-center gap-1 shadow-sm
            ${currentStyles.headerBtn}
          `}
        >
          <span>←</span> 戻る
        </button>

        <div className="flex items-center gap-4">
          <div
            className={`text-xs font-serif font-bold tracking-widest ${currentStyles.text} ${currentStyles.subText}`}
          >
            Level {currentStage.level}
          </div>

          {/* テーマ切り替えボタン */}
          <button
            onClick={toggleTheme}
            className={`
               w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-sm
               ${currentStyles.headerBtn}
             `}
            aria-label="テーマ切り替え"
          >
            {theme === "paper" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 max-w-2xl mx-auto w-full z-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION }}
            className="w-full py-20 flex flex-col items-center"
          >
            {/* 文章 */}
            <div className="w-full mb-10">
              <TextDisplay
                stage={currentStage}
                isSolved={stageState === "solved"}
                theme={theme}
              />
            </div>

            {/* インタラクションエリア */}
            <div className="w-full h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {/* 選択肢 */}
                {stageState === "selecting" && choices.length > 0 && (
                  <motion.div
                    key="choices"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-4 flex-wrap justify-center"
                  >
                    {choices.map((char, idx) => (
                      <KanjiChip
                        key={`${char}-${idx}`}
                        char={char}
                        onClick={() => handleChoiceClick(char)}
                        disabled={false}
                        theme={theme}
                      />
                    ))}
                  </motion.div>
                )}

                {/* 次へボタン */}
                {stageState === "solved" && (
                  <motion.div
                    key="next-button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <button
                      onClick={handleNext}
                      className={`
                        group relative px-8 py-3 rounded-full 
                        font-serif font-bold text-sm tracking-[0.2em]
                        transition-all duration-300 shadow-lg
                        ${currentStyles.nextBtn}
                      `}
                    >
                      {currentStageIndex >= AREA1_STAGES.length - 1
                        ? "旅を終える"
                        : "進む →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* フッター装飾 (背景色に追従してフェード) */}
      <div
        className={`fixed bottom-0 left-0 w-full h-32 bg-linear-to-t ${currentStyles.fadeOverlay} pointer-events-none z-10 transition-colors duration-500`}
      />
    </main>
  );
}
